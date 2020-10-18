/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import {
  SEARCH_TEXT_AVAILABLE, SEARCH_TEXT, GENRE_FILTER
} from './types';
import { main_url } from '../../utils/Config';
import { axios } from '../../services/apiCall';

export const refreshDashboard = data => (dispatch) => {
  dispatch({
    type: SEARCH_TEXT_AVAILABLE,
    payload: data
  })
};

export const searchTextAction = data => (dispatch) => {
  dispatch({
    type: SEARCH_TEXT,
    payload: data
  });
};

export const filterMovieData = data => async (dispatch) => {
  dispatch({
    type: GENRE_FILTER,
    payload: data
  });
  // let genreArray = [];
  // for (let i = 0; i < data.length; i++) {
  //   genreArray.push(data[i].id)
  // }
  // let genreString = genreArray.join("%2C");
  // let params = { genres: genreString }
  // await axios.post(`${main_url}/filter`, params)
  //   .then(res => {
  //     dispatch({
  //       type: FILTER_LIST,
  //       payload: res.data.results
  //     });
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   })
};
