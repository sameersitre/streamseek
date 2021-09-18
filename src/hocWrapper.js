import React, { useEffect } from 'react';
import { useDispatch } from "react-redux";
import { searchTextAction } from './containers/actions/userActions'
export default function (ComposedClass) {
    const ClosedRouteForUser = (props) => {
        const dispatch = useDispatch();
        useEffect(() => {
            if (window.location.pathname !== `/search/page1` &&
                window.location.pathname.includes('details') === false) {
                dispatch(searchTextAction(''))
            }
        }, []);
        return <ComposedClass {...props} />;
    };
    return ClosedRouteForUser;
}