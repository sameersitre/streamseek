import React, { useState, useEffect } from 'react';

import { withStyles } from '@material-ui/core/styles';
import {

    useParams
} from "react-router-dom";
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { getSeasonsURL } from '../../../services/apiURL'
import apiCall from '../../../services/apiCall';
import { Grid, Card } from '@material-ui/core';
import moment from 'moment'
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    card: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
});

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);


export default function EpisodeModal(props) {
    let { mediaid } = useParams();

    const [data, setdata] = useState()
    const [loading, setloading] = useState(false)
    const { id, poster_path, overview, name, episode_count, air_date } = props.parentData

    useEffect(() => {
        let params = {
            id: mediaid,
            seasonNumber: props.parentData.season_number,
        };
        async function getData() {
            setdata([])
            setloading(true)

            let apiData = await apiCall(getSeasonsURL, params)
            console.log({ apiData })
            await setdata(apiData)
            await setloading(false)
        }
        getData()
    }, [id])

    const handleClose = () => {
        props.modalOpen(false)
    };


    return (
        <div>
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={props.isOpen}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                </DialogTitle>
                <Grid
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        margin: 10
                        // justifyContent: 'space-between'
                    }}>
                    <div style={{ margin: 5 }}>
                        <img
                            style={{
                                // width: 130,
                                height: 190,
                                borderRadius: 5
                            }}
                            src={`https://image.tmdb.org/t/p/w500${poster_path}`}
                            alt=""
                        />
                    </div>
                    <div>
                        <Typography style={{ color: '#E5CA49' }}>{name}&nbsp;</Typography>
                        <Typography >EPISODES:  {episode_count}</Typography>

                        <Typography style={{ color: '#E5CA49' }}> {moment(air_date).format('ll')}&nbsp;</Typography>

                        <Typography variant='body2' style={{ color: '#E5CA49' }}>{overview}&nbsp;</Typography>
                    </div>
                </Grid>

                <DialogContent dividers>
                    <Grid style={{ display: 'flex', flexDirection: 'column' }}>
                        <Grid style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignSelf: 'center',
                            width: '100%',
                        }}>
                            {
                                data?.episodes?.map((item, i) =>
                                    <Card
                                        style={{
                                            maxWidth: '100%',
                                            marginBottom: 10,
                                        }}
                                    >
                                        <CardActionArea>
                                            <CardMedia
                                                style={{ height: 280 }}
                                                image={`https://image.tmdb.org/t/p/w780${item.still_path}`}
                                                title="Contemplative Reptile"
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h6" component="h2">
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" component="p">
                                                    {item.overview}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                )
                            }
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </div>
    );
}
