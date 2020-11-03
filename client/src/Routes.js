/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React from 'react';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom'; 
import Dashboard from './components/screens/dashboard/Dashboard';
import Movies from './components/screens/movies/Movies';
import TVShows from './components/screens/tvshows/TVShows.js';
import Upcoming from './components/screens/upcoming/Upcoming';
import MovieDetails from './components/screens/movieDetails/MovieDetails';
import Filter from './components/screens/filter/Filter';
import Search from './components/screens/search/Search'
import Test from './components/screens/test/Test';
const Routes = () => (
    <Switch style={{ position: 'absolute', }}>
        <Route exact path="/" component={Dashboard} >
            <Redirect to="/all/page1" />
        </Route>
        <Route exact path="/all/page:pageNumber" component={Dashboard} />
        <Route exact path="/movies/page:pageNumber" component={Movies} />
        <Route exact path="/tvshows/page:pageNumber" component={TVShows} />
        <Route exact path="/upcoming/page:pageNumber&region=:region" component={Upcoming} />
        <Route exact path="/search/page:pageNumber" component={Search} />
        <Route exact path="/details" component={MovieDetails} />
        <Route exact path="/filter/page:pageNumber" component={Filter} />
        <Route exact path="/test/page:pageNumber" component={Test} />
    </Switch>
);
export default withRouter(Routes);
