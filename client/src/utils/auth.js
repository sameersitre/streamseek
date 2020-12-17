import { auth } from './firebase'
export function signInWithGoogle(authProviderSelected) {

    var provider = null
    if (authProviderSelected === "google") {
        provider = new auth.GoogleAuthProvider();
    }
    else if (authProviderSelected === "facebook") {
        provider = new auth.FacebookAuthProvider();
    }

    return auth().signInWithPopup(provider).then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
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
        // ...
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        console.log(errorCode)
        return null
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        console.log(email)
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(credential)
        // ...
    });
}

export function signInWithPhone() {

}