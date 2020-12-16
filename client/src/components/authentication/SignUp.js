import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
            width: '25ch',
        },
        flexDirection: 'column',
        borderWidth: 10,
        borderColor: '#FFFFFF'
    },
    fields: {
        width: 250,
    },
    button: {
        width: 250,
        color: '#FFFFFF',

        backgroundColor: '#707070',
        margin: theme.spacing(0.9),
    }
}));
function SignUp(props) {
    const classes = useStyles();
    return (
        <form className={classes.root} noValidate autoComplete="off">
            <TextField className={classes.fields}
                error
                helperText="Incorrect entry."
                id="standard-basic" label="Email" type='email'
            />
            <TextField className={classes.fields}
                error
                helperText="Incorrect entry."
                id="standard-basic"
                label="Password" type="password" />
            <Button
                variant="outlined"
                color="secondary"
                size="medium"
                className={classes.button}
            >  Sign in   </Button>
        </form>
    )
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default SignUp
