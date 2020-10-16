/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Footer from '../commonComponents/Footer';

import { searchResultData, trendingList } from '../../containers/actions/userActions';
import Card from '../commonComponents/Card.js';
class TVShows extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tvshowData: [],
            refresh: true
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.user) {
            return {
                tvshowData: nextProps.user.movie_data
            }
        }
    }

    componentDidMount() {
        window.scrollTo(0, 0)
        let data = { "page": 1, "type": "tv" }
        !this.props.user.search_text_available &&
            this.props.trendingList(data)
        console.log(window.location.pathname)
    }

    render() {
        return (
            <Grid
            style={{
                backgroundColor: "#1B1A20", minHeight: window.innerHeight
            }} >
            <Grid container xs={12} sm={12} direction='row' justify="space-evenly" alignItems='flex-start'
                spacing={1} style={{ paddingTop: 80 }}>
                {this.state.tvshowData && this.state.tvshowData.map((value, i) => (
                    <Grid key={i} item>
                        <Card parentData={value} />
                    </Grid>
                ))}
            </Grid>
            {this.state.tvshowData && this.state.tvshowData.length > 0 &&
                    <Footer />
                }
        </Grid>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user
})

// export default TVShows

export default connect(mapStateToProps, { searchResultData, trendingList })(withRouter(TVShows));