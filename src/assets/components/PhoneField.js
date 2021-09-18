import { React, forwardRef } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles, createStyles, fade } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => createStyles({
    input: {
        backgroundColor: '#fff'
    }
}))

export function PhoneInput(props, ref) {
    const classes = useStyles()

    return (
        <TextField
            {...props}
            InputProps={{
                className: classes.input
            }}
            inputRef={ref}
            fullWidth
            size='small'
            label='Phone Number'
            variant='outlined'
            name='phone'
        />
    )
}
export default forwardRef(PhoneInput)