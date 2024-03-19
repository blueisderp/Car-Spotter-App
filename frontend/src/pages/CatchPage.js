import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Buffer } from 'buffer';

import './CatchPage.css';
import NavBar from '../components/NavBar';
import loading from "../images/loading.gif";

export default function CatchPage() {
    // This route needs to be passed location.state.image_source
    const navigate = useNavigate();
    const location = useLocation();

    //predictions array for use later
    const [predictions, setPredictions] = useState(null);

    //prediction selection ID. This is the index of the selected prediction
    const [predID, setID] = useState(0);

    //this loads the predictions from the server based on the logged in user. It gets all unselected predictions based on the image
    useEffect(() => {
        let request_header = new Headers();
        function makeFetchRequest() { //just define, will call later
            // get the binary for the image
            const binaryData = Buffer.from(
                location.state.image_source.slice(22),
                'base64'
            )
            // this portion handles the geolocation
            // it uses the header since the body is binary image
            
            // start the fetch request
            fetch(window.location.origin + '/predict', {
                method: 'POST',
                headers: request_header,
                body: binaryData
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not OK")
                }
                return response.json();
            })
            .then(data => {
                console.log(data)
                setPredictions(data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
        }

        // this is the executing part. above was just defining a function
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    request_header.append(
                        "Geolocation",
                        JSON.stringify({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        })
                    )
                    makeFetchRequest()
                }
            )
        } else {
            makeFetchRequest()
        }
    }, []); // Empty dependency array ensures that this effect runs only once after the initial render.

    //this disables scrolling of the page
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "scroll"
        };
    }, []); // No scroll effect

    //this is the reject function. it simply just goes to the next prediction, cylcing when you reach the end of the prediction list
    function nextCar() {
        setID((predID + 1) % predictions.length)
    }

    //this is the select prediction function. When you select the prediction, it sends it to the server to save
    function selectPrediction(label) {
        const body = {
            label: label
        }

        fetch(window.location.origin + '/select_prediction', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not OK")
            }
            console.log(response);
            navigate("/garage");
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            navigate("/garage")
        })
    }

    //the main return to display the home page or main feed
    //this is the entire display of CatchPage
    return (
        <div width="100%">
            <div className="catchpage">
            <h1>Predictions</h1>
            
            { predictions === null? 
                (
                    <h1>Loading   <img src={loading} width="15vw"/></h1>
                ) 
            : 
                (
                    predictions.length < 1? 
                        (
                            <h1>Please take a photo of a car </h1>
                        )
                        :
                        (<div className="container">
                            {   <div>
                                    <div className="blist">
                                        <button className="btn" onClick={() => selectPrediction(predictions[predID]["label"])}>Select</button>
                                        <button className="rej" onClick={() => nextCar()}>X</button>
                                    </div>
                                    <h2>
                                        {
                                            Math.floor(predictions[predID]["confidence"]*100) + '% ' +
                                            predictions[predID]["make_name"]  + ' ' +
                                            predictions[predID]["model_name"] + ' ' +
                                            predictions[predID]["year_start"] + '-' + predictions[predID]["year_end"]
                                        }
                                    </h2>
                                    <img src={location.state.image_source} width="80%" height="80%"/>
                                    <h3>{predictions[predID]["description"]}</h3>
                                </div>
                            }
                        </div>
                        )
                    
                )
                        }
            <button className="inc" onClick={() => {navigate("/")}}>Prediction Incorrect?</button>
            
        </div>
        <NavBar/>
        </div>
        
    );
}
  
