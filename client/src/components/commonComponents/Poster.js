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
import CardActionArea from '@material-ui/core/CardActionArea';

import CardMedia from '@material-ui/core/CardMedia';
const styles = (theme) => ({
    root: {
        width: '11rem',
        height: 300,
    },
    media: {
        height: 300,
    },
});
export class Poster extends Component {
    state = {

    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.data) {
            return {
                data: nextProps.data,
                // genres: nextProps.user.Genres
            }
        }
    }
    render() {
        const { classes } = this.props;

        return (
            <Card className={classes.root}>
               <CardActionArea>
                    <CardMedia
                        className={classes.media}
                        image={`https://image.tmdb.org/t/p/w500${this.state.data.poster_path}`}
                        title={`Original Title: ${this.state.data.original_name
                            ||
                            this.state.data.original_title}`
                        }
                    />
                </CardActionArea>
             </Card>
        )
    }
}


const mapStateToProps = state => ({
    user: state.user
});


const mapDispatchToProps = {

}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Poster))
