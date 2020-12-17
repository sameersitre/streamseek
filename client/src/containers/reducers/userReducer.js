/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import {
  SEARCH_TEXT_AVAILABLE, SEARCH_TEXT, GENRE_FILTER, USER_INFO, USER_PROFILE
} from '../actions/types';

import Genres from '../../utils/Genres';
const initialState = {
  Genres,
  search_text: '',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SEARCH_TEXT_AVAILABLE:
      return {
        ...state,
        search_text_available: action.payload,
      };
    case SEARCH_TEXT:
      return {
        ...state,
        search_text: action.payload,
      };
    case GENRE_FILTER:
      return {
        ...state,
        genre_filter: action.payload,
      };
    case USER_INFO:
      return {
        ...state,
        user_info: action.payload,
      };
    case USER_PROFILE:
      return {
        ...state,
        user_profile: action.payload,
      };

    default:
      return state;
  }
}
