import React, { useState, useEffect } from 'react'
import './Cast.css'
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import apiCall from '../../../services/apiCall';
import { getCastDetailsURL } from '../../../services/apiURL'

function Cast(props) {
    console.log(props)
    const [castList, setCastList] = useState();
    useEffect(() => {
        async function fetchData() {
            let castList = props.parentData.id && await apiCall(getCastDetailsURL, props.parentData)
            setCastList(castList)
        }
        fetchData();
    }, [props.parentData.id]);


    return (
        <Grid style={{ marginTop: 15 }}   >
            <Typography variant="subtitle2">Cast:</Typography>
            <div className='root'>
                {
                    castList?.cast.map((item, i) =>
                        item.profile_path ?
                            <div key={i}
                                className="maincard" >
                                <img
                                    className="poster"
                                    src={`https://image.tmdb.org/t/p/w500${item.profile_path}`}
                                // alt="cast Image"
                                />
                                <div className="castinfo" >
                                    <Typography variant="subtitle2">
                                        {item.actor}
                                    </Typography>
                                    <Typography variant="caption">
                                        {item.character}
                                    </Typography>
                                </div>
                            </div> : null
                    )
                }
            </div>
        </Grid>
    )
}

export default Cast
