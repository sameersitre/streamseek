import React from 'react'
import Typography from '@material-ui/core/Typography';

function Overview(props) {
    const { overview } = props.parentData
    return (
        <div>
            <Typography style={{ marginTop: 10 }} variant="subtitle2">Overview:</Typography>
            <Typography variant="body2">
                &nbsp;{overview}
            </Typography>
        </div>
    )
}

export default Overview
