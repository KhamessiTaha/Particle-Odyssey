import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SandboxPage from './pages/SandboxPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SandboxPage />} />
            </Routes>
        </Router>
    );
}

export default App;
