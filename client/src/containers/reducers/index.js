/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import { combineReducers } from "redux";
import userReducer from "./userReducer";

export default combineReducers({
  user: userReducer,
});