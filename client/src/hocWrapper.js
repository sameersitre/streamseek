import React, { useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';
import { useDispatch } from "react-redux";
import { searchTextAction } from './containers/actions/userActions'
export default function (ComposedClass) {
    const ClosedRouteForUser = (props) => {
        const dispatch = useDispatch();
        useEffect(() => {
            console.log(window.location.pathname)
            if (window.location.pathname !== `/search/page1` &&
                window.location.pathname.includes('details') === false) {
                dispatch(searchTextAction(''))
            }
        }, []);

        if (!true) {
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
