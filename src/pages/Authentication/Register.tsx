import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "../../assets/css/Auth/RegisterStyle.css";
import { registerUserInOdoo } from "../../utils/ExternalAPI";

const Register = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Mengambil nomor telepon dari state jika ada
    const state = location.state as { cleanPhoneNumber?: string };
    if (state && state.cleanPhoneNumber) {
      setPhoneNumber(formatPhoneNumber(state.cleanPhoneNumber));
    }
  }, [location]);

  const formatPhoneNumber = (number: string) => {
    const input = number.replace(/\D/g, "");
    if (input.length > 3 && input.length <= 7) {
      return `${input.slice(0, 3)}-${input.slice(3)}`;
    } else if (input.length > 7) {
      return `${input.slice(0, 3)}-${input.slice(3, 7)}-${input.slice(7, 12)}`;
    }
    return input;
  };

  // Function untuk menangani input nomor dari keypad
  // const handleNumberClick = (number: string) => {
  //   let input = phoneNumber.replace(/\D/g, "");
  //   if (input.length < 12) {
  //     input += number;
  //     setPhoneNumber(formatPhoneNumber(input));
  //     setErrorMessage("");
  //   }
  // };

  // Function untuk menangani perubahan langsung pada input tel
  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.target.value.replace(/\D/g, "");
    setPhoneNumber(formatPhoneNumber(input));
  };

  // const handleClear = () => {
  //   setPhoneNumber("");
  //   setErrorMessage("");
  // };

  // const handleBackspace = () => {
  //   setPhoneNumber((prev) => {
  //     const input = prev.replace(/\D/g, "").slice(0, -1);
  //     return formatPhoneNumber(input);
  //   });
  //   setErrorMessage("");
  // };

  function prependZeroIfNeeded(phoneNumber: string) {
    // Check if the phoneNumber starts with '0'
    if (!phoneNumber.startsWith('0')) {
      // Prepend '0' to the phoneNumber
      phoneNumber = '0' + phoneNumber;
    }
    return phoneNumber; // Return the modified phoneNumber
  }

  // Function untuk validasi nomor telepon dan navigasi
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const cleanedPhoneNumber = phoneNumber.replace(/\D+/g, ''); // Hanya ambil digit
    const phoneNumberLength = cleanedPhoneNumber.length;
  
    if (phoneNumberLength === 0) {
      setErrorMessage("Nomor telepon harus diisi");
    } else if (phoneNumberLength < 8) {
      setErrorMessage("Nomor telepon minimal 8 digit");
    } else if (phoneNumberLength > 14) {
      setErrorMessage("Nomor telepon maksimal 14 digit");
    } else {
      try {
        const modifiedPhoneNumber = prependZeroIfNeeded(cleanedPhoneNumber);
        const { success } = await registerUserInOdoo(modifiedPhoneNumber);
  
        if (success) {
          navigate('/fingerprint', { state: { phoneNumber: modifiedPhoneNumber } });
        } else {
          setErrorMessage("Gagal mendaftarkan nomor telepon Anda");
        }
      } catch (error) {
        console.error("Error registering user in Odoo:", error);
        setErrorMessage("Terjadi kesalahan saat mendaftarkan nomor telepon Anda");
      }
    }
  };

  return (
    <div className="register-page">
      <div className="left-section-regis">
        <img
          src={require("../../assets/image/v1_14.png")}
          alt="Opera Sabun Logo"
          className="logo-register"
        />
        <h1 className="announce-register">
          NOMOR TELEPON ANDA BELUM TERDAFTAR <br />
          <span className="command-register">Lakukan pendaftaran nomor telepon kamu di Opera Sabun</span>
        </h1>
      </div>
      <div className="right-section-regis">
        <h2 className="command-input-regis">MASUKKAN NOMOR TELEPON</h2>
        <div className="phone-input-regis-container">
          <div className="country-code-regis">
            <p><span role="img" aria-label="ID Flag">🇮🇩</span> +62</p>
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            readOnly
            className="phone-input-regis"
            placeholder="8XX-XXXX-XXXX"
          />
        </div>
        {errorMessage && <p className="error-message-regis">{errorMessage}</p>}{" "}
        {/* Menampilkan pesan error */}
        {/* <div className="keypad-regis">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="keypad-button-regis"
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </button>
          ))}
          <button className="keypad-button-regis clear-button-regis" onClick={handleClear}>
            CLEAR
          </button>
          <button
            className="keypad-button-regis"
            onClick={() => handleNumberClick("0")}
          >
            0
          </button>
          <button
            className="keypad-button-regis backspace-button-regis"
            onClick={handleBackspace}
          >
            <img
              className="delete-img-regis"
              src={require("../../assets/image/delete.png")}
              alt="Delete"
            />
          </button>
        </div> */}
        <div className="button-container-regis">
            <button type="submit" className="submit-button-regis back-button-regis" onClick={() => window.location.href= "/login"}>
                Kembali
            </button>
            <button type="submit" className="submit-button-regis" onClick={handleSubmit}>
            Lanjut
            </button>
        </div>
      </div>
      <img
        src={require("../../assets/image/regis.webp")}
        alt="illus"
        className="illus-background-regis"
      />
      </div>
        );
      };

export default Register;
