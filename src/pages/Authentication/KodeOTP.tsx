import React, { useState } from "react";

import "../../assets/css/Auth/KodeOTPStyle.css";
import userData from "../../assets/data/user.json"; // Data user dari file JSON

const KodeOTP = () => {
    const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
    const [errorMessage, setErrorMessage] = useState("");
  
    const handleNumberClick = (number: string) => {
      const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
      audio.play();
      const updatedOtp = [...otp];
      const firstEmptyIndex = updatedOtp.findIndex((digit) => digit === "");
  
      if (firstEmptyIndex !== -1) {
        updatedOtp[firstEmptyIndex] = number; // Isi digit yang kosong pertama dengan angka yang ditekan
        setOtp(updatedOtp);
      }
    };
  
    const handleBackspace = () => {
      const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
      audio.play();
        const updatedOtp = [...otp];
        
        // Temukan index digit terakhir yang terisi
        const lastFilledIndex = updatedOtp.slice().reverse().findIndex((digit) => digit !== "");
      
        if (lastFilledIndex !== -1) {
          // Karena menggunakan reverse, kita perlu mengonversi indeks kembali
          updatedOtp[updatedOtp.length - 1 - lastFilledIndex] = ""; // Hapus digit terakhir yang terisi
          setOtp(updatedOtp);
        }
      };
  
    const handleClear = () => {
      const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
      audio.play();
      setOtp(["", "", "", ""]); // Reset semua kotak input OTP
      setErrorMessage("");
    };
  
    const handleSubmit = (event: React.FormEvent) => {
      const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
      audio.play();
      event.preventDefault();
  
      const otpCode = otp.join(""); // Gabungkan semua digit OTP
      if (otpCode.length < 4) {
        setErrorMessage("Masukkan 4 digit kode OTP.");
        const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_NEGATIVE);
        audio.play();
        return;
      }
  
      // Lakukan logika validasi atau API call untuk memeriksa OTP
      console.log("Kode OTP yang dimasukkan:", otpCode);
  
        // Cek apakah OTP ada di dalam user.json
        const user = userData.find((user) => user.kodeOTP === Number(otpCode));

        if (user) {
            console.log("OTP yang diinput:", otpCode);
            sessionStorage.setItem("loggedUser", JSON.stringify(user)); // Simpan data user ke sessionStorage
            window.location.href = "/main"; // Ganti halaman setelah memasukkan otp
        } else {
            setErrorMessage("Data tidak ditemukan"); // Tampilkan error jika otp tidak ditemukan
        }
    };

    const resendotp = () => {
        alert("kode dikirim ulang")
    }

  return (
    <div className="otp-page">
      <div className="otp-left-section">
        <img
          src={require("../../assets/image/v1_14.png")}
          alt="Opera Sabun Logo"
          className="logo-otp"
        />
        <h1 className="command-text-otp">
          MASUKKAN KODE VERIFKASI <br />
          <span className="announce-text-otp">KAMI TELAH MENGIRIMAN KODE KE NOMOR ANDA</span>
        </h1>
        <span className="ulang-kirim-otp">Tidak mendapatkan kode ? <button onClick={resendotp}>klik untuk mengirim ulang.</button></span>
      </div>
      <div className="right-section-otp">
        <div className="otp-input-container">
            {otp.map((digit, index) => (
                <div key={index} className="otp-box">
                {digit}
                </div>
            ))}
        </div>
        {errorMessage && <p className="error-message-otp">{errorMessage}</p>}{" "}
        {/* Menampilkan pesan error */}
        <div className="keypad-otp">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="keypad-button-otp"
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </button>
          ))}
          <button className="keypad-button-otp clear-button-otp" onClick={handleClear}>
            CLEAR
          </button>
          <button
            className="keypad-button-otp"
            onClick={() => handleNumberClick("0")}
          >
            0
          </button>
          <button
            className="keypad-button-otp backspace-button-otp"
            onClick={handleBackspace}
          >
            <img
              className="delete-img-otp"
              src={require("../../assets/image/delete.png")}
              alt="Delete"
            />
          </button>
        </div>
        <div className="button-container-otp">
            <button type="submit" className="submit-button-otp back-button-otp" onClick={() => window.location.href= "/login"}>
                Kembali
            </button>
            <button type="submit" className="submit-button-otp" onClick={handleSubmit}>
            Lanjut
            </button>
        </div>
      </div>
      <img
        src={require("../../assets/image/ILLUSTRASI OTP.webp")}
        alt="Illustrasi"
        className="illustrasi-background-otp"
      />
    </div>
  );
};

export default KodeOTP;
