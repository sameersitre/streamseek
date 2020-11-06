import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import CardMedia from '@material-ui/core/CardMedia';

const useStyles = makeStyles({
    media: {
        width: '100vw',
        height: '100vh',
        backgroundSize: 'cover',
        position: 'fixed'
    },
});
function Background(props) {
    const classes = useStyles();
    return (
        <div>
            <CardMedia
                className={classes.media}
                image={`https://image.tmdb.org/t/p/w500${props.backdropPath}`}
            />

            {/* BACKGROUND LINEAR GRADIENT */}
            <div
                className={classes.media}
                style={{
                    background: 'linear-gradient(to left, transparent 0%, black 80%)',
                    position: 'fixed'
                }} >
            </div>
        </div>
    )
}

export default Background
