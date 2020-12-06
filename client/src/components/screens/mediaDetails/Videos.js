/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
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
}));

function Videos(props) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [dialogOpen, setDialogOpen] = useState(false)
    const [videoSelected, setVideoSelected] = useState(null)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const handleDialogClose = () => {
        setDialogOpen(false)
    }
    const handleVideoButton = (value) => {
        setVideoSelected(value)
        setDialogOpen(true)

    }
    const handlePopoverOpen = (event, value) => {
        setAnchorEl(event.currentTarget);
        setVideoSelected(value)
        setPopoverOpen(true)
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setPopoverOpen(false)
    };

    const open = Boolean(anchorEl);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyItems: 'space-between',
                alignContent: 'flex-start',
                color: '#FFFFFF',
                width: '90vw'
            }}>

            <Dialog
                fullScreen
                disableBackdropClick
                disableEscapeKeyDown
                open={dialogOpen}
                style={{ width: '75%', height: '75%', margin: 'auto', marginTop: '8%', }}
            >
                <IconButton
                    color="inherit"
                    onClick={() => handleDialogClose()}
                    aria-label="Close"
                    style={{ position: 'fixed', zIndex: 1, backgroundColor: 'white', marginTop: -45, marginLeft: '75%' }}
                >
                    <CloseIcon />
                </IconButton>

                <iframe
                    src={`https://www.youtube.com/embed/${videoSelected && videoSelected.key}`}
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

            <Grid item
                style={{
                    overflow: 'hidden', marginTop: 15
                }}>

                <Typography style={{ marginTop: 10 }} variant="subtitle2">Trailers/Videos:</Typography>
                <div
                    style={{
                        overflow: 'auto',
                        maxHeight: 100,
                    }}
                >
                    <Popover
                        id="mouse-over-popover"
                        className={classes.popover}
                        classes={{
                            paper: classes.paper,
                        }}
                        open={popoverOpen}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={handlePopoverClose}
                        disableRestoreFocus
                    >
                        <Typography>{videoSelected && videoSelected.name}</Typography>
                    </Popover>
                    {props.parentData.results && props.parentData.results.slice(0, 30).map((value, i) =>
                        <Button
                            aria-owns={open ? 'mouse-over-popover' : undefined}
                            aria-haspopup="true"
                            key={i}
                            variant="contained"
                            size="small"
                             className={classes.button}
                            onMouseEnter={(e) => handlePopoverOpen(e, value)}
                            onMouseLeave={handlePopoverClose}
                            onClick={() => handleVideoButton(value)}
                        >
                            {`${i + 1}.${value.type}`}
                        </Button>
                    )}
                </div>
            </Grid>
        </div>
    )
}

const mapStateToProps = state => ({
    user: state.user
});

export default (connect(mapStateToProps)(Videos))
