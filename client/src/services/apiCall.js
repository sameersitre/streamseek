import axios from "axios"

const apiCall = async function (URL, data) {
    let result = null
    console.log(data)
    await axios.post(URL, data)
        .then((res) => {
            console.log(`API Called: ${URL}`)
            result = res.data
        }
        )
        .catch(function (error) {
            result = error
        })
    return result
}

export default apiCall        