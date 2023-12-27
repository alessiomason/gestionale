import passport from 'passport';
import WebAuthnStrategy from "@forwardemail/passport-fido2-webauthn";
import {knex} from "../database/db";
import {User} from "../users/user";

export function setupPassport(store: WebAuthnStrategy.SessionChallengeStore) {
    passport.use(new WebAuthnStrategy({store: store},
        async function verify(id: string, userHandle: Buffer, cb: any) {
            const publicKeyInfo = await knex("public_key_credentials")
                .first()
                .where({externalId: id});

            const user = await knex<User>("users")
                .first()
                .where({id: publicKeyInfo.userId})

            if (Buffer.from(String(user?.id ?? 1)).compare(userHandle)) {
                return cb(null, user, publicKeyInfo.publicKey)
            }

            return cb(null, false, {message: 'Invalid key.'});
        },

        async function register(userInfo: any, id: string, publicKey: string, cb: any) {
            const userId = parseInt((userInfo.id as Buffer).toString())
            const user = await knex<User>("users")
                .first()
                .where({id: userId})

            await knex("public_key_credentials")
                .insert({
                    userId: user?.id,
                    externalId: id,
                    publicKey: publicKey
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
    passport.deserializeUser(async (id, done) => {
        const user = await knex<User>("users")
            .first()
            .where({id: id as number})

        done(null, user);
    });
}