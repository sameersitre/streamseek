import axios from "axios"
const CountryCode = async function (URL, data) {
    let ip = null
    let countryCode = null
    await axios.get(`https://www.cloudflare.com/cdn-cgi/trace`)
        .then((res) => {
            let ipStructure = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
            let x = res.data.match(ipStructure)[0]
            ip = x
        }
        ).catch(function (error) {
            return error
        })

    await axios.get(`http://api.ipstack.com/${ip}?access_key=${process.env.REACT_APP_IPSTACK_KEY}&format=1`)
        .then((res) => {
            console.log(res.data)
            countryCode = res.data
        }
        ).catch(function (error) {
            return error
        })
    return countryCode
}
export default CountryCode