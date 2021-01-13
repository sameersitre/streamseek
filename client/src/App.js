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
    "%c\n\nThanks for seeing my work! :)\n\n",
    "background-color: #2937FF ; color: #ffffff ; font-size:21px ; padding: 4px ;"
  );
  return <Routes />
}

export default App
