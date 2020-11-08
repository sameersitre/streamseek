import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import apiCall from '../../../services/apiCall';
import { getOTTPlatformsURL } from '../../../services/apiURL'
import { event_GAnalytics } from "../../../utils/Analytics"
function Streams(props) {
    const { platforms } = props.parentData
    console.log(props)
    const myRef = React.createRef();
    const [streamsList, setStreamsList] = useState();

    useEffect(() => {

        async function fetchData() {
            let streamsList = props.parentData.id && await apiCall(getOTTPlatformsURL, props.parentData)
            setStreamsList(streamsList.platforms)
        }
        fetchData();
    }, [props.parentData.id]);


    return (
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
        </Grid>
    )
}

export default Streams
