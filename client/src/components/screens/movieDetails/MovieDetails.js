/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Poster from './Poster';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import apiCall from '../../../services/apiCall';
import { getVideosURL, getDetailsURL, getOTTPlatformsURL } from '../../../services/apiURL'
import Cast from './Cast'
import Background from './Background'
import Streams from './Streams'
import Overview from './Overview'
import Recommends from './Recommends'
const styles = (theme) => ({
    root: {
        display: 'flex',
        color: '#FFFFFF',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    chipView: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: 10,
        flexWrap: 'wrap',
    },
});
class MovieDetails extends Component {
    state = {
        detailsData: null,
        videoData: null,
        streamAvailablity: null,
        refresh: false,
        apiParams: []
    }
    async componentDidMount() {
        window.scrollTo(0, 0)
        this.setState({ refresh: true })
        let storData = JSON.parse(await localStorage.selectedMovieDetails)
        let params = {
            id: storData.id,
            media_type: storData.media_type ? storData.media_type : "movie"
        }

        this.setState({ detailsData: await apiCall(getDetailsURL, params), apiParams: params, refresh: false, })
        this.setState({
            videoData: await apiCall(getVideosURL, params),
        })
    }
    render() {

        const { classes } = this.props;
        const { detailsData, refresh, apiParams } = this.state;

        return (
            detailsData !== null ?

                <div className={classes.root}  >

                    <Background backdropPath={detailsData?.backdrop_path} />
                    <Grid style={{
                        position: 'absolute',
                        width: '97vw', marginTop: 50,
                    }}
                    >

                        {/*  TITLE + TAGLINE */}
                        <Grid
                            style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'flex-start',
                            }} >
                            <Typography gutterBottom variant="h6" style={{ color: '#E5CA49', }}  >
                                {detailsData.title || detailsData.name}
                            </Typography>
                            {detailsData.tagline &&
                                <Typography gutterBottom variant="body2"
                                    style={{ color: '#E5CA49' }}>
                                {detailsData.tagline}
                                </Typography>
                            }
                        </Grid>

                        <div
                            style={{
                                display: 'flex', flexDirection: 'row',
                            }}>
                            <Poster data={detailsData} />
                            <Grid
                                style={{ margin: 5, flexDirection: 'row' }}
                            >
                                <a style={{
                                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                                    color: '#FFFFFF', textDecoration: 'none',
                                }}
                                    href={`https://www.imdb.com/title/${detailsData.imdb_id}`} target="_blank" rel="noopener noreferrer"
                                >
                                    <img src={require('../../../assets/Icons/imdb.png')} alt="Smiley face" height="28" width="28" />
                                    {detailsData.vote_average > 0
                                        ?
                                        <Typography variant="body2"   >
                                            &nbsp;&nbsp;{`${detailsData.vote_average} (${detailsData.vote_count})`}
                                        </Typography>
                                        :
                                        <Typography variant="body2">&nbsp;&nbsp;NA</Typography>
                                    }
                                </a>
                                <Typography variant="body2"   >
                                    {moment(detailsData.release_date
                                        ||
                                        detailsData.first_air_date).format('ll')
                                    } (USA)
                                        </Typography>
                                <Typography variant="body2" style={{ marginTop: 10 }}  >
                                    {detailsData.runtime || detailsData.episode_run_time} mins
                                        </Typography>
                                <div className={classes.chipView} >
                                    {detailsData.genres && detailsData.genres.map((value, i) =>
                                        <div key={i}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'baseline'
                                            }}>
                                            <Typography variant="body2">{value.name}&nbsp;
                                            </Typography>
                                            {i + 1 !== detailsData.genres.length ? (
                                                <Typography variant="body2"
                                                    style={{ color: '#757575' }}>
                                                    |&nbsp;
                                                </Typography>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </Grid>
                        </div>

                        {apiParams && <Streams parentData={apiParams} />}

                        {detailsData && <Overview parentData={detailsData} />}

                        {/* {videoData && <Videos videoData={videoData} />} */}

                        {apiParams && <Cast parentData={apiParams} />}
                        {apiParams && <Recommends parentData={apiParams} history={this.props.history} />}

                    </Grid>
                </div>
                :
                <Backdrop className={classes.backdrop} open={refresh}  >
                    <CircularProgress color="inherit" />
                </Backdrop>
        )
    }
}
const mapStateToProps = (state) => ({
    user: state.user
})
export default withStyles(styles)(connect(mapStateToProps)(withRouter(MovieDetails)))
