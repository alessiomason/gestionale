import React from "react";
import base64url from "../base64url";

function doSignup(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const base_url = process.env.NODE_ENV === "production" ? "https://tm-gestionale-d0730417ec44.herokuapp.com" : "http://localhost";
    const port = process.env.NODE_ENV === "production" ? 443 : 3001;

    if (!window.PublicKeyCredential) {
        return;
    }

    event.preventDefault();

    const requestBody = {
        id: 1/*,
            name: "Alessio",
            surname: "Mason"*/
    }

    return fetch(`${base_url}:${port}/signup/public-key/challenge`, {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            // https://chromium.googlesource.com/chromium/src/+/master/content/browser/webauth/uv_preferred.md
            // https://chromium.googlesource.com/chromium/src/+/main/content/browser/webauth/pub_key_cred_params.md

            const userId = parseInt(json.user.id)
            const idArray = new Uint8Array([userId])
            console.log(userId)
            console.log(idArray)

            return navigator.credentials.create({
                publicKey: {
                    rp: {
                        name: 'Technomake'
                    },
                    user: {
                        id: idArray,
                        name: json.user.name,
                        displayName: json.user.displayName
                    },
                    challenge: base64url.decode(json.challenge),
                    pubKeyCredParams: [
                        {
                            type: 'public-key',
                            alg: -7 // ES256
                        },
                        {
                            type: 'public-key',
                            alg: -257 // RS256
                        }
                    ],
                    //attestation: 'none',
                    authenticatorSelection: {
                        //authenticatorAttachment: 'platform', // "platform" | "cross-platform"
                        //residentKey: 'discouraged', // "discouraged" | "preferred" | "required"
                        //requireResidentKey: false, // true | false (default)
                        userVerification: 'preferred', // "required" | "preferred" (default) | "discouraged"
                    },
                    //extensions: {
                    //  credProps: true
                    //}
                }
            });
        })
        .then(function (credential) {
                if (credential === null) return;
                const publicKeyCredential = credential as PublicKeyCredential
                const publicKeyCredentialResponse = publicKeyCredential.response as AuthenticatorAttestationResponse

                let body = {}
                if (publicKeyCredentialResponse.getTransports()) {
                    body = {
                        response: {
                            clientDataJSON: base64url.encode(publicKeyCredentialResponse.clientDataJSON),
                            attestationObject: base64url.encode(publicKeyCredentialResponse.attestationObject),
                            transports: publicKeyCredentialResponse.getTransports()
                        }
                    }
                } else {
                    body = {
                        response: {
                            clientDataJSON: base64url.encode(publicKeyCredentialResponse.clientDataJSON),
                            attestationObject: base64url.encode(publicKeyCredentialResponse.attestationObject)
                        }
                    }
                }

                return fetch(`${base_url}:${port}/login/public-key`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
            }
        )
        .then(function (response) {
            return response?.json();
        })
        .then(function (json) {
            console.log("Signed up")
        })
        .catch(function (error) {
            console.log(error);
        });

}

function doLogin(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, username: string) {
    const base_url = process.env.NODE_ENV === "production" ? "https://tm-gestionale-d0730417ec44.herokuapp.com" : "http://localhost";
    const port = process.env.NODE_ENV === "production" ? 443 : 3001;

    if (!window.PublicKeyCredential) {
        return;
    }

    event.preventDefault();

    // chiamata ad API per fare get di publicKeyId da username?
    // poi navigator.credentials.get usa l'id per scegliere la chiave corretta

    return fetch(`${base_url}:${port}/login/public-key/challenge`, {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        //body: JSON.stringify(requestBody),
    })
        .then(function (response) {
            return response.json();
        })
        .then(async function (json) {
            const response = await fetch(`${base_url}:${port}/api/users/publicKeyId/${username}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })

            const publicKeyId = await response.json()
            console.log(publicKeyId)
            const rawId = base64url.decode(publicKeyId)

            return navigator.credentials.get({
                publicKey: {
                    allowCredentials: [
                        {
                            id: rawId,
                            type: "public-key"
                        }
                    ],
                    rpId: "localhost",
                    challenge: base64url.decode(json.challenge)
                }
            });
        })
        .then(function (credential) {
            if (credential === null) return;

            const publicKeyCredential = credential as PublicKeyCredential
            const publicKeyCredentialResponse = publicKeyCredential.response as AuthenticatorAssertionResponse

            const a = base64url.decode(publicKeyCredential.id) as ArrayBuffer
            const b = publicKeyCredential.rawId

            if (a.byteLength != b.byteLength) console.log(false);
            var dv1 = new Int8Array(a);
            var dv2 = new Int8Array(b);
            for (var i = 0 ; i != a.byteLength ; i++)
            {
                if (dv1[i] != dv2[i]) console.log(false);
            }
            console.log(true);

            let body = {}
            if (publicKeyCredential.authenticatorAttachment) {
                body = {
                    id: publicKeyCredential.id,
                    response: {
                        clientDataJSON: base64url.encode(publicKeyCredentialResponse.clientDataJSON),
                        authenticatorData: base64url.encode(publicKeyCredentialResponse.authenticatorData),
                        signature: base64url.encode(publicKeyCredentialResponse.signature),
                        userHandle: publicKeyCredentialResponse.userHandle ? base64url.encode(publicKeyCredentialResponse.userHandle) : null
                    },
                    authenticatorAttachment: publicKeyCredential.authenticatorAttachment
                }
            } else {
                body = {
                    id: publicKeyCredential.id,
                    response: {
                        clientDataJSON: base64url.encode(publicKeyCredentialResponse.clientDataJSON),
                        authenticatorData: base64url.encode(publicKeyCredentialResponse.authenticatorData),
                        signature: base64url.encode(publicKeyCredentialResponse.signature),
                        userHandle: publicKeyCredentialResponse.userHandle ? base64url.encode(publicKeyCredentialResponse.userHandle) : null
                    }
                }
            }

            return fetch(`${base_url}:${port}/login/public-key`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            });
        })
        .then(function (response) {
            if (!response) throw "Unable to login!";
            console.log(response)
            return response.json();
        })
        .then(function (json) {
            console.log("Logged in")
            console.log(json)
        })
        .catch(function (error) {
            console.log(error);
        });
}