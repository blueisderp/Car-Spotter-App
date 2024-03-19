import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import "./FeatureRequest.css";

import loading from "../images/loading.gif";

export default function FeatureRequest() {
    const navigate = useNavigate(0);
    const [field, setField] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [complete, setComplete] = useState(false);
    const [yappingMessage, setYappingMessage] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    


    /* Left to do on this page:
    - Auto adjust text box for when user's request extends past the predefined dimensions for the text box? Shit sounds kinda hard ngl
    - Fix the structuring of text for "Do not submit multiple requests of the same kind", it sounds kinda weird
    */


    const handleSubmitClick = () => {
        setIsLoading(true);
    }


    const handleFieldUpdate = (event) => {
        setField(event.target.value);
    }

    const handleSubmit = async () => {

        setConfirmMessage('');
        setYappingMessage('');
        setIsLoading(true);

        if (!validateSubmission(field)) {
            setYappingMessage('Suggestion cannot be blank.')
            setIsLoading(false);
            return;
        }

        if (isYapping(field)) {
            setYappingMessage('Dawg, I ain\'t reading allat. 5000 characters or less.');
            setIsLoading(false);
            return;
        }

        setYappingMessage('');

        try {
            setStatus('waiting')
            const response = await fetch(window.location.origin + '/brs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({message: field})
            })

            setTimeout(() => {
                if (response.ok) {
                    setStatus('success');
                    setComplete(true);
                    setConfirmMessage("Thank you, your suggestion has been successfully submitted ✅");
                    setField(''); //clear suggestion field upon successful submission.
                } else {
                    setStatus('error');
                    setConfirmMessage("Error sending request. Please try again later.");
                    console.error('Fetch error:', response);
                }
                setIsLoading(false);
            }, 1500); //CHANGE THIS IF YOU WANT A SHORTER/LONGER PAUSE
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    }

    /*
    const renderStatus = () => { 
        //someone please fix this and the {renderStatus} line in the return
        switch(status) {
            case '':
                return ''
            case 'waiting':
                return <img src={loading} width="25vw"/>
            case 'error':
                return <p>error</p>
            case 'success':
                setField('')
                return <p>success</p>
        }
    }
    */

    const isYapping = (field) => {
        return field.length > 500;
    }

    const validateSubmission = (field) => {
        return field.length > 0;
    }

    return (
        <>
        <div className = "featureRequestPage">
        <BackButton enableBackButton={true} />
            <div className = "container" >
                <p>Please do not submit multiple requests of the same kind</p>
                <input type="text" value={field} onChange={handleFieldUpdate} placeholder="Describe your bug or suggestion"/>
                <button onClick={() => {handleSubmit()}}>Submit</button>
                <p><span style={{ color: field.length > 500 ? 'red' : 'white' }}>{field.length}</span>/500</p>
                {isLoading && <img src = {loading} width="25vw" />}

                {yappingMessage && <p>{yappingMessage}</p>}
                {confirmMessage && <p>{confirmMessage}</p>}

            </div>
        </div>
        </>
    )
}

