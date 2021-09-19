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
import { getDetailsAction, getVideosAction, getOttAction, getCastAction, getRecommendsAction } from '../../../containers/actions/userActions';
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
      media_type: this.props.match.params.mediatype,
      page: 1
    }
    this.setState({ id: params.id, media_type: params.media_type, page: 1 })

    await this.props.getDetailsAction(params)
    await this.props.getVideosAction(params)
    await this.props.getOttAction(params)
    await this.props.getCastAction(params)
    await this.props.getRecommendsAction(params, result => {
      if (result.status === 1) {
        this.setState({ refresh: false })
      }
    })
  }

  render() {
    const { classes, details, videos, ottPlatforms, cast, recommends, user } = this.props;
    const { refresh, id, media_type } = this.state;
    const apiParams = { id, media_type }
    return (
      <div className={classes.root}  >
        {!!details ?
          <>
            <Background backdropPath={details?.backdrop_path} />
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
                  {details.title || details.name}
                </Typography>
                {details.tagline &&
                  <Typography gutterBottom variant="body2"
                    style={{ color: '#E5CA49' }}>
                    {details.tagline}
                  </Typography>
                }
              </Grid>

              <div
                style={{
                  display: 'flex', flexDirection: 'row',
                }}>
                <Poster data={details} />
                <Grid
                  style={{ margin: 5, flexDirection: 'row' }}
                >
                  {/* <ImdbIcon /> */}
                  <a style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                    color: '#FFFFFF', textDecoration: 'none',
                  }}
                    href={`https://www.imdb.com/title/${details.imdb_id}`} target="_blank" rel="noopener noreferrer"
                  >
                    <img src={imdbicon} alt="Smiley face" height="28" width="28" />
                    {details.vote_average > 0
                      ?
                      <Typography variant="body2"   >
                        &nbsp;&nbsp;{`${details.vote_average} (${details.vote_count})`}
                      </Typography>
                      :
                      <Typography variant="body2">&nbsp;&nbsp;NA</Typography>
                    }
                  </a>
                  <Typography variant="body2"   >
                    {moment(details.release_date
                      ||
                      details.first_air_date).format('ll')
                    } (USA)
                  </Typography>
                  <Typography variant="body2" style={{ marginTop: 10 }}  >
                    {details.runtime || details.episode_run_time} mins
                  </Typography>
                  <div className={classes.chipView} >
                    {details.genres && details.genres.map((value, i) =>
                      <div key={i}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'baseline'
                        }}>
                        <Typography variant="body2">{value.name}&nbsp;
                        </Typography>
                        {i + 1 !== details.genres.length ? (
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

              {ottPlatforms && <Streams ottPlatforms={ottPlatforms} />}
              <Overview parentData={details} />
              {videos && <Videos parentData={videos} />}
              {apiParams && <Seasons parentData={apiParams, details} />}
              {cast && <Cast parentData={cast} />}
              {recommends &&
                <Recommends
                  parentData={recommends}
                  history={this.props.history}
                  media_type={this.props.match.params.mediatype}
                />}

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
  user: state.user,
  details: state.details.details,
  videos: state.details.videos,
  ottPlatforms: state.details.ottPlatforms,
  cast: state.details.cast,
  recommends: state.details.recommends

})
export default withStyles(styles)(connect(mapStateToProps, { getDetailsAction, getVideosAction, getOttAction, getCastAction, getRecommendsAction })(withRouter(Details)))
