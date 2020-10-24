const getGeolocation = async () => {
    if ("geolocation" in navigator) {
        // check if geolocation is supported/enabled on current browser
        navigator.geolocation.getCurrentPosition(
            function success(position) {
                // for when getting location is a success
                localStorage.setItem("geolocation",
                    JSON.stringify({
                        'latitude': position.coords.latitude.toString(),
                        'longitude': position.coords.longitude.toString()
                    })
                )
            },
            function error(error_message) {
                // for when getting location results in an error
                localStorage.setItem("geolocation", "Denied."
                )
                console.error('An error has occured while retrieving location', error_message)
            }
        )
    } else {
        // geolocation is not supported
        // get your location some other way
        console.log('geolocation is not enabled on this browser')
    }
}
export default getGeolocation