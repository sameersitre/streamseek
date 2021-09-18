import axios from "axios"

const apiCall = async function (URL, data) {
    let result = null
    await axios.post(URL, data)
        .then((res) => {
             result = res.data
        }
        )
        .catch(function (error) {
            result = error
        })
    return result
}

export default apiCall        