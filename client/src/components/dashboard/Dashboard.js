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
import { withStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { trendingList } from '../../containers/actions/userActions';
import Card from '../commonComponents/Card.js';
import Container from '@material-ui/core/Container';
import Footer from '../commonComponents/Footer';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
});
class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            movieData: [],
            refresh: true
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.user) {
            return {
                movieData: nextProps.user.movie_data
            }
        }
        return null
    }
    componentDidMount() {
        window.scrollTo(0, 0)
        // if search box is empty, do action below
        let data = { "page": 1, "type": "all" }
        !this.props.user.search_text_available &&
            this.props.trendingList(data)
    }
    render() {
        return (
            <Grid
                spacing={0}
                style={{
                    backgroundColor: "#1B1A20",
                    minHeight: window.innerHeight
                }} >
                <Grid container xs={12} sm={12} direction='row' justify="space-evenly" alignItems='flex-start'
                    spacing={1} style={{ paddingTop: 80 }}>
                    {this.state.movieData && this.state.movieData.map((value, i) => (
                        <Grid key={i} item>
                            <Card parentData={value} />
                        </Grid>
                    ))}
                </Grid>

                {/* <Grid
                     xs={12} sm={12}
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                >
                    <Typography variant="h6" style={{ color: '#5A5A5A', }}  >
                        External api problem.   :(
                    </Typography>
                    <Typography variant="h6" style={{ color: '#5A5A5A', }}  >
                        Please Refresh.
                    </Typography>
                </Grid> */}

                {this.state.movieData && this.state.movieData.length > 0 &&
                    <Footer />
                }
            </Grid>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user
})
export default withStyles(styles)(connect(mapStateToProps, { trendingList })(withRouter(Dashboard)));