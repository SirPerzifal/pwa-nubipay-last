// src/App.tsx
import React, { useEffect } from 'react';
import { Buffer } from 'buffer';
import process from 'process';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Authentication/Login';
import MainPage from './pages/main/mainPage';
import ShopPage from './pages/main/ShopPage';
import SuccessPage from './pages/main/SuccessPage';
import TopUpCash from './pages/Payment_methode/Cash';
import Qris from './pages/Payment_methode/Qris';
import Fingerprint from './pages/Authentication/FingerPrint';
import KodeOTP from './pages/Authentication/KodeOTP';
import Register from './pages/Authentication/Register';
import ByPassPage from './pages/Authentication/BypassPage';
import { updateTitle } from './utils/DynamicTitle';

function AppRoutes() {
  // Set Buffer globally
  window.Buffer = Buffer;
  // Set process globally
  window.process = process;
  const location = useLocation();
  const isLoggedIn = sessionStorage.getItem('loggedUser'); // Mengecek apakah user sudah login

  useEffect(() => {
    const pageName = location.pathname.split('/').pop() || 'Login';
    updateTitle(`${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | Nubipay`);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/main" /> : <Login />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/main" /> : <Login />} />
      <Route path="/bypass" element={isLoggedIn ? <Navigate to="/main" /> : <ByPassPage />} />
      <Route path="/register" element={isLoggedIn ? <Navigate to="/main" /> : <Register />} />
      <Route path="/fingerprint" element={isLoggedIn ? <Navigate to="/main" /> : <Fingerprint />} />
      <Route path="/kodeOTP" element={isLoggedIn ? <Navigate to="/main" /> : <KodeOTP />} />
      <Route path="/main" element={isLoggedIn ? <MainPage /> : <Navigate to="/" />} />
      <Route path="/shop" element={isLoggedIn ? <ShopPage /> : <Navigate to="/" />} />
      <Route path="/success" element={isLoggedIn ? <SuccessPage /> : <Navigate to="/" />} />
      <Route path="/type/Qris" element={isLoggedIn ? <Qris /> : <Navigate to="/" />} />
      <Route path="/type/Cash" element={isLoggedIn ? <TopUpCash /> : <Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;