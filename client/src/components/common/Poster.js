/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import React, { PureComponent } from 'react'
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
const styles = (theme) => ({
    root: {
        width: '10rem',
        height: 250,
    },
    media: {
        height: 250,
    },
});
export class Poster extends PureComponent {
    render() {
        const { classes, data } = this.props;
        return (
            <Card className={classes.root}>
                <CardActionArea>
                    <CardMedia
                        className={classes.media}
                        image={`https://image.tmdb.org/t/p/w300${data.poster_path}`}
                        // title={`Original Title: ${data.original_name || data.original_title}`}
                    />
                </CardActionArea>
            </Card>
        )
    }
}
export default withStyles(styles)(Poster)
