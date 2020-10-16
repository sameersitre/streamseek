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
// import Pagination0 from './Pagination'
import Pagination from '@material-ui/lab/Pagination';
import Button from '@material-ui/core/Button';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

import { searchResultData, trendingList, testData, refreshDashboard } from '../../containers/actions/userActions';
import Card from '../commonComponents/Card.js';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const styles = (theme) => ({
    root: {
        color: '#FFFFFF',
        '& > *': {
            marginTop: theme.spacing(2),
        },
    },
    button: {
        color: '#FFFFFF',
        backgroundColor: '#E46E36',
        margin: theme.spacing(1),
    },

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
        let data = { "page": this.state.pageNumber, "type": "movie" }
        this.props.testData(data)
        console.log(window.location.pathname)
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.pageNumber != this.state.pageNumber) {
            let data = { "page": this.props.match.params.pageNumber, "type": "movie" }
            this.props.testData(data)
            this.setState({ pageNumber: this.props.match.params.pageNumber })
        }
    }

    pageClick = (value) => {
        window.scrollTo(0, 0)
        console.log(value)
        this.setState({ pageNumber: value })

        let data = { "page": value, "type": "movie" }
        this.props.history.push({ pathname: `/test/page${value}` })
        this.props.testData(data)
        if (value > 1) {
            this.props.refreshDashboard(true)
        }
    }

    render() {
        const { classes } = this.props;

        return (
            <Box
                style={{
                    display: "flex",
                    justifyContent: 'center',
                    justifySelf: 'center',
                    backgroundColor: "#1B1A20",
                    minHeight: window.innerHeight
                }}
            >
                <Grid item xs={11}>
                    <Grid container justify="center" spacing={4} style={{ paddingTop: 80 }}>
                        {this.state.upcomingData && this.state.upcomingData.map((value, i) => (
                            <Grid key={i} item>
                                <Card parentData={value} />
                            </Grid>
                        ))}
                    </Grid>

                    {this.state.upcomingData && this.state.upcomingData.length > 0 &&
                        <ThemeProvider theme={createMuiTheme({ palette: { type: 'dark' } })} >
                            <div style={{ display: "flex", marginTop: 80, justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    disabled={parseInt(this.props.match.params.pageNumber) <= 1 ? true : false}
                                    className={classes.button}
                                    startIcon={<NavigateBefore />}
                                    onClick={() => this.pageClick(this.props.match.params.pageNumber - 1)}
                                > Prev </Button>

                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    disabled={parseInt(this.state.upcomingData && this.state.upcomingData.length) < 20 ? true : false}
                                    className={classes.button}
                                    endIcon={<NavigateNext />}
                                    onClick={() => this.pageClick(parseInt(this.props.match.params.pageNumber) + 1)}
                                >Next </Button></div>
                        </ThemeProvider>
                    }
                    <Grid style={{ marginTop: 100 }}>
                    </Grid>
                </Grid>
            </Box>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user
})

export default withStyles(styles)(connect(mapStateToProps, { searchResultData, refreshDashboard, trendingList, testData })(withRouter(Upcoming)));
