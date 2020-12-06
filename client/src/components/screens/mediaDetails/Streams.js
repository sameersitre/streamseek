import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import apiCall from '../../../services/apiCall';
import { getOTTPlatformsURL } from '../../../services/apiURL'
 function Streams(props) {
     const { id } = props.parentData
     const [streamsList, setStreamsList] = useState();

     useEffect(() => {
        async function fetchData() {
            let streamsList = props.parentData.id && await apiCall(getOTTPlatformsURL, props.parentData)
            setStreamsList(streamsList.platforms)
        }
        fetchData();
    }, [id]);


    return ((streamsList?.length > 0) ?
        <Grid
            style={{
                color: '#FFFFFF', alignItems: 'baseline',
                textDecoration: 'none',
            }}>
            <Typography variant="subtitle2">Streams:</Typography>

            {streamsList?.map((value, i) =>
                <Tooltip
                    title={''}
                    key={i}
                    placement="bottom-end"
                    aria-label="add">
                    <a style={{ margin: 10 }}
                        href={value.url} target="_blank" rel="noopener noreferrer"  >
                        <img src={value.icon} alt="Smiley face" width="80" />
                    </a>
                </Tooltip>
            )}
        </Grid> : null
    )
}

export default Streams
