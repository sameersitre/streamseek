/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React from 'react';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';

import Appbar from './components/Appbar/Appbar';
import Dashboard from './components/screens/dashboard/Dashboard';
import Movies from './components/screens/movies/Movies';

import TVShows from './components/screens/tvshows/TVShows.js';
import Upcoming from './components/screens/upcoming/Upcoming';

import MovieDetails from './components/movieDetails/MovieDetails';
import Filter from './components/screens/filter/Filter';

import Search from './components/screens/search/Search'
const Routes = () => (
    <div style={{
        backgroundColor: '#000000',
        marginLeft: -8, marginRight: -8, marginTop: -8,
    }} >
        <Appbar />
        <Switch style={{ position: 'absolute', }}>
            <Route exact path="/" component={Dashboard} >
                <Redirect to="/all/page1" />
            </Route>
            <Route exact path="/all/page:pageNumber" component={Dashboard} />
            <Route exact path="/movies/page:pageNumber" component={Movies} />
            <Route exact path="/tvshows/page:pageNumber" component={TVShows} />
            <Route exact path="/upcoming/page:pageNumber" component={Upcoming} />
            <Route exact path="/search/page:pageNumber" component={Search} />
            <Route exact path="/details" component={MovieDetails} />
            <Route exact path="/filter/page:pageNumber" component={Filter} />

        </Switch>
    </div>
);
export default withRouter(Routes);
