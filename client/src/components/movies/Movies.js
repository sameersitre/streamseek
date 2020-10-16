/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { searchResultData, trendingList, upcomingMoviesData, refreshDashboard } from '../../containers/actions/userActions';
import Card from '../commonComponents/Card.js';
import Footer from '../commonComponents/Footer';

const styles = (theme) => ({
})
class Upcoming extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upcomingData: [],
            refresh: true,
            pageNumber: this.props.match.params.pageNumber,
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.user) {
            return {
                upcomingData: nextProps.user.movie_data
            }
        }
    }

    componentDidMount() {
        window.scrollTo(0, 0)
        // this.setState({pageNumber:this.props.match.params.pageNumber})
        let data = { "page": 1, "type": "movie" }
        this.props.trendingList(data)
        console.log(window.location.pathname)
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid
                style={{
                    backgroundColor: "#1B1A20", minHeight: window.innerHeight
                }} >
                <Grid container xs={12} sm={12} direction='row' justify="space-evenly" alignItems='flex-start'
                    spacing={1} style={{ paddingTop: 80 }}>
                    {this.state.upcomingData && this.state.upcomingData.map((value, i) => (
                        <Grid key={i} item>
                            <Card parentData={value} />
                        </Grid>
                    ))}
                </Grid>
                {this.state.upcomingData && this.state.upcomingData.length > 0 &&
                    <Footer />
                }
            </Grid>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user
})

export default withStyles(styles)(connect(mapStateToProps, { searchResultData, refreshDashboard, trendingList, upcomingMoviesData })(withRouter(Upcoming)));