import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import Dialog from '@material-ui/core/Dialog';

import AndroidIcon from '@material-ui/icons/Android';
import AppleIcon from '@material-ui/icons/Apple';
import CloseIcon from '@material-ui/icons/Close';

import GoogleIcon from '../../assets/Icons/googleIcon'

import FacebookIcon from '../../assets/Icons/facebookIcon'
import TwitterIcon from '../../assets/Icons/twitterIcon'

import { refreshDashboard, filterMovieData, searchTextAction, userInfoAction } from '../../containers/actions/userActions';
import apiCall from '../../services/apiCall';
import { getInfo } from '../../services/apiURL'
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
        color: '#FFFFFF',
        backgroundColor: '#5A5A5A',
        margin: theme.spacing(0.6),
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
export function Auth(props) {
    const setDialogClose = props.setDialogClose
    const myRef = React.createRef();
    const [recommendsList, setRecommendsList] = useState();
    const [isDialogOpen, setDialogOpen] = useState(false)
    const classes = useStyles();

    useEffect(() => {
        setDialogOpen(props.isDialogOpen)
    }, [props]);



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
                        // color="default"
                        onClick={setDialogClose}
                        aria-label="Close"
                        style={{ position: 'fixed', zIndex: 1, backgroundColor: 'white', top: '13vh', right: '12.5vw' }}
                    >
                        <CloseIcon color='secondary' />
                    </IconButton>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        className={classes.button}
                        startIcon={<GoogleIcon />}
                    >
                        Sign in with Google
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        className={classes.button}
                        startIcon={<FacebookIcon />}
                    >
                        Sign in with Facebook
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        autoCapitalize='none'
                        className={classes.button}
                        startIcon={<TwitterIcon />}
                    >
                        Sign in with Twitter
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        className={classes.button}
                        startIcon={<GoogleIcon />}
                    >
                        Sign in with Google
                    </Button>

                    <Typography variant="h6"   >
                        For best experience,
                    </Typography>
                    <Typography variant="h6"   >
                        please go back to portrait mode or use the app.
                    </Typography>
                    <IconButton color="inherit" width={50} height={50}
                        href={`https://play.google.com/store/apps/details?id=com.bingefeast`} target="_blank"
                    // onClick={() => this.handleAnalytics("Play store clicked")}
                    >
                        <AndroidIcon />
                    </IconButton>

                    <IconButton color="inherit" onClick={setDialogClose}
                    // href={`http://itunes.apple.com/lb/app/truecaller-caller-id-number/id448142450?mt=8`} target="_blank"
                    // onClick={() => this.handleDialogOpen('Coming Soon!', 'Will be availabe soon on App Store.')}
                    >
                        <AppleIcon />
                    </IconButton>
                </div>

            </Dialog>
        </div>
    )
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default Auth
