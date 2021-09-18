import React, { Component } from 'react'
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Grid } from '@material-ui/core';
const styles = (theme) => ({
    root: {
        color: '#FFFFFF',
        '& > *': {
            marginTop: theme.spacing(2),
        },
    },
    button: {
        color: '#FFFFFF',
        backgroundColor: '#E46E36',
        margin: theme.spacing(1),
    },
})
class MediaPagination extends Component {
    render() {
        const { classes, previous, next } = this.props
        return (
            <Grid container justify='center'>
                <ThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })} >
                    <div style={{ display: "flex", marginTop: 80, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            disabled={(!this.props.match.params.pageNumber || parseInt(this.props.match.params.pageNumber) <= 1) ? true : false}
                            className={classes.button}
                            startIcon={<NavigateBefore />}
                            onClick={() => previous()}
                        > Prev </Button>

                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            // disabled={parseInt(upcomingData.length) < 20 ? true : false}
                            className={classes.button}
                            endIcon={<NavigateNext />}
                            onClick={() => next()}
                        >Next </Button>
                    </div>
                </ThemeProvider>
            </Grid>
        )
    }
}

export default withStyles(styles)(withRouter(MediaPagination))
