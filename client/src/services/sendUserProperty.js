import apiCall from './apiCall';
import { getInfo } from './apiURL'
const sendUserProperty = async (details) => {
    setTimeout(async () => {
        localStorage.setItem("region", details.region)
        let params = {
            ip: details.ip,
            region: details.region,
            colocation: details.colocation,
            accessDate: new Date(),
            coordinates: JSON.parse(localStorage.geolocation),
            userAgent: navigator.userAgent,
        }
        if (process.env.NODE_ENV !== "development" &&
            !localStorage.messageSent
        ) {
            localStorage.setItem("messageSent", true)
            await apiCall(getInfo, params)
        }

        return params
    }, 15000);

}

export default sendUserProperty