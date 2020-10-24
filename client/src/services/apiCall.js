import axios from "axios"

const apiCall = async function (URL, data) {
    let result = null
    await axios.post(URL, data)
        .then((res) => {
            console.log(`API Called: ${URL}, params:${JSON.stringify(data)}`)
            result = res.data
        }
        )
        .catch(function (error) {
            result = error
        })
    return result
}

export default apiCall        