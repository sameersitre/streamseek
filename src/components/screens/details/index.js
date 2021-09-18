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
import { getVideosURL, getDetailsURL } from '../../../services/apiURL'
import Seasons from './Seasons'
import Cast from './Cast'
import Background from './Background'
import Streams from './Streams'
import Overview from './Overview'
import Videos from './Videos';
import { imdbicon } from '../../../assets/Icons/imdb'

import Recommends from './Recommends'
const styles = (theme) => ({
    root: {
        display: 'flex',
        color: '#FFFFFF',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'

    },
    chipView: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: 10,
        flexWrap: 'wrap',
    },
});
class Details extends Component {
    state = {
        detailsData: null,
        videoData: null,
        refresh: true,
        id: '',
        media_type: '',
        imdbicon0: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACyklEQVRYR+2XW0gUYRTH/9/M7OpeXBdX81aRIQRlCBVRQkkm0kMXaqVeukcEPkUQPXh7jqBHwYcs6iWhIqGHLNEQSgkflCCoRBLL0nXX9jJ7mf1mvphv2222QlBct4f93uabmXN+53/OnG8OQZYXMfpnw8XlKmV7NSI4MsElMC0gSmSE7F/4lrSfAqCDrrOMkG4A+ZlwbrAZJYxdkRq89/U9DqBHTlVMrYHzJEdUErFZV4ID0EHXCUbI4wxHnmaeMOaWGrxPOIAyVHKegN1dSwAGcsF8wHMvB5BT4P9UQKEEi7IISWTINzEEIwL/QJw2FdG4gKiS6F9Fdg2+kABRYCiwaPxZfQXCIsIKQaFVhcWc2PtzLfkVjHy04nJ3BTaVKDhVF8DNvmL+fmezBwPvbHj9wcqve1q+4mJXZcp2pYui69Isegad6BtzoMPtwck6/+oBnKv/gVfvbZj2mNIAdKUO1sjon7Dj9D4/ghGSGYD6rTJ0dahKoLHfCpglhs7mebQ+LMXRXUEQMA6wbUMMU3NmVK1T0Ht1BsRw9C07BeVOClkhPL8VRRSzPimVAiPAodoQ8kwaB2jeE0D/uB3BqICB9s8oc9JUOpYNsLs6greTFggE2FEVwdiU5Z8ATbUyLCaVA7S5PbweZhdNeHp9BtVlsZUD6NE8GnXw6De6FIx+sqYBdLjn0dZbisbtIdjyEgrcOLaAB8OFqwNw7bAXt5+5oCshEJYGoBdhY42M5xN2HNkZ5Pd1gJYmH3rfFMIbEvGyfRrlzvjKFWg9voA7Q07UbQnz/BsVSFq15mm4deY7XozbOcD6IoovPok71gGMa8kaiKsE/nCiwejNRY4JXNZonMAsAVQjiFPAYWMIhQkEAbw2CvJVXul60cXiBA6Lhjm/hOIC+ldDyh3HOQVyCqQpkPXf8qwPJr+Gk+yNZskWmdXhdC2nIqOvnz7iDT/XCvbaAAAAAElFTkSuQmCC'
    }

    componentDidMount() {
        this.setState({ refresh: true })
        this.getData()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.mediaid !== this.props.match.params.mediaid) {
            this.setState({ refresh: true })
            this.getData()
        }
    }

    getData = async () => {
        window.scrollTo(0, 0)
        let params = {
            id: this.props.match.params.mediaid,
            media_type: this.props.match.params.mediatype
        }
        this.setState({ id: params.id, media_type: params.media_type })
        this.setState({ detailsData: await apiCall(getDetailsURL, params) })
        this.setState({ videoData: await apiCall(getVideosURL, params), refresh: false })
    }

    render() {
        const { classes } = this.props;
        const { detailsData, refresh, videoData, id, media_type } = this.state;
        const apiParams = { id, media_type }
        return (
            <div className={classes.root}  >
                {detailsData !== null ?
                    <>
                        <Background backdropPath={detailsData?.backdrop_path} />
                        <Grid style={{
                            position: 'absolute',
                            width: '97vw', marginTop: 50, padding: 10
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
                                    {/* <ImdbIcon /> */}
                                    <a style={{
                                        display: 'flex', flexDirection: 'row', alignItems: 'center',
                                        color: '#FFFFFF', textDecoration: 'none',
                                    }}
                                        href={`https://www.imdb.com/title/${detailsData.imdb_id}`} target="_blank" rel="noopener noreferrer"
                                    >
                                        <img src={imdbicon} alt="Smiley face" height="28" width="28" />
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
                            {videoData && <Videos parentData={videoData} />}
                            {apiParams && <Seasons parentData={apiParams, detailsData} />}
                            {apiParams && <Cast parentData={apiParams} />}
                            {apiParams && <Recommends parentData={apiParams} history={this.props.history} />}

                        </Grid>
                    </> :
                    <Backdrop className={classes.backdrop} open={refresh}  >
                        <CircularProgress color="inherit" />
                    </Backdrop>}
            </div>

        )
    }
}
const mapStateToProps = (state) => ({
    user: state.user
})
export default withStyles(styles)(connect(mapStateToProps)(withRouter(Details)))
