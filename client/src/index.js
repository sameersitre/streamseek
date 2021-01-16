import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import Appbar from './components/Appbar/Appbar';
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import Store from "./Store"
import { ThemeProvider } from "@material-ui/core";
import theme from "./themeProvider";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={Store} >
      <ThemeProvider theme={theme}>
        <div style={{ backgroundColor: "#1B1A20", }} >
          <BrowserRouter>
            <Appbar />
            <App />
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
 
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
