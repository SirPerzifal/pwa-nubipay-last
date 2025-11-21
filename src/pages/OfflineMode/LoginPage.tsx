import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../assets/css/OfflineMode/LoginPageOfflineMode.css";
import { useSQLite } from "../../hooks/useSQLite";
import { DBActions } from "../../db/action";

// LoginPage.tsx
const LoginPage: React.FC = () => {
  const sqlite = useSQLite();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // const [isModalSKOpen, setIsModalSKOpen] = useState(false);
  // const [isModalSKClosing, setIsModalSKClosing] = useState(false); // Untuk animasi penutupan
  // const [isModalHelpOpen, setIsModalHelpOpen] = useState(false);
  // const [isModalSuspendOpen, setIsModalSuspendOpen] = useState(false);
  // const [animationClass, setAnimationClass] = useState<string>(""); // State animasi
  const db = sqlite.isReady ? new DBActions(sqlite) : null;
  // Function untuk menangani input nomor dari keypad
  const handleNumberClick = (number: string) => {
    // const audio = new Audio(
    //   "https://res.cloudinary.com/dkxor4kjf/video/upload/v1731902627/button-pressed_dfpgqd.mp3"
    // );
    // audio.play();
    let input = phoneNumber.replace(/\D/g, ""); // Hapus karakter non-angka
    if (input.length < 14) {
      input += number; // Tambah angka ke input

      // Format input menjadi 8XX-XXXX-XXXX
      if (input.length > 3 && input.length <= 7) {
        input = `${input.slice(0, 3)}-${input.slice(3)}`;
      } else if (input.length > 7) {
        input = `${input.slice(0, 3)}-${input.slice(3, 7)}-${input.slice(
          7,
          14
        )}`;
      }
      setPhoneNumber(input); // Simpan nomor yang sudah diformat ke state
      setErrorMessage(""); // Bersihkan pesan error ketika user mulai mengetik
    }
  };

  // Function untuk menangani perubahan langsung pada input tel
  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let input = event.target.value.replace(/\D/g, ""); // Hapus karakter non-angka
    if (input.length > 3 && input.length <= 7) {
      input = `${input.slice(0, 3)}-${input.slice(3)}`;
    } else if (input.length > 7) {
      input = `${input.slice(0, 3)}-${input.slice(3, 7)}-${input.slice(7, 14)}`;
    }
    setPhoneNumber(input); // Simpan nomor yang sudah diformat ke state
  };

  const handleClear = () => {
    // const audio = new Audio(
    //   "https://res.cloudinary.com/dkxor4kjf/video/upload/v1731902627/button-pressed_dfpgqd.mp3"
    // );
    // audio.play();
    setPhoneNumber("");
    setErrorMessage(""); // Bersihkan pesan error ketika clear
  };

  const handleBackspace = () => {
    // const audio = new Audio(
    //   "https://res.cloudinary.com/dkxor4kjf/video/upload/v1731902627/button-pressed_dfpgqd.mp3"
    // );
    // audio.play();
    setPhoneNumber((prev) => {
      const input = prev.replace(/\D/g, ""); // Hapus karakter non-angka
      const updatedInput = input.slice(0, -1); // Hapus digit terakhir

      // Format input setelah backspace
      if (updatedInput.length > 3 && updatedInput.length <= 7) {
        return `${updatedInput.slice(0, 3)}-${updatedInput.slice(3)}`;
      } else if (updatedInput.length > 7) {
        return `${updatedInput.slice(0, 3)}-${updatedInput.slice(
          3,
          7
        )}-${updatedInput.slice(7, 14)}`;
      }
      return updatedInput;
    });
    setErrorMessage(""); // Bersihkan pesan error ketika backspace
  };

  function prependZeroIfNeeded(phoneNumber: string) {
    // Check if the phoneNumber starts with '0'
    if (!phoneNumber.startsWith("0")) {
      // Prepend '0' to the phoneNumber
      phoneNumber = "0" + phoneNumber;
    }
    return phoneNumber; // Return the modified phoneNumber
  }

  // Function untuk validasi nomor telepon dan navigasi
  const handleSubmit = async (event: React.FormEvent) => {
    // const audio = new Audio(
    //   "https://res.cloudinary.com/dkxor4kjf/video/upload/v1731902627/button-pressed_dfpgqd.mp3"
    // );
    // audio.play();
    event.preventDefault();

    if (phoneNumber === "") {
      setErrorMessage("Nomor telepon harus diisi");
      return;
    }

    const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");

    if (cleanPhoneNumber.length < 8) {
      setErrorMessage("Nomor telepon minimal 8 digit");
      return;
    }

    if (cleanPhoneNumber.length > 14) {
      setErrorMessage("Nomor telepon maksimal 14 digit");
      return;
    }

    const modifiedPhoneNumber = prependZeroIfNeeded(cleanPhoneNumber);
    console.log("Nomor Telepon yang diinput:", modifiedPhoneNumber);

    try {
      // Cek apakah user sudah ada
      const existingUser = await db?.getUser(modifiedPhoneNumber);

      if (existingUser) {
        // User sudah terdaftar, langsung login
        console.log("User sudah terdaftar:", existingUser);
        sessionStorage.setItem("userId", existingUser.id.toString());
        navigate("/fingerprint-or-otp");
        return;
      }

      // User belum ada, tambahkan ke database
      const setUserToDB = await db?.addUser(modifiedPhoneNumber, 0);

      if (!setUserToDB?.success) {
        setErrorMessage(
          setUserToDB?.error || "Gagal menambahkan user ke database"
        );
        return;
      }

      // Berhasil menambahkan user
      console.log("User berhasil ditambahkan dengan ID:", setUserToDB.userId);
      sessionStorage.setItem("userId", setUserToDB.userId.toString());
      navigate("/fingerprint-or-otp");
    } catch (error) {
      console.error("Error saat memproses user:", error);
      setErrorMessage("Terjadi kesalahan saat memproses data");
    }
  };

  return (
    <div id="div-root">
      <div id="left-section" className="left-section-login-offline-mode">
        <div id="logo-offline-mode">
          <img
            src={require("../../assets/image/v1_14.png")}
            alt="Opera Sabun Logo"
          />
        </div>
        <div id="greetings-offline-mode">
          <p>SELAMAT DATANG DI</p>
          <h1>OPERA SABUN</h1>
        </div>
        <div id="mascot-offline-mode">
          <img
            src={require("../../assets/image/v1_15.png")}
            alt="Mascot"
            className="mascot-background"
          />
        </div>
      </div>
      <div id="right-section" className="right-section-login-offline-mode">
        <h1>MASUKAN NOMOR TELEPON</h1>
        <div id="number-input-field-offline-mode">
          <div className="country-code-offline-mode">
            <p>
              <span role="img" aria-label="ID Flag">
                🇮🇩
              </span>{" "}
              +62
            </p>
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className="phone-input-offline-mode"
            placeholder="8XX-XXXX-XXXX"
          />
        </div>
        <div id="error-message-offline-mode">
          <p>{errorMessage}</p>
        </div>
        <div id="keypad-offline-mode">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="keypad-button-offline-mode"
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="keypad-button-offline-mode clear-button-offline-mode"
          >
            CLEAR
          </button>
          <button
            onClick={() => handleNumberClick("0")}
            className="keypad-button-offline-mode"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="keypad-button-offline-mode backspace-button-offline-mode"
          >
            <img
              className="delete-img-offline-mode"
              src={require("../../assets/image/delete.png")}
              alt="Delete"
            />
          </button>
        </div>
        <div id="lanjut-button-offline-mode">
          <button
            onClick={handleSubmit}
            type="submit"
            className="submit-button-offline-mode"
          >
            Lanjut
          </button>
        </div>
        <div id="sk-line-offline-mode"></div>
        <div id="powered-by-offline-mode"></div>
        <div id="tutorial-section-offline-mode"></div>
      </div>
    </div>
  );
};

export default LoginPage;
