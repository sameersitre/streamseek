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
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import CardMedia from '@material-ui/core/CardMedia';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Poster from './Poster';
import SideDetails from './SideDetails';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import apiCall from '../../../services/apiCall';
import { getVideosURL, getDetailsURL, getOTTPlatformsURL } from '../../../services/apiURL'

const styles = (theme) => ({
    root: {
        width: window.innerWidth,
        // height: window.innerHeight  ,
        margin: 0,
        backgroundColor: 'grey'
    },
    media: {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundSize: 'cover'
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
        '& > *': {
            margin: theme.spacing(0.3),
        },
    },
});
class MovieDetails extends Component {

    state = {
        movieData: [],
        videoData: [],
        streamAvailablity: [],
        refresh: false
    }

    async componentDidMount() {
        window.scrollTo(0, 0)
        console.log(this.props)
        this.setState({ refresh: true })
        let storData = JSON.parse(await localStorage.selectedMovieDetails)
        let data = { id: storData.id, media_type: storData.media_type ? storData.media_type : "movie" }
        this.setState({
            movieData: await apiCall(getDetailsURL, data),
            refresh: false,
        })
        this.setState({
            videoData: await apiCall(getVideosURL, data),
            streamAvailablity: await apiCall(getOTTPlatformsURL, data),
        })
    }
    render() {

        const { classes } = this.props;
        const { movieData, streamAvailablity, refresh } = this.state;

        return (
            <Grid item xs={12} display="flex" style={{ color: '#FFFFFF', backgroundColor: '#1B1A20', }}>
                <Backdrop className={classes.backdrop} open={refresh}  >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Grid
                    style={{
                        display: 'flex', position: 'relative',
                    }}
                >
                    {/* BACKGROUND IMAGE */}
                    <CardMedia
                        className={classes.media}
                        image={`https://image.tmdb.org/t/p/w500${movieData?.backdrop_path}`}
                    />

                    {/* BACKGROUND LINEAR GRADIENT */}
                    <div
                        style={{
                            position: 'absolute',
                            backgroundSize: 'cover',
                            width: window.innerWidth - 25,
                            height: window.innerHeight,
                            background: 'linear-gradient(to left, transparent 0%, black 80%)'
                        }} >
                    </div>

                    <Grid style={{ position: 'absolute', margin: 10, marginTop: 50 }} >

                        {/*  TITLE + TAGLINE */}
                        <Grid item xs={12} sm={12}
                            style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'flex-start',
                                // backgroundColor: 'pink',
                            }} >
                            <Typography gutterBottom variant="h6" style={{ color: '#E5CA49', }}  >
                                {movieData.title || movieData.name}
                            </Typography>
                            {movieData.tagline &&
                                <Typography gutterBottom variant="body2"
                                    style={{ color: '#E5CA49' }}>
                                    {movieData.tagline}
                                </Typography>
                            }
                        </Grid>

                        <div
                            style={{
                                display: 'flex', flexDirection: 'row',
                            }}>
                            <Poster data={movieData} />
                            <Grid
                                style={{ margin: 5 }}
                            >
                                <a style={{
                                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                                    color: '#FFFFFF', textDecoration: 'none',
                                }}
                                    href={`https://www.imdb.com/title/${movieData.imdb_id}`} target="_blank" rel="noopener noreferrer"
                                >
                                    <img src={require('../../../assets/Icons/imdb.png')} alt="Smiley face" height="28" width="28" />
                                    {movieData.vote_average > 0
                                        ?
                                        <Typography variant="body2" xs={12}  >
                                            &nbsp;&nbsp;{`${movieData.vote_average} (${movieData.vote_count})`}
                                        </Typography>
                                        :
                                        <Typography variant="body2">&nbsp;&nbsp;NA</Typography>
                                    }
                                </a>
                                <Typography variant="body2"   >
                                    {moment(movieData.release_date
                                        ||
                                        movieData.first_air_date).format('ll')
                                    } (USA)
                                        </Typography>
                                <Typography variant="body2" style={{ marginTop: 10 }}  >
                                    {movieData.runtime || movieData.episode_run_time} mins
                                        </Typography>
                                <div className={classes.chipView} >
                                    {movieData.genres && movieData.genres.map((value, i) =>
                                        <Chip
                                            key={i}
                                            size="small"
                                            label={value.name}
                                            component="a"
                                            variant="outlined"
                                            style={{ color: '#FFFFFF', backgroundColor: '#5A5A5A' }}
                                            href="#chip" clickable />
                                    )}
                                </div>

                                {/* streaming icons */}
                                <Grid
                                    style={{
                                        color: '#FFFFFF', alignItems: 'baseline',
                                        textDecoration: 'none',
                                    }}>
                                    {streamAvailablity.platforms && streamAvailablity.platforms.map((value, i) =>
                                        <Tooltip
                                            title={''}
                                            key={i}
                                            placement="bottom-end"
                                            aria-label="add">
                                            <a style={{ margin: 10 }}
                                                href={value.url} target="_blank" rel="noopener noreferrer"  >
                                                <img src={value.icon} alt="Smiley face" width="70" />
                                            </a>
                                        </Tooltip>
                                    )}
                                </Grid>
                            </Grid>

                        </div>
                        <SideDetails
                            movieData={movieData}
                            videoData={this.state.videoData}
                            streamAvailablity={this.state.streamAvailablity}
                        />
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}
const mapStateToProps = (state) => ({
    user: state.user
})
export default withStyles(styles)(connect(mapStateToProps)(withRouter(MovieDetails)))
