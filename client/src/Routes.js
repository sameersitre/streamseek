/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import hocWrapper from './hocWrapper'
import Dashboard from './components/screens/dashboard/Dashboard';
import Movies from './components/screens/movies/Movies';
import TVShows from './components/screens/tvshows/TVShows.js';
import Upcoming from './components/screens/upcoming/Upcoming';
import MediaDetails from './components/screens/mediaDetails/MediaDetails';
import Filter from './components/screens/filter/Filter';
import Search from './components/screens/search/Search'
import Test from './components/screens/test/Test';
const Routes = (props) => (
    <Switch style={{ position: 'absolute' }}>
        <Route exact path={["/", "/routedFrom=:routedFrom"]} component={hocWrapper(Dashboard)} />
        <Route exact path="/all/page:pageNumber" component={hocWrapper(Dashboard)} />
        <Route exact path="/movies/page:pageNumber" component={hocWrapper(Movies)} />
        <Route exact path="/tvshows/page:pageNumber" component={hocWrapper(TVShows)} />
        <Route exact path="/upcoming/page:pageNumber&region=:region" component={hocWrapper(Upcoming)} />
        <Route exact path="/search/page:pageNumber" component={hocWrapper(Search)} />
        <Route exact path="/details/mediatype=:mediatype&id=:mediaid" component={hocWrapper(MediaDetails)} />
        <Route exact path="/filter/page:pageNumber" component={hocWrapper(Filter)} />
        <Route exact path="/test/page:pageNumber" component={hocWrapper(Test)} />
    </Switch>
);
export default withRouter(Routes);
