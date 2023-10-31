import './App.scss';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import OnboardingPage from './pages/OnboardingPage/OnboardingPage';
import AuthPage from './pages/AuthPage/AuthPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import DetailsPage from './pages/DetailsPage/DetailsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} errorElement={<ErrorPage />} />
          <Route
            path="/items/:id"
            element={<DetailsPage />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="/auth"
            element={<AuthPage />}
            errorElement={<ErrorPage />}
          />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
