/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import {
  SEARCH_TEXT_AVAILABLE, SEARCH_TEXT, GENRE_FILTER,
  USER_INFO, USER_PROFILE, CAST, DETAILS, OTT, RECOMMENDS, VIDEOS
} from './types';

import apiCall from '../../services/apiCall';
import { getVideosURL, getDetailsURL, getOTTPlatformsURL, getCastDetailsURL, getRecommendationsURL } from '../../services/apiURL'

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

export const userProfileAction = data => async (dispatch) => {
  dispatch({
    type: USER_PROFILE,
    payload: data
  });
};


export const getCastAction = data => async (dispatch) => {
  await dispatch({ type: CAST, payload: null });

  await dispatch({
    type: CAST,
    payload: await apiCall(getCastDetailsURL, data)
  });
};

export const getDetailsAction = data => async (dispatch) => {
  await dispatch({ type: DETAILS, payload: null });

  await dispatch({
    type: DETAILS,
    payload: await apiCall(getDetailsURL, data)
  });
};

export const getOttAction = data => async (dispatch) => {
  await dispatch({ type: OTT, payload: null });

  await dispatch({
    type: OTT,
    payload: await apiCall(getOTTPlatformsURL, data)
  });
};

export const getRecommendsAction = (data, callBack) => async (dispatch) => {
  await dispatch({ type: RECOMMENDS, payload: null });
  let result = await apiCall(getRecommendationsURL, data)
  await dispatch({ type: RECOMMENDS, payload: result });
  callBack(result)
};

export const getVideosAction = data => async (dispatch) => {
  await dispatch({ type: VIDEOS, payload: null });

  await dispatch({
    type: VIDEOS, payload: await apiCall(getVideosURL, data)
  });
};
