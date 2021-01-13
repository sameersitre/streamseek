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
import SearchIcon from '@material-ui/icons/Search';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Authentication from '../authentication/Authentication'
import MobileMenu from './MobileMenu';
import Filter from './filter'

import {
  refreshDashboard, filterMovieData, searchTextAction,
  userInfoAction, userProfileAction
} from '../../containers/actions/userActions';
import getGeolocation from '../../services/location'
import countryCode from '../../services/countryCode'
import apiCall from '../../services/apiCall';
import { getInfo } from '../../services/apiURL'
import { Avatar } from '@material-ui/core';
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
    isDialogOpen: false,
    barColor: false,
    searchText: '',
    drawerOpen: false,
    userPhotoURL: '',
    allGenres: this.props.user.Genres.genres,
    selectedGenres: [],
    allGenresEnabled: false,
    updateOnce: true,
    restrictDisplay: false,
    userInfo: [],
    auth: false,
    anchorEl_userMenu: null
  }

  async componentDidMount() {
    // await getGeolocation()
    // console.group(
    //   "%cWell this is embarassing; You might be getting what you are looking for :) .\nThanks for seeing my work!",
    //   "background-color: #2937FF ; color: #ffffff ; font-size:14px ; font-weight: bold ; padding: 4px ;"
    // );
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
    this.props.userProfileAction(localStorage.userProfile ?
      JSON.parse(localStorage.userProfile) :
      null)
    this.setState({
      userInfo: locationInfo,
    })
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.user.user_profile) {
      return {
        userPhotoURL: nextProps.user.user_profile.photoURL
      }
    }
    else return null
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

  handleuserMenu = (event) => {
    this.setState({ anchorEl_userMenu: event.currentTarget, });
  };

  handleuserMenuClose = () => {
    this.setState({ anchorEl_userMenu: null });
  };

  signInClick = () => {
    this.setState({ isDialogOpen: true, anchorEl_userMenu: null });
  }

  signUpClick = () => {
    this.setState({ isDialogOpen: true, anchorEl_userMenu: null });
  }
  //ben awad
  render() {
    const { classes } = this.props;
    const { userInfo, auth, drawerOpen, userPhotoURL, isDialogOpen, anchorEl_userMenu } = this.state
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
        <SwipeableDrawer anchor='left' open={drawerOpen}
          onClose={() => this.drawerSwitch(false)}
          onOpen={() => this.drawerSwitch(true)}
        >
          <MobileMenu drawerClose={() => this.drawerSwitch(false)} />
        </SwipeableDrawer>

        <Authentication
          isDialogOpen={isDialogOpen}
          setDialogClose={() => this.setState({ isDialogOpen: false })}
        />

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
          <div className={classes.grow} />

          {auth && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                // onClick={this.handleuserMenu}
                onClick={this.signInClick}
                color="inherit"

              >
                {userPhotoURL ? <Avatar src={userPhotoURL} alt="" /> : <AccountCircle />}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl_userMenu}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={anchorEl_userMenu}
                onClose={this.handleuserMenuClose}
              >
                <MenuItem onClick={this.signInClick}>Login</MenuItem>
              </Menu>
            </div>
          )}
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

export default withStyles(styles)(withRouter(connect(mapStateToProps, { refreshDashboard, filterMovieData, searchTextAction, userInfoAction, userProfileAction })(Appbar)));
