import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { main_url } from '../../utils/Config';
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
        margin: theme.spacing(0.6),
    }
})

export class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            emailData: '',
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
        this.setState({ emailData: event.target.value })
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
            emailData: '',
            messageDialog: false
        })
    };

    handleAnalytics = (value) => {
        event_GAnalytics("Icon", "Click", value)
    }

    sendMail = async () => {

        let data = {
            senderEmail: this.state.email,
            emailData: this.state.emailData,
            userAgent: navigator.userAgent
        }
        if (!this.ValidateEmail(data.senderEmail)) {
            this.handleDialogOpen('Incorrect email format.', "Please enter correct email ID.")
        } else {
            if (this.state.emailData.length > 0 && this.state.email.length > 0) {
                await axios.post(`${main_url}/sendmail`, data)
                    .then(res => {
                        this.setState({ email: '', emailData: '' })
                        this.handleDialogOpen('Message Sent!', data.emailData)
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            }
            else {
                this.handleDialogOpen('Field(s) is Empty.', 'Please add email and message.')
            }
        }

    }
    ValidateEmail = (inputText) => {
        var mailformat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (inputText.match(mailformat)) {
            return true;
        }
        else {
            return false;
        }
    }
    render() {
        const { classes } = this.props;

        return (
            <Grid container
                xs={12} sm={12}
                style={{
                    backgroundColor: '#282828', color: '#BFBFBF', marginTop: 50,
                    justifyContent: 'space-between',
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
                    <Grid container xs={12} sm={4}
                        style={{
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between', padding: 20
                        }} >
                        <Typography variant="subtitle1"   >
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
                            value={this.state.emailData}
                            onChange={this.handleChangeData}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            disabled={this.state.email.length < 6 ? true : false}
                            aria-haspopup="true"
                            className={classes.button}
                            onClick={() => this.sendMail()}
                        >
                            Submit
                    </Button>
                    </Grid>

                </ThemeProvider>

                <Grid style={{
                    display: 'flex', flexDirection: 'column',
                    // justifyContent: 'space-between',
                    backgroundColor: '#282828', padding: 20, height: 150,
                }}>
                    <div>
                        <Typography variant="body2"  >
                            Extermnal Links
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
})
const mapDispatchToProps = {
}

// export default connect(mapStateToProps, mapDispatchToProps)(Footer)
export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Footer))
