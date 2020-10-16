/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */


import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import moment from 'moment';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';
import Card from '@material-ui/core/Card';

import Typography from '@material-ui/core/Typography';
const styles = (theme) => ({
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
    chipView: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: 10,
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.3),
        },
    },
    popover: {
        pointerEvents: 'none',
    },
    paper: {
        padding: theme.spacing(1),
    },
});

class SideDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            genreStrings: [],
            videoData: [],
            dialogOpen: false,
            videoSelected: null,
            popoverOpen: false,
            selectedStreams: [],
            streamAvailablity: []
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {

        if (nextProps.movieData) {
            return {
                movieData: nextProps.movieData,
                videoData: nextProps.videoData,
            }
        }
        return null
    }

    componentDidMount() {

        let locations = this.props.user.details_data
        console.log(this.props.user.details_data)
    }

    getAvailableStreams = () => {
        let locations = this.props.user.details_data && this.props.user.details_data[2]
        console.log(locations)
    }

    handleDialogOpen = () => {
        this.setState({ dialogOpen: true })
    }
    handleDialogClose = () => {
        this.setState({ dialogOpen: false })
    }
    handleVideoButton = (value) => {
        this.setState({ videoSelected: value, dialogOpen: true })
        // this.handleDialogOpen()
    }
    handlePopoverOpen = (value) => {
        this.setState({ videoSelected: value, popoverOpen: true })
    };

    handlePopoverClose = () => {
        this.setState({ popoverOpen: false })
    };

    render() {
        const { classes } = this.props;

        return (
            <div
                style={{
                    flexDirection: 'column',
                    justifyItems: 'space-between',
                    alignContent: 'flex-start',
                    color: '#FFFFFF', marginLeft: 10,//backgroundColor:'pink',
                    // height: '25rem'
                }}>
                <Popover
                    id="mouse-over-popover"
                    className={classes.popover}
                    classes={{
                        paper: classes.paper,
                    }}
                    open={this.state.popoverOpen}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={this.handlePopoverClose}
                    disableRestoreFocus
                >
                    {this.state.videoSelected && this.state.videoSelected.name}
                </Popover>
                <Dialog
                    fullScreen
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={this.state.dialogOpen}
                    style={{ width: '75%', height: '75%', margin: 'auto', marginTop: '8%', }}
                >
                    <IconButton
                        color="inherit"
                        onClick={() => this.handleDialogClose()}
                        aria-label="Close"
                        style={{ position: 'fixed', zIndex: 1, backgroundColor: 'white', marginTop: -45, marginLeft: '75%' }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <iframe
                        src={`https://www.youtube.com/embed/${this.state.videoSelected && this.state.videoSelected.key}`}
                        // height="315"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                        }}
                        frameBorder='0'
                        allow='autoplay; encrypted-media'
                        allowFullScreen
                        title='video'
                    />
                </Dialog>

                <Grid
                    xs={12} sm={6}
                    style={{
                        overflow: 'hidden',
                        height: 250,
                    }}
                    container className={classes.buttons} spacing={1} >
                    {/* OVERVIEW */}
                    <Typography variant="body2" style={{ marginTop: 10 }}   >
                        &nbsp;{this.state.movieData.overview}
                    </Typography>
                    <div
                        style={{
                            overflow: 'auto',
                            height: 150,
                        }}
                    >
                        {this.state.videoData && this.state.videoData.results.slice(0, 30).map((value, i) =>
                            <Button
                                key={i}
                                variant="contained"
                                size="small"
                                // color={"#E46E36"}
                                // aria-owns={this.state.popoverOpen ? 'mouse-over-popover' : undefined}
                                aria-haspopup="true"
                                className={classes.button}
                                onMouseEnter={() => this.handlePopoverOpen(value)}
                                onMouseLeave={this.handlePopoverClose}
                                onClick={() => this.handleVideoButton(value)}
                            >
                                {`${i + 1}.${value.type}`}
                            </Button>
                        )}
                    </div>
                </Grid>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    user: state.user
});

const mapDispatchToProps = {
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(SideDetails))
