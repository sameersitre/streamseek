import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { searchTextAction } from './containers/actions/userActions'
export default function (ComposedClass) {
    const ClosedRouteForUser = (props) => {
        const [loading, setLoading] = useState(true);
        const reduxState = useSelector(state => state.user);
        const dispatch = useDispatch();


        useEffect(() => {
            console.log(window.location.pathname)
            if (window.location.pathname !== `/search/page1` &&
                window.location.pathname.includes('details') === false) {
                dispatch(searchTextAction(''))
            }

        }, []);

        if (!loading) {
            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                    }}
                >
                    <CircularProgress style={{ color: 'primary' }} thickness={7} />
                </div>
            );
        } else {
            return <ComposedClass />;
        }
    };
    return ClosedRouteForUser;
}
