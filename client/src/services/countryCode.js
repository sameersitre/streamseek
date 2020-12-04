import axios from "axios"
const countryCode = async function () {
    let abc = {}
    await axios.get(`https://www.cloudflare.com/cdn-cgi/trace`)
        .then(async (res) => {
            let ip = res.data.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)[0]
            let region = res.data.match(/loc=(.*?)\n/s)
            let colo = res.data.match(/colo=(.*?)\n/s)

            abc = {
                ...abc,
                ip: ip,
                region: region[1],
                colocation: colo[1],
            }
        }
        ).catch(function (error) {
            return error
        })
    return abc
}
export default countryCode