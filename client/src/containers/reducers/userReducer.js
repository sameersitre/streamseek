/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import {
  PRODUCT_LIST,
  USER_CART,
  SIZE_FILTER,
  CART_REMOVE,
  MOVIE_DATA, TVSHOW_DATA, DETAILS_DATA, BUFFER_ENABLE, SEARCH_RESULTS, SEARCH_TEXT_AVAILABLE
} from '../actions/types';

import Genres from '../../utils/Genres';
const initialState = {
  Genres,
  buffer_enable: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case PRODUCT_LIST:
      return {
        ...state,
        product_list: action.payload,
      };
    case USER_CART:
      return {
        ...state,
        user_cart: action.payload,
      };
    case SIZE_FILTER:
      return {
        ...state,
        size_filter: action.payload,
      };
    case MOVIE_DATA:
      return {
        ...state,
        movie_data: action.payload,
      };
    case TVSHOW_DATA:
      return {
        ...state,
        tvshow_data: action.payload,
      };
    case DETAILS_DATA:
      return {
        ...state,
        details_data: action.payload,
      }
    case CART_REMOVE:
      return {
        ...state,
        cart_remove: action.payload,
      };
    case BUFFER_ENABLE:
      return {
        ...state,
        buffer_enable: action.payload,
      };
    case SEARCH_RESULTS:
      return {
        ...state,
        search_results: action.payload,
      };
    case SEARCH_TEXT_AVAILABLE:
      return {
        ...state,
        search_text_available: action.payload,
      };

    default:
      return state;
  }
}
