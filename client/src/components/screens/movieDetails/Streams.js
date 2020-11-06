import React from 'react'
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

function Streams(props) {
    const { platforms } = props.parentData
    return (
        <Grid
            style={{
                color: '#FFFFFF', alignItems: 'baseline',
                textDecoration: 'none',
            }}>
            <Typography variant="subtitle2">Streams:</Typography>

            {platforms && platforms.map((value, i) =>
                <Tooltip
                    title={''}
                    key={i}
                    placement="bottom-end"
                    aria-label="add">
                    <a style={{ margin: 10 }}
                        href={value.url} target="_blank" rel="noopener noreferrer"  >
                        <img src={value.icon} alt="Smiley face" width="70" />
                    </a>
                </Tooltip>
            )}
        </Grid>
    )
}

export default Streams
