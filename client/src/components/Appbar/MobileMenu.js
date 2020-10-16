import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from "react-router-dom";
import { withStyles, fade } from '@material-ui/core/styles';
 import { withRouter } from 'react-router-dom';
 import List from '@material-ui/core/List';
 import ListItem from '@material-ui/core/ListItem';
 import ListItemText from '@material-ui/core/ListItemText';
 
const styles = theme => ({
   
})
class MobileMenu extends Component {
  render() {
    const { classes } = this.props;

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
            style={{ color: window.location.pathname === "/" ? '#E46E36' : '#FFFFFF' }}>
            {/* <ListItemIcon  >  <InboxIcon /></ListItemIcon> */}
            <ListItemText primary="Trending" />
          </ListItem>

          <ListItem button
            component={Link} to={`/movies`}
            style={{ color: window.location.pathname === "/movies" ? '#E46E36' : '#FFFFFF' }}>
            {/* <ListItemIcon  >  <InboxIcon /></ListItemIcon> */}
            <ListItemText primary="Movies" />
          </ListItem>

          <ListItem button
            component={Link} to={`/tvshows`}
            style={{ color: window.location.pathname === "/tvshows" ? '#E46E36' : '#FFFFFF' }}>
            {/* <ListItemIcon  >  <InboxIcon /></ListItemIcon> */}
            <ListItemText primary="TV Shows" />
          </ListItem>

          <ListItem button
            component={Link} to={`/upcoming/page1`}
            style={{ color: window.location.pathname.indexOf(`/upcoming/page`) > -1 ? '#E46E36' : '#FFFFFF' }}
          >
            {/* <ListItemIcon  >  <InboxIcon /></ListItemIcon> */}
            <ListItemText primary="Upcoming Movies" />
          </ListItem>
        </List>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({

})
 
export default withStyles(styles)(withRouter(connect(mapStateToProps)(MobileMenu)));
