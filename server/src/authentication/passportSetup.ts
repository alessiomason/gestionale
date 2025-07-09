import passport from 'passport';
const LocalStrategy = require('passport-local').Strategy;
import WebAuthnStrategy from "@forwardemail/passport-fido2-webauthn";
import {MockStrategy, setupSerializeAndDeserialize} from "passport-mock-strategy";
import {knex} from "../database/db";
import {User} from "../users/user";
import * as crypto from "crypto";
import {getUser, getUserFromUsername} from "../users/userService";
import {usersList} from "../users/usersList";

export function setupPassport(store: WebAuthnStrategy.SessionChallengeStore) {
    // mock authentication strategy (for testing)
    if (process.env.NODE_ENV === 'test') {
        // @ts-ignore
        passport.use(new MockStrategy());
        setupSerializeAndDeserialize(passport);
        return
    }

    // real authentication strategies

    passport.use(new LocalStrategy(
        async function (username: string, password: string, done: any) {
            const user = await getUserFromUsername(username);

            if (!user) {
                return done(null, false, "Username o password non corretti.");
            }

            if (!user.salt) {
                return done(null, false, "Username o password non corretti.");
            }

            crypto.pbkdf2(password, user.salt, 31000, 32, "sha256", function (err, hashedPassword) {
                if (err) return (done(err));

                if (!user.hashedPassword) {
                    return done(null, false, "Username o password non corretti.");
                }

                if (!crypto.timingSafeEqual(user.hashedPassword, hashedPassword)) {
                    return done(null, false, "Username o password non corretti.");
                }

                // do not send these fields to the client
                user.hashedPassword = undefined;
                user.salt = undefined;
                user.registrationToken = undefined;

                return done(null, user);
            })
        }
    ));

    passport.use(new WebAuthnStrategy({store: store},
        async function verify(publicKeyId: string, userHandle: Buffer, cb: any) {
            const publicKeyInfo = await knex("public_key_credentials")
                .first()
                .where({publicKeyId: publicKeyId});

            const user = await knex<User>("users")
                .first()
                .where({id: publicKeyInfo.userId})

            if (!user)
                return cb(null, false, {message: 'User not found.'});

            if (Buffer.from(user.id.toString()).compare(userHandle)) {
                return cb(null, user, publicKeyInfo.publicKey)
            }

            return cb(null, false, {message: 'Invalid key.'});
        },

        async function register(userInfo: any, publicKeyId: string, publicKey: string, cb: any) {
            const userId = parseInt((userInfo.id as Buffer).toString())
            const user = await knex<User>("users")
                .first()
                .where({id: userId})

            if (!user)
                return cb(null, false, {message: 'User not found.'});

            await knex("public_key_credentials")
                .insert({
                    publicKeyId: publicKeyId,
                    publicKey: publicKey,
                    userId: user.id
                })

            return cb(null, user);
        }
    ));

    // serialize and de-serialize the user (user object <-> session)
    // we serialize the user id, and we store it in the session: the session is very small in this way
    passport.serializeUser((user, done) => {
        // @ts-ignore
        done(null, user.id);
    });

    // starting from the data in the session, we extract the current (logged-in) user
    passport.deserializeUser(async (id: number, done) => {
        const users = await usersList.getAllCachedUsers(true);
        const user = users.find(u => u.id === id);
        done(null, user);
    });
}