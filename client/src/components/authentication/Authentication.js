import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './Authentication.css'
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import CloseIcon from '@material-ui/icons/Close';
import GoogleIcon from '../../assets/Icons/googleIcon'
import FacebookIcon from '../../assets/Icons/facebookIcon'
import TwitterIcon from '../../assets/Icons/twitterIcon'
import SmsIcon from '@material-ui/icons/Sms';
import SignUp from './SignUp'
import { userProfileAction } from '../../containers/actions/userActions';
import { signInWithGoogle } from "../../utils/auth";
import SignInOTP from './SignInOTPCustom'
const useStyles = makeStyles((theme) => createStyles({
    dialog: {
        width: 500, height: 800, borderRadius: 15,
    },
    button: {
        width: 250,
        color: '#FFFFFF',
        backgroundColor: '#707070',
        margin: theme.spacing(0.9),
    },
}));
export function Authentication(props) {
    const setDialogClose = props.setDialogClose
    const [displayPhoneSignIn, setdisplayPhoneSignIn] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false)
    const dispatch = useDispatch();
    const classes = useStyles();
    useEffect(() => {
        setDialogOpen(props.isDialogOpen)

    }, [props]);

    async function googleSignIn(provider) {
        console.log(provider)
        await signInWithGoogle(provider).then((data) => {
            if (data !== null) {
                localStorage.setItem("accessToken", data.accessToken)
                localStorage.setItem("userProfile", JSON.stringify(data))
                dispatch(userProfileAction(data))

            }
            else {
                alert("Sign in is not Successfull.")
            }
        })
        setDialogOpen(false)
    }
    return (
        <div>
            <Dialog
                fullScreen
                disableBackdropClick
                disableEscapeKeyDown
                open={isDialogOpen}
                style={{ minWidth: '75%', width: '40%', height: '80%', margin: 'auto' }}
                className={classes.root}
            >
                <div className='auth-root'   >
                    <IconButton
                        size='small'
                        onClick={setDialogClose}
                        aria-label="Close"
                        style={{ position: 'absolute', top: 0, right: 0, zIndex: 1, backgroundColor: 'white' }}
                    >
                        <CloseIcon color='secondary' />
                    </IconButton>
                    {!displayPhoneSignIn ?
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography>{`This sandbox project is for experimentation purposes only, \nSigning in is not necessary. `}</Typography>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="medium"
                                className={classes.button}
                                startIcon={<GoogleIcon />}
                                onClick={() => googleSignIn('google')}
                            >
                                Sign in with Google
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="medium"
                                className={classes.button}
                                startIcon={<FacebookIcon />}
                                onClick={() => googleSignIn('facebook')}
                            >
                                Sign in with Facebook
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="medium"
                                className={classes.button}
                                startIcon={<TwitterIcon />}
                                onClick={() => googleSignIn('twitter')}
                            >
                                Sign in with Twitter
                            </Button>

                            {/* <Button
                                id="sign-in-button"
                                variant="outlined"
                                color="secondary"
                                size="medium"
                                className={classes.button}
                                startIcon={<SmsIcon />}
                                onClick={() => { setdisplayPhoneSignIn(true) }}
                            >
                                Sign in with OTP
                            </Button> */}
                            {/* <Typography style={{ color: '#757575', fontSize: 18, margin: 15 }}>OR</Typography>
                            <Typography style={{ color: '#757575', fontSize: 15 }}>Sign in via Credentials</Typography>
                            <SignUp /> */}
                        </div>
                        : <SignInOTP
                            backNavigate={() => setdisplayPhoneSignIn(false)}
                            closeDialog={() => setDialogClose} />}
                </div>
            </Dialog>
        </div>
    )
}

export default Authentication