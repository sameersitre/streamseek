/*
 * Author: Sameer Sitre
 * https://www.linkedin.com/in/sameersitre/
 * https://github.com/sameersitre
 * File Description:
 */

import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import Appbar from './components/Appbar/Appbar';

import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import Store from "./Store"
ReactDOM.render(

  <Provider store={Store} >
    <div style={{ backgroundColor: "#1B1A20", margin: -8, }} >
      <BrowserRouter>
        <Appbar />
        <App />
      </BrowserRouter>
    </div>
  </Provider>
  ,
  document.getElementById("root")
)
//serviceWorker.register()
