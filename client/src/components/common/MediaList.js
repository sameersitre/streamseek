import React, { PureComponent } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import { Backdrop, Grid } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from './Card';
import Footer from './Footer';
import MediaPagination from './MediaPagination'

const styles = (theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
});
class MediaList extends PureComponent {
    render() {
        const { classes, listData, previous, next, refresh } = this.props
        return (
            <Grid container justify="center" alignItems='flex-start'
                spacing={1} style={{
                    paddingTop: 80, backgroundColor: "#1B1A20",
                    minHeight: window.innerHeight
                }}>
                <Backdrop className={classes.backdrop} open={refresh}  >
                    <CircularProgress color="inherit" />
                </Backdrop>

                {listData?.map((value, i) => (
                    <Grid key={i} item>
                        <Card parentData={value} />
                    </Grid>
                ))}

                {!refresh && listData?.length > 0 &&
                    <MediaPagination
                        next={next}
                        previous={previous}
                    />}

                {listData?.length > 0 &&
                    <Footer />
                }
            </Grid>
        )
    }
}

export default withStyles(styles)(withRouter(MediaList))
