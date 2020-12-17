import React, { useState, useEffect } from 'react'
import { makeStyles, createStyles, fade } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField'

import Button from '@material-ui/core/Button';
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import PhoneField from '../../assets/components/PhoneField'
import { auth } from '../../utils/firebase'
import * as firebaseui from "firebaseui";

const useStyles = makeStyles((theme) => createStyles({
    dialog: {
        width: 500, height: 800, borderRadius: 15,
    },
    buttons: {
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'flex-start',
        marginTop: 10,
    },
    button: {
        width: 250,
        color: '#FFFFFF',

        backgroundColor: '#707070',
        margin: theme.spacing(0.9),
    },
    phoneField: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.05),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        maxWidth: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    },
}));
export function SignInOTP(props) {
    const classes = useStyles();
    const ref = React.createRef();

    const [countrySelected, setCountry] = useState()
    const [phone, setPhone] = useState()


    useEffect(() => {
        const uiConfig = {
            //   signInSuccessUrl: "https://netflix-clone-ankur.herokuapp.com/", //This URL is used to return to that page when we got success response for phone authentication.
            signInOptions: [auth.PhoneAuthProvider.PROVIDER_ID],
            //   tosUrl: "https://netflix-clone-ankur.herokuapp.com/"
        };


        if (firebaseui.auth.AuthUI.getInstance()) {
            const ui = firebaseui.auth.AuthUI.getInstance()
            ui.start('#firebaseui-auth-container', uiConfig)
        } else {
            const ui = new firebaseui.auth.AuthUI(auth())
            ui.start('#firebaseui-auth-container', uiConfig)
          }

        // window.recaptchaVerifier = new auth.RecaptchaVerifier('sign-in-button', {
        //     'size': 'invisible',
        //     'callback': function (response) {
        //         console.log(response)
        //         // reCAPTCHA solved, allow signInWithPhoneNumber.
        //         // onSignInSubmit();
        //     }
        // });

    }, []);





    async function otpSignIn() {
        var appVerifier = window.recaptchaVerifier;
        console.log(appVerifier)
        auth().signInWithPhoneNumber(phone, appVerifier)
            .then(function (confirmationResult) {

                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                window.confirmationResult = confirmationResult;
            }).catch(function (error) {
                console.log(error)
                // Error; SMS not sent
                // ...
            });

    }



    const FancyField = React.forwardRef((props, ref) => (
        <TextField ref={ref} />

    ));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} >
            <div id="firebaseui-auth-container"></div>
            {/* <PhoneInput
                ref={ref}
                defaultCountry="IN"
                className={classes.phoneField}
                value={phone}
                onChange={setPhone}
                // inputComponent={FancyField}
                international
                countryCallingCodeEditable={false}
                placeholder="Enter phone number"

            /> */}
            <Button
                // variant="outlined"
                // color="secondary"
                // size="medium"
                // className={classes.button}

                onClick={props.backNavigate}
            >
                {'<'} All Sign in options
                    </Button>
        </div>
    )
}



export default SignInOTP
