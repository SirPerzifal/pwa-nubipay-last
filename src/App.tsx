// src/App.tsx
import React, { useEffect } from "react";
import { Buffer } from "buffer";
import process from "process";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Authentication/Login";
import MainPageCrew from "./pages/main/mainPageCrew";
import ShopPage from "./pages/main/ShopPage";
import SuccessPage from "./pages/main/SuccessPage";
import TopUpCash from "./pages/Payment_methode/Cash";
import Qris from "./pages/Payment_methode/Qris";
import Fingerprint from "./pages/Authentication/FingerPrint";
import KodeOTP from "./pages/Authentication/KodeOTP";
import Register from "./pages/Authentication/Register";
import ByPassPage from "./pages/Authentication/BypassPage";
import { updateTitle } from "./utils/DynamicTitle";
import ChooseBranch from "./pages/ChooseBranch";
import SerialTest from "./pages/SerialTest";
import LoginPage from "./pages/OfflineMode/LoginPage";
import FingerprintOrOtp from "./pages/OfflineMode/FingferprinOrOtp";
import MainPage from "./pages/OfflineMode/MainPage";
import { NetworkStatusProvider } from "./utils/NetworkStatusProvider";
import TopUpPageOffline from "./pages/OfflineMode/TopUpPage";
import { SerialProvider } from "./hooks/SerialContext";

function AppRoutes() {
  // Set Buffer globally
  window.Buffer = Buffer;
  // Set process globally
  window.process = process;
  const location = useLocation();
  const isLoggedIn = sessionStorage.getItem("loggedUser"); // Mengecek apakah user sudah login

  useEffect(() => {
    const pageName = location.pathname.split("/").pop() || "Login";
    updateTitle(
      `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | Nubipay`
    );
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login-offline" element={<LoginPage />} />
      <Route path="/fingerprint-or-otp" element={<FingerprintOrOtp />} />
      <Route path="/offline-main-page" element={<MainPage />} />
      <Route path="/top-up-page-offline" element={<TopUpPageOffline />} />
      <Route path="/success-page-offline" element={<SuccessPage />} />
      {/* <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/main" /> : <Login />}
      /> */}
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/main" /> : <Login />}
      />
      <Route
        path="/bypass"
        element={isLoggedIn ? <Navigate to="/main" /> : <ByPassPage />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/main" /> : <Register />}
      />
      <Route
        path="/fingerprint"
        element={isLoggedIn ? <Navigate to="/main" /> : <Fingerprint />}
      />
      <Route
        path="/kodeOTP"
        element={isLoggedIn ? <Navigate to="/main" /> : <KodeOTP />}
      />
      {/* <Route
        path="/main"
        element={isLoggedIn ? <MainPage /> : <Navigate to="/" />}
      /> */}
      <Route path="/main/crew" element={<MainPageCrew />} />
      <Route
        path="/shop"
        element={isLoggedIn ? <ShopPage /> : <Navigate to="/" />}
      />
      <Route
        path="/success"
        element={isLoggedIn ? <SuccessPage /> : <Navigate to="/" />}
      />
      <Route
        path="/type/Qris"
        element={isLoggedIn ? <Qris /> : <Navigate to="/" />}
      />
      <Route
        path="/type/Cash"
        element={isLoggedIn ? <TopUpCash /> : <Navigate to="/" />}
      />
      <Route path="/choose-brand" element={<ChooseBranch />} />
      <Route path="/test-micro-controller" element={<SerialTest />} />
    </Routes>
  );
}

function App() {
  return (
    <SerialProvider>
      <Router>
        <div className="App">
          <NetworkStatusProvider>
            <AppRoutes />
          </NetworkStatusProvider>
        </div>
      </Router>
    </SerialProvider>
  );
}

export default App;
