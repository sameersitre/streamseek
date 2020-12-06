import React, { useState, useEffect } from 'react'
import './Cast.css'
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Button from "@material-ui/core/Button"
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import Typography from '@material-ui/core/Typography';
import apiCall from '../../../services/apiCall';
import { getCastDetailsURL } from '../../../services/apiURL'

function Cast(props) {
    let id = props.parentData.id;
    const myRef = React.createRef();
    const [castList, setCastList] = useState();

    useEffect(() => {
         setCastList()
        const fetchData = async () => {
            let castList = props.parentData.id && await apiCall(getCastDetailsURL, props.parentData)
            setCastList(castList.cast)
        }

        fetchData();
    }, [id]);

    const scroll = (scrollOffset) => {
        myRef.current.scrollLeft += scrollOffset;
    };

    return (
        castList ?
            <Grid style={{ marginTop: 15, marginBottom: 15, }}   >
                {castList.length > 1 &&
                    <div>
                        <Typography variant="subtitle2">Cast:</Typography>
                        <div style={{ display: 'flex', alignSelf: 'center', }}>
                            <Hidden xsDown>
                                <Button style={{
                                    backgroundColor: 'rgba(192,192,192, 0.2)',
                                    color: '#FFFFFF'
                                }} onClick={() => scroll(-250)}><ArrowBackIos /></Button>
                            </Hidden>
                            <div className='root' ref={myRef}>
                                {castList?.map((item, i) =>
                                    item.profile_path ?
                                        <div key={i} className="maincard" >
                                            <img
                                                className="poster"
                                                src={`https://image.tmdb.org/t/p/w500${item.profile_path}`}
                                                alt=""
                                            />
                                            <div className="castinfo" >
                                                <Typography variant="subtitle2">
                                                    {item.actor}
                                                </Typography>
                                                <Typography variant="caption">
                                                    {item.character}
                                                </Typography>
                                            </div>
                                        </div> : null)
                                }
                            </div>
                            <Hidden xsDown>
                                <Button style={{ backgroundColor: 'rgba(192,192,192, 0.2)', color: '#FFFFFF' }} onClick={() => scroll(+250)}><ArrowForwardIos /></Button>
                            </Hidden>
                        </div>
                    </div>}
            </Grid>
            :
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }} >
                <Typography variant="subtitle2">Checking Cast &nbsp;</Typography>
                <CircularProgress color="inherit" />
            </div>

    )
}

export default Cast
