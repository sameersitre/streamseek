/*
 * Author: Sameer Sitre
 * https://www.linkedin.com/in/sameersitre/
 * https://github.com/sameersitre
 * File Description:
 */

import React from "react"
import Routes from "./Routes"
import { initilizeGoogleAnalytics, pageView } from './utils/Analytics'
function App() {
  initilizeGoogleAnalytics()
  pageView()
  console.group(
    "%cWell this is embarassing; You might be getting what you are looking for :) .\nThanks for seeing my work!",
    "background-color: #2937FF ; color: #ffffff ; font-size:21px ; padding: 4px ;"
  );
  return <Routes />
}

export default App
