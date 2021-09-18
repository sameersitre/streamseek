const getGeolocation = async () => {
    if ("geolocation" in navigator) {
        return navigator.geolocation.getCurrentPosition(
            function success(position) {
                localStorage.setItem("geolocation",
                    JSON.stringify({
                        'latitude': position.coords.latitude.toString(),
                        'longitude': position.coords.longitude.toString()
                    })
                )
            },
            function error(error_message) {
                localStorage.setItem("geolocation", null
                )
                console.error('An error has occured while retrieving location', error_message)
            }
        )
    } else {
        console.log('geolocation is not enabled on this browser')
    }
}
export default getGeolocation