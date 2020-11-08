import React, { useState, useEffect } from 'react'
import './Recommends.css'
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
    console.log(props)
    const myRef = React.createRef();
    const [castList, setRecommendsList] = useState();
    const [cardSelected, setcardSelected] = useState();

    useEffect(() => {

        async function fetchData() {
            let params = { ...props.parentData, page: 1 }
            let castList = params.id && await apiCall(getRecommendationsURL, params)
            setRecommendsList(castList)
        }
        fetchData();
    }, [props.parentData.id]);


    function cardClick() {
        event_GAnalytics("Card", "Click", cardSelected)
        localStorage.setItem(
            "selectedMovieDetails",
            JSON.stringify(cardSelected)
        )
        props.history.push({ pathname: `/details` })
    }
    const scroll = (scrollOffset) => {
        myRef.current.scrollLeft += scrollOffset;
    };

    return (
        <Grid style={{ marginTop: 15, marginBottom: 15, }}   >
            <Typography variant="subtitle2">Recommendations:</Typography>
            <div style={{ display: 'flex', alignSelf: 'center' }}>
                <Hidden xsDown>
                    <Button style={{ backgroundColor: 'rgba(192,192,192, 0.2)', color: '#FFFFFF' }} onClick={() => scroll(-250)}><ArrowBackIos /></Button>
                </Hidden>
                <div className='rec-root' ref={myRef}>
                    {
                        castList?.results.map((item, i) =>
                            item.poster_path ?
                                <div key={i}
                                    className="rec-maincard"
                                    onClick={() => setcardSelected(item)}
                                >
                                    <img
                                        className="rec-poster"
                                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                    // alt="cast Image"
                                    />
                                </div> : null
                        )

                    }
                </div>
                <Hidden xsDown>
                    <Button style={{ backgroundColor: 'rgba(192,192,192, 0.2)', color: '#FFFFFF' }} onClick={() => scroll(+250)}><ArrowForwardIos /></Button>
                </Hidden>
            </div>
        </Grid>
    )
}

export default Recommends
