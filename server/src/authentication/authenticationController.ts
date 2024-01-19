import WebAuthnStrategy from "@forwardemail/passport-fido2-webauthn";
import base64url from 'base64url';
import passport from "passport";
import {Express, Request, Response} from "express";
import {getUser} from "../users/userService";
import {UserNotFound} from "../users/userErrors";

export function useAuthenticationAPIs(app: Express, store: WebAuthnStrategy.SessionChallengeStore) {
    // mock authentication endpoint (for testing)
    if (process.env.NODE_ENV === 'test') {
        app.get('/auth/mock',
            passport.authenticate('mock'),
            function (req, res) {
                res.json({
                    loggedIn: true,
                    user: req.user
                });
            },
            function (_err: any, _req: Request, res: Response) {
                res.json({loggedIn: false});
            }
        );

        return
    }

    // real authentication endpoints

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
        function (req, res) {
            res.json({
                loggedIn: true,
                user: req.user
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