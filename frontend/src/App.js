
import './App.css';
import React from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TestPage from './pages/TestPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import GaragePage from './pages/GaragePage';
import CameraPage from './pages/CameraPage';
import CatchPage from './pages/CatchPage';
import SearchPage from './pages/SearchPage';
import RelationList from './components/RelationList';
import FeatureRequest from './pages/FeatureRequest';
import DailyEvent from './pages/DailyEvent';

export default function App() {
    // Pass 'catch' location.state.image_source
    // Pass 'relations' location.state.owner and location.state.users
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"> {/* can put an element here https://www.w3schools.com/react/react_router.asp */}
                    <Route index element={<TestPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/garage/:profile?" element={<GaragePage />} />
                    <Route path="/camera" element={<CameraPage />} />
                    <Route path="/catch" element={<CatchPage />} /> 
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/relations" element={<RelationList />} />
                    <Route path="/bug-report" element={<FeatureRequest />} />
                    <Route path="/daily" element={<DailyEvent />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);