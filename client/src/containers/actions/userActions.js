/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import {
  SEARCH_TEXT_AVAILABLE, SEARCH_TEXT, GENRE_FILTER, USER_INFO
} from './types';
  
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
};

export const userInfoAction = data => async (dispatch) => {
  dispatch({
    type: USER_INFO,
    payload: data
  });
};
