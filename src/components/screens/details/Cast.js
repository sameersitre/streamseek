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
  const { cast } = props.parentData;
  const myRef = React.createRef();
    const [leftBtnHidden, setleftBtnHidden] = useState(true)
  const [rightBtnHidden, setrightBtnHidden] = useState(false)


    const scroll = (scrollOffset) => {
        myRef.current.scrollLeft += scrollOffset;
    };

    const handleScroll = (e) => {
        const rightend = e.target.scrollWidth - e.target.scrollLeft === e.target.clientWidth;
        if (rightend) {
            setrightBtnHidden(true)
        }
        else
            setrightBtnHidden(false)

        if (e.target.scrollLeft === 0) {
            setleftBtnHidden(true)
        }
        else
            setleftBtnHidden(false)
    }

    return (
      cast ?
            <Grid style={{ marginTop: 15, marginBottom: 15, }}   >
          {cast.length > 1 &&
                    <div>
                        <Typography variant="subtitle2">Cast:</Typography>
                        <div style={{ display: 'flex', alignSelf: 'center', }}>
                            <Hidden xsDown>
                                <Button style={{
                                display: leftBtnHidden ? 'none' : 'block',
                                float: 'left', position: 'absolute', zIndex: 2,
                                height: 240,
                                backgroundColor: 'rgba(0,0,0, 0.7)',
                                    color: '#FFFFFF'
                                }} onClick={() => scroll(-250)}><ArrowBackIos /></Button>
                            </Hidden>
                        <div className='c_root' ref={myRef} onScroll={handleScroll}>
                {cast?.map((item, i) =>
                                    item.profile_path ?
                                        <div key={i} className="c_maincard" >
                                            <img
                                                className="c_poster"
                                                src={`https://image.tmdb.org/t/p/w500${item.profile_path}`}
                                                alt=""
                                            />
                                            <div className="c_castinfo" >
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
                            <Button style={{
                                display: rightBtnHidden ? 'none' : 'block',
                                float: 'right', right: 0, position: 'absolute', zIndex: 2,
                                height: 240,
                                backgroundColor: 'rgba(0,0,0, 0.7)', color: '#FFFFFF'
                            }} onClick={() => scroll(+250)}><ArrowForwardIos /></Button>
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
