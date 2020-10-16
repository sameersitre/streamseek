/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React from 'react';
import { Route, Switch, withRouter, Redirect, BrowserRouter } from 'react-router-dom';

import Appbar from './components/Appbar/Appbar';
import Dashboard from './components/dashboard/Dashboard';
import Movies from './components/movies/Movies';

import TVShows from './components/tvshows/TVShows.js';
import Upcoming from './components/upcoming/Upcoming';

import MovieDetails from './components/movieDetails/MovieDetails';
import Test from './components/test/Test'
const Routes = () => (
    <div style={{
        backgroundColor: '#000000',
       marginLeft: -8, marginRight: -8,marginTop:-8, 
    }} >
        <Appbar />
        <Switch style={{ position: 'absolute', }}>
            <Route exact path="/" component={Dashboard} />
            <Route exact path="/movies" component={Movies} />
            <Route exact path="/tvshows" component={TVShows} />
            <Route exact path="/upcoming/page:pageNumber" component={Upcoming} />
            <Route exact path="/details" component={MovieDetails} />
            <Route exact path="/test/page:pageNumber" component={Test} />
        </Switch>
    </div>
);
export default withRouter(Routes);
