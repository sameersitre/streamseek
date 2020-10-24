import ReactGA from "react-ga"
export const initilizeGoogleAnalytics = () => {
  if (process.env.NODE_ENV !== "development") {
    ReactGA.initialize(process.env.REACT_APP_ANALYTICS_KEY)
  }
}

export const pageView = () => {
  ReactGA.pageview(window.location.pathname + window.location.search)
}

export const event_GAnalytics = (category, action, label) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  })
}
