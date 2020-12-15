/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import React, { PureComponent } from 'react';
import { withStyles, fade } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Dialog from '@material-ui/core/Dialog';
import SearchIcon from '@material-ui/icons/Search';
import MenuIcon from '@material-ui/icons/Menu';
import AndroidIcon from '@material-ui/icons/Android';
import AppleIcon from '@material-ui/icons/Apple';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import Filter from './filter'
import { refreshDashboard, filterMovieData, searchTextAction, userInfoAction } from '../../containers/actions/userActions';
import getGeolocation from '../../services/location'
import countryCode from '../../services/countryCode'
import apiCall from '../../services/apiCall';
import { getInfo } from '../../services/apiURL'
const styles = theme => ({
  grow: {
    flexGrow: 1,
  },
  title: {
    display: 'none',
    textDecoration: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
    color: '#FFFFFF'
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.05),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    maxWidth: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 150,
    },
  },
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    backgroundColor: '#454545',
    maxWidth: 500,
    borderRadius: 25,
    padding: 0.2,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
});

class Appbar extends PureComponent {
  state = {
    setDialog: false,
    barColor: false,
    searchText: '',
    drawerOpen: false,
    allGenres: this.props.user.Genres.genres,
    selectedGenres: [],
    allGenresEnabled: false,
    updateOnce: true,
    restrictDisplay: false,
    userInfo: []
  }

  async componentDidMount() {
    await getGeolocation()
    let locationInfo = await countryCode()
    let params = {
      ip: locationInfo.ip,
      type: "webapp",
      region: locationInfo.region,
      colocation: locationInfo.colocation,
      accessDate: new Date(),
      userAgent: navigator.userAgent,
      routedFrom: localStorage.routedFrom
    }

    setTimeout(async () => {
      if (!localStorage.messageSent) {
        localStorage.setItem("messageSent", true)
        let userDetails = {
          ...params,
          coordinates: localStorage.geolocation && JSON.parse(localStorage.geolocation)
        }
        await apiCall(getInfo, userDetails)
      }
    }, 15000);
    this.props.userInfoAction(params)
    this.setState({ userInfo: locationInfo })
  } 


  handleChange = (event) => {
    this.setState({ searchText: event.target.value })
  }

  handleKeyUp = () => {
    if (this.state.searchText.length > 1) {
      let timedAssignText = this.state.searchText
      setTimeout(() => {
        if (timedAssignText === this.state.searchText) {
          this.getData()
        }
      }, 1300);
    }
  }

  getData = () => {
    this.props.searchTextAction(this.state.searchText)
    this.props.history.push('/search/page1')
  }

  drawerSwitch = (toogle) => {
    this.setState({ drawerOpen: toogle })
  }

  render() {
    const { classes } = this.props;
    const { userInfo } = this.state
    return (

      <AppBar
        elevation={0}
        style={{
          position: 'fixed',
          height: 80,
          background: 'linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.9) 100%)',
          backgroundColor: 'none'
        }
        }>
        <SwipeableDrawer anchor='left' open={this.state.drawerOpen}
          onClose={() => this.drawerSwitch(false)}
          onOpen={() => this.drawerSwitch(true)}
        >
          <MobileMenu drawerClose={() => this.drawerSwitch(false)} />
        </SwipeableDrawer>

        <Dialog
          fullScreen
          disableBackdropClick
          disableEscapeKeyDown
          style={{ width: '85%', height: '85%', margin: 'auto' }}
        >
          <div style={{
            width: '100%', height: '100%', color: '#FFFFFF', backgroundColor: '#1B1A20',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Typography variant="h6"   >
              For best experience,
          </Typography>
            <Typography variant="h6"   >
              please go back to portrait mode or use the app.
          </Typography>
            <IconButton color="inherit" width={50} height={50}
              href={`https://play.google.com/store/apps/details?id=com.bingefeast`} target="_blank"
            // onClick={() => this.handleAnalytics("Play store clicked")}
            >
              <AndroidIcon />
            </IconButton>

            <IconButton color="inherit"
            // href={`http://itunes.apple.com/lb/app/truecaller-caller-id-number/id448142450?mt=8`} target="_blank"
            // onClick={() => this.handleDialogOpen('Coming Soon!', 'Will be availabe soon on App Store.')}
            >
              <AppleIcon />
            </IconButton>
          </div>

        </Dialog>

        <Toolbar>

          <Hidden xsDown>
            <IconButton component={Link} to='/all/page1'
              onClick={() => this.setState({ searchText: '' })}  >
              <Typography className={classes.title} variant="h6" noWrap  >
                BingeFeast
            </Typography>
              <Typography className={classes.title} style={{ color: '#E46E36' }} variant="h6" noWrap  >
                .in
            </Typography>
            </IconButton>

            <IconButton onClick={() => this.setState({ searchText: '' })} >
              <Typography className={classes.title} variant="subtitle2"
                component={Link}
                style={{ color: window.location.pathname.indexOf(`/movies/page`) > -1 && '#E46E36' }}
                to={`/movies/page1`}
              >
                Movies
            </Typography>
            </IconButton>

            <IconButton onClick={() => this.setState({ searchText: '' })} >
              <Typography className={classes.title}
                style={{ color: window.location.pathname.indexOf(`/tvshows/page`) > -1 && '#E46E36' }}
                variant="subtitle2"
                component={Link}
                to={`/tvshows/page1`}
              >
                TV Shows
            </Typography>
            </IconButton>

            <IconButton onClick={() => this.setState({ searchText: '' })} >
              <Typography className={classes.title} variant="subtitle2"
                style={{ color: window.location.pathname.indexOf(`/upcoming/page`) > -1 && '#E46E36' }}
                component={Link}
                to={userInfo?.region && `/upcoming/page1&region=${userInfo.region}`}
              >
                Upcoming Movies
            </Typography>
            </IconButton>
          </Hidden>

          <Hidden smUp>
            <IconButton
              edge="start" className={classes.menuButton}
              color="inherit" aria-label="menu"
              onClick={() => this.drawerSwitch(true)}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>

          {/* SEARCH BOX  */}
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              onKeyUp={this.handleKeyUp}
              value={this.state.searchText}
              onChange={this.handleChange}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>

          {/* FILTER */}
          {/* <div className={classes.grow} /> */}
          <div>
            <Filter />
          </div>
        </Toolbar>
      </AppBar>

    );
  }
}


const mapStateToProps = state => ({
  user: state.user
});

export default withStyles(styles)(withRouter(connect(mapStateToProps, { refreshDashboard, filterMovieData, searchTextAction, userInfoAction })(Appbar)));
