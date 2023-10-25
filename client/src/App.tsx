import './App.css';
import {useContext, useState} from 'react';
import UserContext from './context/UserContext';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import OnboardingPage from './pages/OnboardingPage/OnboardingPage';
import AuthPage from './pages/AuthPage/AuthPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
