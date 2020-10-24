import apiCall from './apiCall';
import { getInfo } from './apiURL'
import CountryCode from './countryCode'
const userProperty = async () => {
    let details = await CountryCode()
    localStorage.setItem("country_code", details.country_code)
    let params = {
        userAgent: navigator.userAgent,
        accessDate: new Date(),
        geoLocation: localStorage?.geolocation,
        ip: details.ip,
        continent_name: details.continent_name,
        country_code: details.country_code,
        country_name: details.country_name,
        region_name: details.region_name,
        city: details.city,
        zip: details.zip,
        latitude: details.latitude,
        longitude: details.longitude
    }
    await apiCall(getInfo, params)
    return params
}

export default userProperty