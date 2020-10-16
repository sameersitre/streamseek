/*
 * Author: Sameer Sitre
 * https://www.linkedin.com/in/sameersitre/
 * https://github.com/sameersitre
 * File Description:
 */

import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import * as serviceWorker from "./serviceWorker"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import Store from "./Store"
ReactDOM.render(
  <Provider store={Store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
)
//serviceWorker.register()
