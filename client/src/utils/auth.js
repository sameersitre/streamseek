import { auth } from './firebase'
export function signInWithGoogle() {
    const provider = new auth.GoogleAuthProvider();
    return auth().signInWithPopup(provider).then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        let userInfo = {}
        var user = result.user;
        userInfo = {
            accessToken: result.credential.accessToken,
            displayName: user.displayName, userEmail: user.email,
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