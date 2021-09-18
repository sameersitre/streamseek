import React, { Component } from 'react'
import { Link } from "react-router-dom";
import { withRouter } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { connect } from 'react-redux';

class MobileMenu extends Component {
  render() {
    const { user_info } = this.props.user
    return (
      <div
        style={{
          backgroundColor: '#151515', width: 200,
          height: window.innerHeight
        }}
        onClick={this.props.drawerClose}
      >
        <List>
          <ListItem button
            component={Link} to={`/`}
            style={{
              color: window.location.pathname.indexOf(`/all/page`) > -1 ? '#E46E36' : '#FFFFFF'
            }}
          >
            <ListItemText primary="Trending" />
          </ListItem>

          <ListItem button
            component={Link} to={`/movies/page1`}
            style={{
              color: window.location.pathname.indexOf(`/movies/page`) > -1 ? '#E46E36' : '#FFFFFF'
            }}
          >
            <ListItemText primary="Movies" />
          </ListItem>

          <ListItem button
            component={Link} to={`/tvshows/page1`}
            style={{
              color: window.location.pathname.indexOf(`/tvshows/page`) > -1 ? '#E46E36' : '#FFFFFF'
            }}
          >
            <ListItemText primary="TV Shows" />
          </ListItem>

          <ListItem button
            component={Link}
            to={user_info.region && `/upcoming/page1&region=${user_info.region}`}
            style={{
              color: window.location.pathname.indexOf(`/upcoming/page`) > -1 ? '#E46E36' : '#FFFFFF'
            }}
          >
            <ListItemText primary="Upcoming Movies" />
          </ListItem>
        </List>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default withRouter(connect(mapStateToProps, {})(MobileMenu));
