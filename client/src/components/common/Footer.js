import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinkedIn from '@material-ui/icons/LinkedIn';
import GitHub from '@material-ui/icons/GitHub';
import AndroidIcon from '@material-ui/icons/Android';
import AppleIcon from '@material-ui/icons/Apple';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { event_GAnalytics } from "../../utils/Analytics"
import { getFeedback } from '../../services/apiURL';
import apiCall from '../../services/apiCall';
import countryCode from '../../services/countryCode';
import { validateEmail } from '../../services/validations';
const styles = (theme) => ({

    buttons: {
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'flex-start',
        marginTop: 10,
    },
    button: {
        color: '#FFFFFF',
        backgroundColor: '#5A5A5A',
        marginTop: theme.spacing(0.6),
    }
})

class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            message: '',
            messageDialog: false,
            messageDialogTitle: '',
            messageDialogContent: '',
        }
    }

    handleChangeEmail = (event) => {
        console.log(event)
        this.setState({ email: event.target.value })
    }
    handleChangeData = (event) => {
        console.log(event)
        this.setState({ message: event.target.value })
    }

    handleDialogOpen = (title, content, status) => {
        this.setState({
            messageDialogTitle: title,
            messageDialogContent: content,
            messageDialog: true
        })
    };

    handleDialogClose = () => {
        this.setState({
            message: '',
            messageDialog: false
        })
    };

    handleAnalytics = (value) => {
        event_GAnalytics("Icon", "Click", value)
    }

    sendMessage = async () => {
        if (!validateEmail(this.state.email)) {
            this.handleDialogOpen('Incorrect email format.', "Please enter correct email.")
        } else {
            if (this.state.message.length > 0 && this.state.email.length > 0) {
                let details = await countryCode()
                console.log(details)
                let params = {
                    email: this.state.email,
                    message: this.state.message,
                    ...this.props.user.user_info,
                    coordinates: JSON.parse(localStorage.geolocation),
                }
                await apiCall(getFeedback, params)
                this.handleDialogOpen('Message Sent!', this.state.message)
                this.setState({ email: '', message: '' })
            }
            else {
                this.handleDialogOpen('Field(s) is Empty.', 'Please add email and message.')
            }
        }
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid container
                style={{
                    backgroundColor: '#282828', color: '#BFBFBF', marginTop: 50,
                    justifyContent: 'space-between' 
                }} >

                <ThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })} >
                    <Dialog
                        open={this.state.messageDialog}
                        onClose={this.handleDialogClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description" >
                        <DialogTitle id="alert-dialog-title">{this.state.messageDialogTitle}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {this.state.messageDialogContent}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleDialogClose} color="secondary"
                                style={{ color: '#FFFFFF', backgroundColor: '#E46E36', }} autoFocus>
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Grid container item xs={12} sm={4}
                        style={{
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between', padding: 20
                        }} >
                        <Typography variant="subtitle1">
                            This web app is for experimentation purposes only.
                    </Typography>
                        <Typography variant="subtitle1">
                            Any queries please contact:
                    </Typography>
                        <TextField
                            color='secondary'
                            label="e-mail"
                            type="email"
                            size="small"
                            id="outlined-size-normal"
                            variant="outlined"
                            margin='normal'
                            value={this.state.email}
                            onChange={this.handleChangeEmail}
                        />
                        <TextField
                            color='secondary'
                            id="outlined-multiline-static"
                            label="Message"
                            size="small"
                            multiline
                            rows="3"
                            // defaultValue="Default Value"
                            variant="outlined"
                            value={this.state.message}
                            onChange={this.handleChangeData}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            disabled={this.state.email.length < 6 ? true : false}
                            aria-haspopup="true"
                            className={classes.button}
                            onClick={() => this.sendMessage()}
                        >
                            Submit
                    </Button>
                    </Grid>

                </ThemeProvider>

                <Grid style={{
                    display: 'flex', flexDirection: 'column',
                    backgroundColor: '#282828', padding: 20, height: 150,
                }}>
                    <div>
                        <Typography variant="body2"  >
                            External Links
                            </Typography>
                        <IconButton color="inherit" width={50} height={50}
                            href={`https://github.com/sameersitre/bingefeast`} target="_blank"
                            onClick={() => this.handleAnalytics("github clicked")}
                        >
                            <GitHub />
                        </IconButton>

                        <IconButton color="inherit"
                            href={`https://www.linkedin.com/in/sameersitre/`} target="_blank"
                            onClick={() => this.handleAnalytics("linkedin clicked")}
                        >
                            <LinkedIn />
                        </IconButton>
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <Typography variant="body2"

                        >
                            Also Available in App Store and Play Store
                            </Typography>
                        <IconButton color="inherit" width={50} height={50}
                            href={`https://play.google.com/store/apps/details?id=com.bingefeast`} target="_blank"
                            onClick={() => this.handleAnalytics("Play store clicked")}
                        >
                            <AndroidIcon />
                        </IconButton>

                        <IconButton color="inherit"
                            // href={`http://itunes.apple.com/lb/app/truecaller-caller-id-number/id448142450?mt=8`} target="_blank"
                            onClick={() => this.handleDialogOpen('Coming Soon!', 'Will be availabe soon on App Store.')}
                        >
                            <AppleIcon />
                        </IconButton>
                    </div>
                </Grid>
            </Grid>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user
})
export default withStyles(styles)(connect(mapStateToProps)(Footer))
