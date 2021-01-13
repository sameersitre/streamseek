/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import FilterListIcon from '@material-ui/icons/FilterList';
import { filterMovieData, refreshDashboard } from '../../containers/actions/userActions';

const styles = (theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        maxWidth: 800,
        borderRadius: 13,
        padding: 0.2,
    },
    chip: {
        margin: theme.spacing(0.5),
    },
});

class ChipsArray extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allGenres: this.props.user.Genres.genres,
            selectedGenres: [],
            allGenresEnabled: false,
            updateOnce: true
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
        selectedGenres.filter(function (el) { allGenres.push(el) })
        this.setState({ allGenres: allGenres, selectedGenres: [] })
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
        this.props.filterMovieData(genreString)
        this.props.history.push("/filter/page1")
    }

    render() {
        const { classes } = this.props;
        const { selectedGenres, allGenresEnabled } = this.state
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                right: 30, top: 15, position: 'fixed', width: 270,
            }} >
                <Paper className={classes.root}
                    elevation={0}
                    style={{
                        backgroundColor: allGenresEnabled === true || selectedGenres.length > 0
                            ? 'rgba(192,192,192, 0.2)' : 'rgba(192,192,192, 0)'
                    }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', }}>
                            <Chip
                                size="small"
                                color="secondary"
                                style={{ backgroundColor: 'rgba(192,192,192, 0.4)' }}
                                clickable
                                icon={<FilterListIcon style={{ marginRight: -12 }} />}
                                className={classes.chip}
                                onClick={() => this.filterIconClick()}
                            />
                            {selectedGenres.length > 0
                                ?
                                <div>
                                    <Chip
                                        size="small" clickable label='CLEAR'
                                        color="secondary"
                                        className={classes.chip}
                                        style={{ backgroundColor: 'rgba(192,192,192, 0.2)', borderTopRightRadius: 5, borderBottomRightRadius: 5 }}
                                        onClick={() => this.handleClear()}
                                    />

                                    <Chip
                                        size="small" clickable label='FILTER'
                                        color="secondary"
                                        className={classes.chip}
                                        style={{ backgroundColor: 'rgba(192,192,192, 0.2)', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}
                                        onClick={() => this.filterClick()}
                                    />
                                </div>
                                : null
                            }
                        </div>

                        {selectedGenres && selectedGenres.map(data => {
                            let icon;
                            return (
                                <Chip
                                    key={data.id}
                                    size="small"
                                    color="secondary"
                                    style={{ backgroundColor: 'rgba(0,0,0, 0.3)', }}
                                    icon={icon} label={data.name}
                                    onDelete={() => this.handleDelete(data)}
                                    className={classes.chip}
                                />
                            );
                        })}
                    </div>

                    {allGenresEnabled ?
                            <Paper variant="outlined"
                            elevation={5}
                                style={{
                                    justifyContent: 'space-evenly',
                                    flexWrap: 'wrap', backgroundColor: 'rgba(192,192,192, 0.5)',
                                    borderRadius: 12, padding: 5, marginTop: 20 
                                }} >
                            <Typography variant="subtitle2" color='inherit'  >
                                Select Genres:
                                </Typography>
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
                </Paper>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    user: state.user
});
export default withStyles(styles)(connect(mapStateToProps, { filterMovieData, refreshDashboard })(withRouter(ChipsArray)));
