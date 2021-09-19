import React, { useState, useEffect } from 'react'
import './Recommends.css'
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Button from "@material-ui/core/Button"
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import Typography from '@material-ui/core/Typography';
import apiCall from '../../../services/apiCall';
import { getRecommendationsURL } from '../../../services/apiURL'
import { event_GAnalytics } from "../../../utils/Analytics"

function Recommends(props) {
  const { results } = props.parentData
  const myRef = React.createRef();
  const [leftBtnHidden, setleftBtnHidden] = useState(true)
  const [rightBtnHidden, setrightBtnHidden] = useState(false)



  function cardClick(params) {
    event_GAnalytics("Card", "Click", params)
    props.history.push({ pathname: `/details/mediatype=${props.media_type}&id=${params.id}` })
  }
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
    <Grid style={{ marginTop: 15, marginBottom: 25, }}   >
      {results?.length > 0 &&
        <div>
          <Typography variant="subtitle2">Recommendations:</Typography>
          <div style={{ display: 'flex', alignSelf: 'center' }}>
            <Hidden xsDown>
              <Button style={{
                display: leftBtnHidden ? 'none' : 'block', float: 'left',
                position: 'absolute', zIndex: 2, height: 200,
                backgroundColor: 'rgba(0,0,0, 0.6)', color: '#FFFFFF'
              }} onClick={() => scroll(-250)}><ArrowBackIos /></Button>
            </Hidden>
            <div className='rec-root' ref={myRef} onScroll={handleScroll}>
              {
                results?.map((item, i) =>
                  item.poster_path ?
                    <div key={i}
                      className="rec-maincard"
                      onClick={() => cardClick(item)}
                    >
                      <img
                        className="rec-poster"
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt=""
                      />
                    </div> : null
                )
              }
            </div>
            <Hidden xsDown>
              <Button style={{
                display: rightBtnHidden ? 'none' : 'block', float: 'right', right: 0,
                position: 'absolute', height: 200,
                backgroundColor: 'rgba(0,0,0, 0.6)', zIndex: 5, color: '#FFFFFF'
              }} onClick={() => scroll(+250)}><ArrowForwardIos /></Button>
            </Hidden>
          </div>
        </div>
      }

    </Grid>

  // <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }} >
  //   <Typography variant="subtitle2">Checking Recommends &nbsp;</Typography>
  //   <CircularProgress color="inherit" />
  // </div>

    )
}

export default Recommends
