import WebAuthnStrategy from "@forwardemail/passport-fido2-webauthn";
import base64url from 'base64url';
import passport from "passport";
import {Express, Request, Response} from "express";
import {getUser, getUserFromRegistrationToken, saveUserPassword, updateUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";
import * as crypto from "crypto";
import {RequestHandler} from "express-serve-static-core";
import {body, param, validationResult} from "express-validator";
import {BaseError, ParameterError} from "../errors";
import {User} from "../users/user";
import dayjs from "dayjs";

export function useAuthenticationAPIs(app: Express, store: WebAuthnStrategy.SessionChallengeStore, isLoggedIn: RequestHandler) {
    // mock authentication endpoint (for testing)
    if (process.env.NODE_ENV === 'test') {
        app.get('/auth/mock',
            passport.authenticate('mock'),
            function (req: Request, res: Response) {
                const prevSession = req.session;
                req.session.regenerate((_err) => {
                    Object.assign(req.session, prevSession);
                    res.json({
                        loggedIn: true,
                        user: req.user
                    });
                });
            },
            function (_err: any, _req: Request, res: Response) {
                res.json({loggedIn: false});
            }
        );

        return
    }

    // real authentication endpoints

    // login
    app.post('/api/sessions', function (req, res, next) {
        passport.authenticate('local', (err: any, user: User, info: string) => {
            if (err) return next(err);
            if (!user) {
                // display wrong login messages
                return res.status(401).json(info);
            }
            if (!user.active) {
                return res.status(401).json("L'utente non è attivo!");
            }
            // success, perform the login
            req.login(user, (err) => {
                if (err) return next(err);

                // req.user contains the authenticated user, we send all the user info back
                const prevSession = req.session;
                req.session.regenerate((_err) => {
                    Object.assign(req.session, prevSession);
                    res.json({
                        loggedIn: true,
                        user: req.user
                    });
                });
            });
        })(req, res, next);
    });

    // logout
    app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error(err);
            } else {
                res.status(200).end();
            }
        });
        /*req.logout(err => {
            if (err) {
                console.error(err);
            } else {
                res.status(200).end();
            }
        });*/
    });

    // check whether the user is logged in or not
    app.get('/api/sessions/current', (req, res) => {
        if (req.isAuthenticated()) {
            res.status(200).json(req.user);
        } else
            res.status(401).json({error: 'Non-authenticated user!'});
    });

    // sign up
    app.post('/api/signup/:registrationToken',
        param("registrationToken").isString(),
        body("password").isString(),
        body("email").optional().isEmail(),
        body("phone").optional().isMobilePhone("any"),
        body("car").optional().isString(),
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty() || !req.params) {
                res.status(ParameterError.code).json(new ParameterError("The registration token must be a string!"))
                return
            }

            const user = await getUserFromRegistrationToken(req.params.registrationToken);

            if (!user) {
                throw new UserNotFound()
            }

            // check password already existing
            if (user.hashedPassword && user.salt) {
                res.status(403).json(new BaseError(403, "L'utente è già registrato!"))
                return
            }

            // registration token is expired
            if (dayjs(user.tokenExpiryDate).isBefore(dayjs())) {
                res.status(403).json(new BaseError(403, "Il link di registrazione è scaduto!"))
                return
            }

            // update other fields user can enter during registration
            const email = req.body.email as string | undefined
            const phone = req.body.phone as string | undefined
            const car = req.body.car as string | undefined
            const newRegistrationDate = dayjs().format();
            await updateUser(
                user.id,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                user.registrationDate ? undefined : newRegistrationDate,       // if not present
                undefined,
                undefined,
                email,
                phone,
                car,
                undefined
            );

            const salt = crypto.randomBytes(16);
            crypto.pbkdf2(req.body.password, salt, 31000, 32, "sha256", function (err, hashedPassword) {
                saveUserPassword(user.id, hashedPassword, salt);
                res.status(200).end();
            })
        });

    app.post('/login/public-key/challenge', function (req, res, next) {
        store.challenge(req, function (err, challenge) {
            if (err) {
                return next(err);
            }
            if (challenge === undefined) {
                return next("Undefined challenge!")
            }

            res.json({challenge: base64url.encode(challenge)});
        });
    });

    app.post('/login/public-key',
        passport.authenticate('webauthn', {failureMessage: true, failWithError: true}),
        function (req: Request, res: Response) {
            const prevSession = req.session;
            req.session.regenerate((_err) => {
                Object.assign(req.session, prevSession);
                res.json({
                    loggedIn: true,
                    user: req.user
                });
            });
        },
        function (_err: any, _req: Request, res: Response) {
            res.json({loggedIn: false});
        }
    );

    app.post('/signup/public-key/challenge', async function (req, res, next) {
        const user = await getUser(req.body.id);

        if (user === undefined) {
            res.status(UserNotFound.code).json(new UserNotFound())
            return
        }

        const userInfo = {
            id: user.id.toString(),
            name: user.username ?? "",
            displayName: user.fullName()
        };

        store.challenge(req, {user: userInfo}, function (err, challenge) {
            if (err) {
                return next(err);
            }
            if (challenge === undefined) {
                return next("Undefined challenge!")
            }

            res.json({user: userInfo, challenge: base64url.encode(challenge)});
        });
    });
}