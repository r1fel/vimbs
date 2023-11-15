import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './Components/Homepage/Homepage';
import LoginPage from './Components/LoginPage/LoginPage';
import NavBar from './Components/NavBar/NavBar';
import './GlobalStyles.css';
import { myContext } from './Context';

function App() {
  const userObject = useContext(myContext);
  // console.log(userObject);
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Homepage />} />

        {userObject ? null : <Route path="/login" element={<LoginPage />} />}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
