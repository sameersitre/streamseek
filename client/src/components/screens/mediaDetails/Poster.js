/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
const styles = (theme) => ({
    root: {
        width: '160px',
        height: '250px',
    },
    media: {
        height: '250px',
    },
});
export class Poster extends Component {
    state = {

    }
    static getDerivedStateFromProps(nextProps) {
        if (nextProps.data) {
            return {
                data: nextProps.data,
            }
        }
    }
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root} >
                <Card className={classes.root}  >
                    <CardMedia
                        className={classes.media}
                        image={`https://image.tmdb.org/t/p/w500${this.state.data.poster_path}`}
                        title={`Original Title: ${this.state.data.original_name || this.state.data.original_title}`}
                    />
                </Card></div>
        )
    }
}


const mapStateToProps = state => ({
    user: state.user
});


const mapDispatchToProps = {

}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Poster))
