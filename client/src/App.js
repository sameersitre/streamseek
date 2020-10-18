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
  return <Routes />
}

export default App
