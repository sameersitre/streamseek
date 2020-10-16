import ReactGA from "react-ga"
import { GoogleAnalyticsKey } from "./Keys"

export const initilizeGoogleAnalytics = () => {
  ReactGA.initialize(GoogleAnalyticsKey)
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
