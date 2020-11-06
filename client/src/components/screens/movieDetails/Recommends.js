import React, { useState, useEffect } from 'react'
import './Cast.css'
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import apiCall from '../../../services/apiCall';
import { getRecommendationsURL } from '../../../services/apiURL'
import { event_GAnalytics } from "../../../utils/Analytics"

function Recommends(props) {
    console.log(props)
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

    return (
        <Grid style={{ marginTop: 15 }}   >
            <Typography variant="subtitle2">Recommendations:</Typography>
            <div className='root'>
                {
                    castList?.results.map((item, i) =>
                        item.poster_path ?
                            <div key={i}
                                className="maincard"
                                onClick={() => setcardSelected(item)}
                            >
                                <img
                                    className="poster"
                                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                // alt="cast Image"
                                />
                            </div> : null
                    )
                }
            </div>
        </Grid>
    )
}

export default Recommends
