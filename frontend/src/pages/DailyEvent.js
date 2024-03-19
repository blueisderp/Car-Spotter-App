import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import CarGuess from '../images/Acuralegend.jpg';
import "./DailyEvent.css";

export default function DailyEvent() {
    const [guesses, setGuesses] = useState(0); // Number of guesses made by the user
    const [message, setMessage] = useState(""); // Message to display to the user
    const [disableGuessing, setDisableGuessing] = useState(false); // Whether guessing is disabled
    const [zoomScale, setZoomScale] = useState(2); // Initial zoom scale

    // Function to handle user's guess
    const handleGuess = (isCorrect) => {
        if (disableGuessing) return; // If guessing is disabled, do nothing
        setGuesses(guesses + 1);
        if (!isCorrect && guesses === 0) {
            // If first incorrect guess, decrease scale to 1.4
            setZoomScale(1.4);
        } else if (isCorrect || guesses === 1) {
            // If correct guess or two failures, set scale to 1
            setZoomScale(1);
            // Disable further guessing
            setDisableGuessing(true);
        }

        // Set message based on guess result
        if (!isCorrect && guesses === 1) {
            setMessage("Sorry, you failed to guess the car.");
        } else if (isCorrect) {
            setMessage("Congratulations! You guessed the car correctly!");
        }

        // If user has made two guesses and both were incorrect, show failure message
        if (guesses === 1 && !isCorrect) {
            setMessage("Sorry, you failed to guess the car.");
            setDisableGuessing(true); // Disable further guessing
        }
    };

    // Function to handle hint button click
    const handleHint = () => {
        // Provide hint to the user (you can implement your hint logic here)
        setMessage("Hint: I think this car is Legend-ary");
    };

    // Calculate remaining guesses
    const remainingGuesses = 2 - guesses;

    return (
        <>
            <div className="dailyEventPage">
                <div className="container">
                    <h1>Daily Event: Guess the Car</h1>
                    {/* Render the image */}
                    <div className="image-container">
                        <img src={CarGuess} alt="Car" className="cropped-image" style={{ transform: `scale(${zoomScale})` }} />
                    </div>
                    {/* Render the guess buttons */}
                    <div>
                        <div className="button-container">
                            <button onClick={() => handleGuess(false)} disabled={disableGuessing}>The Legend</button>
                            <button onClick={() => handleGuess(false)} disabled={disableGuessing}>Honda Legend</button>
                            <button onClick={() => handleGuess(true)} disabled={disableGuessing}>Acura Legend</button>
                            <button onClick={() => handleGuess(false)} disabled={disableGuessing}>Toyota NSX</button>
                        </div>
                        {/* Render "Guesses Left" counter */}
                        <p>Guesses Left: {remainingGuesses}</p>
                        {/* Hint button */}
                        <br />
                        <button className="hint-button" onClick={handleHint} disabled={disableGuessing}>Hint</button>
                    </div>
                    {/* Render the message */}
                    <p>{message}</p>
                    {/* Render second message if guessing is disabled */}
                    {disableGuessing && <p>Come back tomorrow for a new Car of the Day!</p>}
                </div>
                
                <NavBar />
                
            </div>
        </>
    );
    
}