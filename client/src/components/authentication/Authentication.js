import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
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
import { refreshDashboard, } from '../../containers/actions/userActions';
import apiCall from '../../services/apiCall';
import { getInfo } from '../../services/apiURL'
import { signin, signInWithGoogle } from "../../utils/auth";
import { useDispatch } from "react-redux";
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
    popover: {
        pointerEvents: 'none',
    },
    paper: {
        padding: theme.spacing(1),
    },
    closeIconColor: {
        color: theme.palette.text.primary,
    }
}));
export function Authentication(props) {
    const setDialogClose = props.setDialogClose
    const myRef = React.createRef();
    const [recommendsList, setRecommendsList] = useState();
    const [emailError, setEmailError] = useState();

    const [isDialogOpen, setDialogOpen] = useState(false)
    const classes = useStyles();
    useEffect(() => {
        setDialogOpen(props.isDialogOpen)
    }, [props]);

    async function googleSignIn() {
        await signInWithGoogle().then((data) => {
            console.log(data)
            localStorage.setItem("accessToken", data.accessToken)
            localStorage.setItem("userInfo", JSON.stringify(data))
        }).then(setDialogClose);

    }
    return (
        <div>
            <Dialog
                fullScreen
                disableBackdropClick
                disableEscapeKeyDown
                open={isDialogOpen}
                style={{ width: '75%', height: '75%', margin: 'auto' }}
                className={classes.root}
            >
                <div style={{
                    width: '100%', height: '100%', color: '#FFFFFF',
                    backgroundColor: '#1B1A20',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <IconButton
                        size='small'
                        onClick={setDialogClose}
                        aria-label="Close"
                        style={{ position: 'fixed', zIndex: 1, backgroundColor: 'white', top: '13vh', right: '12.5vw' }}
                    >
                        <CloseIcon color='secondary' />
                    </IconButton>

                    <Button
                        variant="outlined"
                        color="secondary"
                        size="medium"
                        className={classes.button}
                        startIcon={<GoogleIcon />}
                        onClick={googleSignIn}
                    >
                        Sign in with Google
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="medium"
                        className={classes.button}
                        startIcon={<FacebookIcon />}
                    >
                        Sign in with Facebook
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="medium"
                        autoCapitalize='none'
                        className={classes.button}
                        startIcon={<TwitterIcon />}
                    >
                        Sign in with Twitter
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="medium"
                        className={classes.button}
                        startIcon={<SmsIcon />}
                    >
                        Sign in with OTP
                    </Button>
                    <Typography style={{ color: '#757575', fontSize: 18, margin: 15 }}>OR</Typography>
                    <Typography style={{ color: '#757575', fontSize: 15 }}>Sign in via Credentials</Typography>

                    <SignUp />
                </div>
            </Dialog>
        </div>
    )
}
const mapStateToProps = (state) => ({
})
const mapDispatchToProps = {
}
export default Authentication
