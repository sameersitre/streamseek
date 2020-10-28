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
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Dialog from '@material-ui/core/Dialog';
import SearchIcon from '@material-ui/icons/Search';
import MenuIcon from '@material-ui/icons/Menu';
import AndroidIcon from '@material-ui/icons/Android';
import AppleIcon from '@material-ui/icons/Apple';
import FilterListIcon from '@material-ui/icons/FilterList';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import { refreshDashboard, filterMovieData, searchTextAction, userInfoAction } from '../../containers/actions/userActions';
import sendUserProperty from '../../services/sendUserProperty'
import getGeolocation from '../../services/location'
import countryCode from '../../services/countryCode'
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
    sendUserProperty(locationInfo)

    this.setState({ userInfo: locationInfo })
    this.props.userInfoAction(locationInfo)
    window.addEventListener('resize', this.onResize, false);
  }

  onResize = () => {
    if ((window.innerWidth > window.innerHeight) && navigator.userAgent.indexOf('Mobile') > -1) {
      this.setState({ restrictDisplay: true })
    }
    else {
      this.setState({ restrictDisplay: false })
    }
  }

  handleClickOpen = () => {
    this.setState({ setDialog: true })
  };

  handleClose = () => {
    this.setState({ setDialog: false })
  };

  handleChange = (event) => {
    this.setState({ searchText: event.target.value })
  }

  handleKeyPress = async (event) => {
    if (event.key === 'Enter' && this.state.searchText.length !== 0) {
      window.scrollTo(0, 0)
      this.props.searchTextAction(this.state.searchText)
      this.props.history.push('/search/page1')
    }
  }

  handleDelete = (chipToDelete) => {

    var filtered = this.state.selectedGenres.filter(function (el) { return el.id !== chipToDelete.id; });
    var allGenres = this.state.allGenres

    allGenres.push(chipToDelete)
    this.setState({ allGenres: allGenres, selectedGenres: filtered })
    if (this.state.selectedGenres.length === 0) {
      this.props.refreshDashboard(false)
    }
  }

  handleAdd = (chipToadd) => {
    var filtered = this.state.allGenres.filter(function (el) { return el.id !== chipToadd.id; });
    var selectedGenres = this.state.selectedGenres

    selectedGenres.push(chipToadd)
    this.setState({ selectedGenres: selectedGenres, allGenres: filtered })
    this.props.refreshDashboard(true)
  }

  handleClear = () => {
    var selectedGenres = this.state.selectedGenres
    var allGenres = this.state.allGenres
    selectedGenres.filter((el) => allGenres.push(el))
    this.setState({ allGenres: allGenres, selectedGenres: [] })
    this.props.filterMovieData("")
    this.props.refreshDashboard(false)
  }

  filterIconClick = () => {
    this.setState({
      allGenresEnabled: !this.state.allGenresEnabled
    })
  }

  filterClick = () => {
    this.setState({
      allGenresEnabled: false
    })
    let data = this.state.selectedGenres
    let genreArray = [];
    for (let i = 0; i < data.length; i++) {
      genreArray.push(data[i].id)
    }
    let genreString = genreArray.join("%2C");
    // let params = { genres: genreString }
    this.props.filterMovieData(genreString)
    this.props.history.push("/filter/page1")
  }

  drawerSwitch = (toogle) => {
    this.setState({ drawerOpen: toogle })
  }

  render() {
    const { classes } = this.props;
    const { selectedGenres, userInfo } = this.state
    return (

      <AppBar
        elevation={0}
        style={{
          // width: window.outerWidth + 16,
          position: 'fixed',
          height: 80,
          background: 'linear-gradient(to top, transparent 0%, #000000 100%)',
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
          open={this.state.restrictDisplay}
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
            <IconButton component={Link} to='/all/page1'  >
              <Typography className={classes.title} variant="h6" noWrap  >
                BingeFeast
            </Typography>
              <Typography className={classes.title} style={{ color: '#E46E36' }} variant="h6" noWrap  >
                .in
            </Typography>
            </IconButton>

            <IconButton  >
              <Typography className={classes.title} variant="subtitle2"
                component={Link}
                style={{ color: window.location.pathname.indexOf(`/movies/page`) > -1 && '#E46E36' }}
                to={`/movies/page1`}
              >
                Movies
            </Typography>
            </IconButton>

            <IconButton  >
              <Typography className={classes.title}
                style={{ color: window.location.pathname.indexOf(`/tvshows/page`) > -1 && '#E46E36' }}
                variant="subtitle2"
                component={Link}
                to={`/tvshows/page1`}
              >
                TV Shows
            </Typography>
            </IconButton>

            <IconButton  >
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

              value={this.state.searchText}
              onChange={this.handleChange}
              onKeyPress={this.handleKeyPress}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>

          {/* FILTER */}
          <div className={classes.grow} />

          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', }} >
            <Paper className={classes.root}>
              <Chip
                size="small"
                clickable
                icon={<FilterListIcon style={{ marginRight: -12 }} />}
                className={classes.chip}
                style={{ display: 'flex', marginLeft: 5 }}
                onClick={() => this.filterIconClick()}
              />
              {selectedGenres.map(data => {
                let icon;
                return (
                  <Chip
                    size="small" key={data.id}
                    icon={icon} label={data.name}
                    onDelete={() => this.handleDelete(data)}
                    className={classes.chip}
                  />
                );
              })}

              {selectedGenres.length > 0
                ?

                <div>
                  <Chip
                    size="small" clickable label='CLEAR'
                    className={classes.chip}
                    style={{ borderTopRightRadius: 5, borderBottomRightRadius: 5 }}
                    onClick={() => this.handleClear()}
                  />

                  <Chip
                    size="small" clickable label='FILTER'
                    className={classes.chip}
                    style={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}
                    onClick={() => this.filterClick()}
                  />
                </div>
                : null
              }
            </Paper>

            {this.state.allGenresEnabled
              ?
              <Paper variant="outlined"
                elevation={3}
                style={{
                  position: 'absolute', justifyContent: 'space-evenly',
                  flexWrap: 'wrap', backgroundColor: '#5E5E5E', width: 250,
                  borderRadius: 11, padding: 5, top: 40, right: 0
                }} >
                {this.state.allGenres && this.state.allGenres.map(data => {
                  let icon;
                  return (
                    <Chip
                      size="small" key={data.id}
                      icon={icon} label={data.name}
                      onClick={() => this.handleAdd(data)}
                      style={{ margin: 3, padding: 0.2, }}
                      className={classes.chip}
                    />
                  );
                })}
              </Paper>
              : null}
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
