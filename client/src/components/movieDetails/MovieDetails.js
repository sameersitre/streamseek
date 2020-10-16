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
import Card from '@material-ui/core/Card';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';

import CardMedia from '@material-ui/core/CardMedia';
import Box from '@material-ui/core/Box';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Poster from './Poster';
import SideDetails from './SideDetails';
import { getDetails } from '../../containers/actions/userActions';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';

// import Iframe from '../commonComponents/YoutubeIframe';

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
        movieData: []
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.user.details_data) {
            return {
                movieData: nextProps.user.details_data[0],
                videoData: nextProps.user.details_data[1],
                streamAvailablity: nextProps.user.details_data[2],
                bufferEnabled: nextProps.user.buffer_enable
            }
        }
        return null
    }

    componentDidMount() {
        window.scrollTo(0, 0)
        this.props.getDetails(JSON.parse(localStorage.selectedMovieDetails))
        // this.props.getDetails(JSON.parse(this.props.location.state.movieData))

        // console.log(localStorage.selectedMovieDetails)
        // console.log(window.location.pathname)


    }
    render() {

        const { classes } = this.props;

        return (
            <Grid item xs={12} display="flex" style={{ color: '#FFFFFF', backgroundColor: '#1B1A20', }}>
                <Backdrop className={classes.backdrop} open={this.props.user.buffer_enable}  >
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
                        image={`https://image.tmdb.org/t/p/w500${this.state.movieData && this.state.movieData.backdrop_path}`}
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
                                {this.state.movieData.title || this.state.movieData.name}
                            </Typography>
                            {this.state.movieData.tagline &&
                                <Typography gutterBottom variant="body2"
                                    style={{ color: '#E5CA49' }}>
                                    {this.state.movieData.tagline}
                                </Typography>
                            }
                        </Grid>

                        <div
                            style={{
                                display: 'flex', flexDirection: 'row',
                            }}>
                                <Poster data={this.state.movieData} />
                            <Grid
                                style={{ margin: 5 }}
                            >
                                <a style={{
                                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                                    color: '#FFFFFF', textDecoration: 'none',
                                }}
                                    href={`https://www.imdb.com/title/${this.state.movieData.imdb_id}`} target="_blank"
                                >
                                    <img src={require('../../assets/Icons/imdb.png')} alt="Smiley face" height="28" width="28" />
                                    {this.state.movieData.vote_average > 0
                                        ?
                                        <Typography variant="body2" xs={12}  >
                                            &nbsp;&nbsp;{`${this.state.movieData.vote_average} (${this.state.movieData.vote_count})`}
                                        </Typography>
                                        :
                                        <Typography variant="body2">&nbsp;&nbsp;NA</Typography>
                                    }
                                </a>
                                <Typography variant="body2"   >
                                    {moment(this.state.movieData.release_date
                                        ||
                                        this.state.movieData.first_air_date).format('ll')
                                    } (USA)
                                        </Typography>
                                <Typography variant="body2" style={{ marginTop: 10 }}  >
                                    {this.state.movieData.runtime || this.state.movieData.episode_run_time} mins
                                        </Typography>
                                <div className={classes.chipView} >
                                    {this.state.movieData.genres && this.state.movieData.genres.map((value, i) =>
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
                                    // xs={8} sm={12}
                                    style={{
                                        color: '#FFFFFF', alignItems: 'baseline',
                                        textDecoration: 'none',
                                    }}>
                                    {this.props.user.details_data && this.props.user.details_data[2]
                                        &&
                                        this.props.user.details_data[2].map((value, i) =>
                                            value.display_name !== 'AtomTicketsIVAUS' && value.country[0] === 'us' || value.country[0] === 'in'
                                                ?
                                                <Tooltip
                                                    title={value.country[0] === 'us' && 'US' ||
                                                        value.country[0] === 'in' && 'INDIA'}
                                                    placement="bottom-end"
                                                    aria-label="add">
                                                    <a style={{ margin: 10 }}
                                                        href={value.url} target="_blank"  >
                                                        <img src={value.icon} alt="Smiley face" width="70" />
                                                    </a>
                                                </Tooltip>
                                                : null
                                        )}
                                </Grid>
                            </Grid>

                        </div>
                        <SideDetails
                            movieData={this.state.movieData}
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



export default withStyles(styles)(connect(mapStateToProps, { getDetails })(withRouter(MovieDetails)))
