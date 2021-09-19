import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import apiCall from '../../../services/apiCall';
import { getOTTPlatformsURL } from '../../../services/apiURL'

function Streams(props) {



  return (
        <Grid
            style={{
                color: '#FFFFFF', alignItems: 'baseline',
                textDecoration: 'none',
            }}>
            <Typography variant="subtitle2">Streams:</Typography>

      {props.ottPlatforms?.platforms?.map((value, i) =>
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
