import './App.scss';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import OnboardingPage from './pages/OnboardingPage/OnboardingPage';
import AuthPage from './pages/AuthPage/AuthPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import DetailsPage from './pages/DetailsPage/DetailsPage';
import ItemList from './components/ItemList/ItemList';
import AuthCheck from './features/authentication/components/AuthCheck';
import CreateItemPage from './pages/CreateItemPage/CreateItemPage';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              // <AuthCheck>
              <HomePage />
              // </AuthCheck>
            }
            errorElement={<ErrorPage />}
          />

          <Route
            path="/user/notifications"
            element={
              // <AuthCheck>
              <NotificationsPage />
              // </AuthCheck>
            }
            errorElement={<ErrorPage />}
          />

          <Route
            path="/item/:id"
            element={<DetailsPage />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="/item/:id/request"
            element={<ItemList url="books/" />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="/item/new"
            element={<CreateItemPage />}
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
