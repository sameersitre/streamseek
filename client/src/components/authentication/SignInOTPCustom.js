import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button';
import 'react-phone-number-input/style.css'
import { useSelector } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import { auth } from '../../utils/firebase'
import { signInWithPhone } from '../../utils/auth'
import { Typography } from '@material-ui/core';
const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: 200,
        },
    },
}));




export function SignInOTP(props) {
    const classes = useStyles();
    const reduxState = useSelector(state => state.user);
    const [phoneAuthResult, setPhoneAuthResult] = useState(null)
    const [phoneNumber, setphoneNumber] = useState('+919850915035')
    const [authStep, setAuthStep] = useState(0)
    const closeDialog = props.closeDialog
    let history = useHistory();
    useEffect(() => {
        console.log('useeffect call')
        window.recaptchaVerifier = new auth.RecaptchaVerifier('recaptcha-container');

    }, []);
    function onSignInSubmit() {
        // signInWithPhone(phoneNumber)
        var appVerifier = window.recaptchaVerifier;
        auth().signInWithPhoneNumber(phoneNumber, appVerifier)
            .then(function (confirmationResult) {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                console.log(confirmationResult)
                window.confirmationResult = confirmationResult;
            }).catch(function (error) {
                console.log(error)
            });
    }

    const StepZero = (props) => {
        return (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
            <TextField
                error={false}
                name='phoneNumber'
                value={phoneNumber}
                onChange={e => setphoneNumber(e.target.value)}
                id="standard-error-helper-text"
                label="Add your phone number."
                defaultValue="Hello World"
                helperText={''}
            />
            <div id="recaptcha-container"></div>
            <Button id="" onClick={onSignInSubmit} color='green'>next</Button>
        </div>)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} >
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <form className={classes.root} noValidate autoComplete="off">
                    {authStep === 0 ?
                        StepZero()
                        :
                        <div>ffij</div>
                    }
                </form>
            </div>
        </div>
    )
}

export default SignInOTP
