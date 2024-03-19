import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./BackButton.css"

export default function BackButton({ enableBackButton }){
    const navigate = useNavigate();
    

    if (enableBackButton) {
        return (
            <button className="backButton" style ={{width: '10%'}} onClick={() => navigate(-1)}>
                 &lt;
            </button>
        );
    } else {
        return null;
    }
};

