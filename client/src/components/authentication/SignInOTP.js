import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button';
import 'react-phone-number-input/style.css'
import { useSelector } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";

import { auth } from '../../utils/firebase'
import * as firebaseui from "firebaseui";
import { Typography } from '@material-ui/core';
export function SignInOTP(props) {
    const reduxState = useSelector(state => state.user);
    const [phoneAuthResult, setPhoneAuthResult] = useState(null)
    const closeDialog = props.closeDialog
    let history = useHistory();
    useEffect(() => {
        setPhoneAuthResult(localStorage.phoneAuth && JSON.parse(localStorage.phoneAuth))
        const uiConfig = {
            //   signInSuccessUrl: "https://netflix-clone-ankur.herokuapp.com/", //This URL is used to return to that page when we got success response for phone authentication.
            signInOptions: [{
                provider: auth.PhoneAuthProvider.PROVIDER_ID,
                recaptchaParameters: {
                    type: 'image', // 'audio'
                    size: 'normal', // 'invisible' or 'compact'
                    badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
                },
                defaultCountry: reduxState.user_info.region, // Set default country to the United Kingdom (+44).
                // For prefilling the national number, set defaultNationNumber.
                // This will only be observed if only phone Auth provider is used since
                // for multiple providers, the NASCAR screen will always render first
                // with a 'sign in with phone number' button.
                // defaultNationalNumber: '1234567890',
                // You can also pass the full phone number string instead of the
                // 'defaultCountry' and 'defaultNationalNumber'. However, in this case,
                // the first country ID that matches the country code will be used to
                // populate the country selector. So for countries that share the same
                // country code, the selected country may not be the expected one.
                // In that case, pass the 'defaultCountry' instead to ensure the exact
                // country is selected. The 'defaultCountry' and 'defaultNationaNumber'
                // will always have higher priority than 'loginHint' which will be ignored
                // in their favor. In this case, the default country will be 'GB' even
                // though 'loginHint' specified the country code as '+1'.
                // loginHint: '+11234567890'
            }],
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    console.log(authResult)
                    setPhoneAuthResult(authResult)
                    sendStorage({
                        accessToken: authResult.user.stsTokenManager.accessToken,
                        phoneNumber: authResult.user.phoneNumber,
                        photoURL: authResult.user.photoURL,
                        displayName: authResult.user.displayName,
                        userEmail: authResult.user.email,
                        signInMethod: "phone"
                    })

                    return true;
                }

            },
            signInSuccessUrl: "/all/page1"
        };

        function sendStorage(param) {
            localStorage.setItem("accessToken", param.accessToken)
            localStorage.setItem("userProfile", JSON.stringify(param))
        }



        if (firebaseui.auth.AuthUI.getInstance()) {
            const ui = firebaseui.auth.AuthUI.getInstance()
            ui.start('#firebaseui-auth-container', uiConfig)
        } else {
            const ui = new firebaseui.auth.AuthUI(auth())
            ui.start('#firebaseui-auth-container', uiConfig)
        }
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} >
            {!phoneAuthResult ?
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div id="firebaseui-auth-container"></div>
                    <Button onClick={props.backNavigate} color='green'   >
                        {'<'} All sign in options
                    </Button>
                </div>
                :
                <div>

                    <Typography>You are already signed in.</Typography>
                    <Button onClick={props.backNavigate} color='green'   >
                        {'<'} All sign in options
            </Button>
                </div>
            }
        </div>
    )
}

export default SignInOTP
