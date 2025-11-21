import React from "react";
import { useNavigate } from "react-router-dom";

// FingerprintOrOtp.tsx
const FingerprintOrOtp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fingerprint">
      <div className="logo-fingerprint">
        <img
          alt="Opera Sabun Logo"
          height="50"
          src={require("../../assets/image/v1_14.png")}
        />
      </div>
      <div className="title-fingerprint">
        LETAKAN JARI TELUNJUK ANDA PADA SCAN
      </div>
      <div className="subtitle-fingerprint">
        Pastikan Posisi Di Letakkan Dengan Jari Yang Di Daftar
      </div>
      <button
        onClick={() => (window.location.href = "offline-main-page")}
        className="tombol-aksi-fingerprint"
      >
        <div className="fingerprint" />
      </button>
      <button
        className="button-fingerprint button-fingerprint-left"
        onClick={() => navigate("/")}
      >
        Kembali
      </button>
    </div>
  );
};

export default FingerprintOrOtp;
