/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */

import {
  CAST, DETAILS, OTT, VIDEOS, RECOMMENDS
} from '../actions/types';

const initialState = {

};

export default function (state = initialState, action) {
  switch (action.type) {
    case CAST:
      return {
        ...state,
        cast: action.payload,
      };
    case DETAILS:
      return {
        ...state,
        details: action.payload,
      };
    case OTT:
      return {
        ...state,
        ottPlatforms: action.payload,
      };
    case VIDEOS:
      return {
        ...state,
        videos: action.payload,
      };
    case RECOMMENDS:
      return {
        ...state,
        recommends: action.payload,
      };

    default:
      return state;
  }
}
