import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'; 


export default function TestPage() {
    const navigate = useNavigate();
    const [location, setLocation] = useState(null);

    //handle logout
    function logout() {
        fetch(window.location.origin + "/logout", {
            method: 'GET'
        })
        .then(response => {
            //Richard
            //checks if the response is okay
            if (response.ok) {
            console.log("logout response received ", response)
            } else {
            console.log("logout error")
            }
        })
    }



    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                }, (error) => {
                    console.error('Error getting geolocation:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    //render buttons that all call the changePage function 
    return (
        <div>
            <button onClick={() => {navigate("/login")}}>Login Page!</button>
            <button onClick={() => {navigate("/garage")}}>Garage Page!</button>
            <button onClick={() => {navigate("/home")}}>Home Page!</button>
            <button onClick={() => {navigate("/camera")}}>Camera Page!</button>
            <button onClick={() => {navigate("/bug-report")}}>Feature Request Page!</button>
            <button onClick={logout}>Log Out</button>

            {/*brian test */}
            <br/><br/><button onClick={getLocation}>Get Location</button>
            {location && (
                <p>Latitude: {location.latitude}, Longitude: {location.longitude}</p>
            )}


        </div>
    );

};
