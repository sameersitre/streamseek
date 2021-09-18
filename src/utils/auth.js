import { auth } from './firebase'
export function signInWithGoogle(authProviderSelected) {

    var provider = null
    if (authProviderSelected === "google") {
        provider = new auth.GoogleAuthProvider();
    }
    else if (authProviderSelected === "facebook") {
        provider = new auth.FacebookAuthProvider();
    }
    else if (authProviderSelected === "twitter") {
        provider = new auth.TwitterAuthProvider();
    }

    return auth().signInWithPopup(provider).then(function (result) {
        console.log(result)
        let userInfo = {}
        var user = result.user;
        userInfo = {
            accessToken: result.credential.accessToken,
            displayName: user.displayName, userEmail: user.email,
            givenName: result.additionalUserInfo.given_name,
            familyName: result.additionalUserInfo.family_name,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            signInMethod: result.credential.signInMethod
        }
        return userInfo
     }).catch(function (error) {
         console.log(error)
         return null
    });
}

export function signInWithPhone(phoneNumber) {
    var appVerifier = window.recaptchaVerifier;
    auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(function (confirmationResult) {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            console.log(confirmationResult)

            window.confirmationResult = confirmationResult;
        }).catch(function (error) {
            // Error; SMS not sent
            // ...
        });
}