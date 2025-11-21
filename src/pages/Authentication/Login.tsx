import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

import "../../assets/css/Auth/loginStyle.css";
import Modal from "../../components/ModalHelp";
import { checkUserInOdoo } from "../../utils/ExternalAPI";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalSKOpen, setIsModalSKOpen] = useState(false);
  const [isModalSKClosing, setIsModalSKClosing] = useState(false); // Untuk animasi penutupan
  const [isModalHelpOpen, setIsModalHelpOpen] = useState(false);
  const [isModalSuspendOpen, setIsModalSuspendOpen] = useState(false);
  const [animationClass, setAnimationClass] = useState<string>(""); // State animasi
  const navigate = useNavigate();

  // Function untuk menangani input nomor dari keypad
  const handleNumberClick = (number: string) => {
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
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
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
    setPhoneNumber("");
    setErrorMessage(""); // Bersihkan pesan error ketika clear
  };

  const handleBackspace = () => {
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
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
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
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

    try {
      const modifiedPhoneNumber = prependZeroIfNeeded(cleanPhoneNumber);
      const { partners, banned } = await checkUserInOdoo(modifiedPhoneNumber); // Memanggil fungsi dengan cleanPhoneNumber

      if (partners) {
        // Memeriksa status is_ban
        if (banned) {
          // Jika pengguna dibanned
          setIsModalSuspendOpen(true); // Buka modal suspend
        } else {
          console.log("Nomor Telepon yang diinput:", modifiedPhoneNumber);
          sessionStorage.setItem("isRegistered", "true"); // Tandai sebagai terdaftar
          sessionStorage.setItem("dataUser", JSON.stringify(partners));
          console.log("partner", JSON.stringify(partners));
          // sessionStorage.setItem('loggedUser', JSON.stringify(partners));
          navigate("/fingerprint", { state: { partners } }); // Arahkan ke halaman fingerprint
        }
      } else {
        console.log(
          "Nomor Telepon yang diinput (tidak terdaftar):",
          modifiedPhoneNumber
        );
        sessionStorage.setItem("isRegistered", "false"); // Tandai sebagai tidak terdaftar
        navigate("/register", { state: { modifiedPhoneNumber } }); // Arahkan ke halaman pendaftaran
      }
    } catch (error) {
      console.error("Error during user check:", error);
      setErrorMessage("Terjadi kesalahan saat memeriksa nomor telepon"); // Tampilkan pesan kesalahan
    }
  };

  const modalSK = () => {
    if (isModalSKOpen) {
      setIsModalSKClosing(true); // Mulai animasi penutupan
      setTimeout(() => {
        setIsModalSKOpen(false); // Tutup modal setelah animasi selesai
        setIsModalSKClosing(false); // Reset animasi
      }, 300); // Sesuaikan durasi dengan animasi penutupan (0.3s)
    } else {
      setIsModalSKOpen(true); // Buka modal
    }
  };

  const modalHelp = () => {
    if (isModalHelpOpen) {
      // Jika modal sedang terbuka, tambahkan kelas slide-up
      setAnimationClass("slide-up-help");
      // Tunggu animasi selesai sebelum menutup modal
      setTimeout(() => setIsModalHelpOpen(false), 300); // Durasi animasi (300ms)
    } else {
      // Jika modal tertutup, langsung buka dengan kelas slide-down
      setIsModalHelpOpen(true);
      setAnimationClass("slide-down-help");
    }
  };

  const modalSuspend = () => {
    if (isModalSuspendOpen) {
      setIsModalSuspendOpen(false);
    }
  };

  return (
    <div className="login-page">
      <div className="left-section">
        <img
          src={require("../../assets/image/v1_14.png")}
          alt="Opera Sabun Logo"
          className="logo"
        />
        <h1 className="welcome-text">
          SELAMAT DATANG DI <br />
          <span className="brand-text">OPERA SABUN</span>
        </h1>
      </div>
      <div className="right-section">
        <h2 className="command-text">MASUKKAN NOMOR TELEPON</h2>
        <div className="phone-input-container">
          <div className="country-code">
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
            className="phone-input"
            placeholder="8XX-XXXX-XXXX"
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}{" "}
        {/* Menampilkan pesan error */}
        <div className="keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="keypad-button"
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </button>
          ))}
          <button className="keypad-button clear-button" onClick={handleClear}>
            CLEAR
          </button>
          <button
            className="keypad-button"
            onClick={() => handleNumberClick("0")}
          >
            0
          </button>
          <button
            className="keypad-button backspace-button"
            onClick={handleBackspace}
          >
            <img
              className="delete-img"
              src={require("../../assets/image/delete.png")}
              alt="Delete"
            />
          </button>
        </div>
        <button type="submit" className="submit-button" onClick={handleSubmit}>
          Lanjut
        </button>
        <p className="SK">
          Dengan mengklik 'Lanjut', Anda setuju dengan{" "}
          <button className="buttonSK" onClick={modalSK}>
            <i>Syarat dan Ketentuan</i>
          </button>{" "}
          aplikasi ini.
        </p>
        <div className="footer">
          <img
            src={require("../../assets/image/Powered_by_Nubipay.png")}
            alt="Powered by SGEDEE"
            className="copyright"
          />
          <div className="help-container">
            <img
              src={require("../../assets/image/download.webp")}
              alt="Additional SVG"
              className="additional-svg"
            />
            <button className="buttonSK" onClick={modalHelp}>
              <img
                src={require("../../assets/image/v1_81.png")}
                alt="Help Icon"
                className="help-icon"
              />
            </button>
          </div>
        </div>
      </div>
      <img
        src={require("../../assets/image/v1_15.png")}
        alt="Mascot"
        className="mascot-background"
      />
      <button
        className="bypass-button-login"
        onClick={() => (window.location.href = "/test-micro-controller")}
      >
        tes
      </button>
      {/* Modal SK */}
      {isModalSKOpen && (
        <div
          className={`modal-overlay-sk ${
            isModalSKClosing ? "closing-modal-sk" : ""
          }`}
        >
          <div
            className={`modal-content-sk ${
              isModalSKClosing
                ? "anm-slide-up-modal-sk"
                : "anm-slide-down-modal-sk"
            }`}
          >
            <div className="header-modal-sk">Syarat dan Ketentuan Nubipay</div>
            <div className="container-modal-sk">
              <div className="content-modal-sk">
                <div className="section-modal-sk">
                  <h1>1. Pengantar</h1>
                  <h2>1.1. Kebijakan Nubipay</h2>
                  <p>
                    Selamat datang di Nubipay platform yang dioperasikan untuk
                    sistem pembayaran laundry self service di Indonesia. Nubipay
                    bertanggung jawab dan berkomitmen untuk menghormati hak dan
                    masalah privasi semua pengguna Nubipay. Kami mengakui
                    pentingnya data pribadi yang telah Anda percayakan kepada
                    kami dan percaya bahwa merupakan tanggung jawab kami untuk
                    mengelola, melindungi, dan mengolah data pribadi anda dengan
                    baik.
                  </p>
                </div>
                <div className="section-modal-sk">
                  <h1>2. Layanan</h1>
                  <h2>2.1. Kepemilikan Poin</h2>
                  <p>
                    Setiap Poin yang ada dalam akun Nubipay sepenuhnya milik
                    pengguna. Pengguna berhak menggunakan Poin tersebut untuk
                    melakukan setiap transaksi di Nubipay.
                  </p>
                  <h2>2.2. Penggunaan Poin</h2>
                  <p>
                    Poin yang terdapat dalam akun Nubipay dapat digunakan untuk
                    berbagai jenis transaksi seperti menjalankan mesin dan
                    pembelian item. Meskipun Poin pada akun Nubipay merupakan
                    milik pengguna, Poin tersebut{" "}
                    <strong>tidak dapat ditarik (withdraw)</strong> ke rekening
                    bank atau bentuk lainnya. Poin hanya dapat digunakan dalam
                    sistem Nubipay untuk keperluan transaksi yang telah
                    disebutkan di atas.
                  </p>
                  <h2>2.3 Kebijakan Keamanan</h2>
                  <p>
                    Pengguna bertanggung jawab untuk menjaga kerahasiaan
                    informasi akun mereka, sehingga diperlukan menggunakan nomor
                    telepon pribadi untuk login ke sistem. Kami tidak
                    bertanggung jawab atas kerugian yang timbul akibat
                    penyalahgunaan akun oleh pihak ketiga.
                  </p>
                  <h2>2.4. Hak Pengguna</h2>
                  <p>
                    Pengguna berhak mengajukan komplain kepada karyawan yang
                    bertugas, jika terdapat kesalahan terhadap nominal Poin
                    milik pengguna.{" "}
                  </p>
                  <h2>2.5. Perubahan Syarat dan ketentuan</h2>
                  <p>
                    Kami berhak untuk mengubah Syarat dan Ketentuan ini kapan
                    saja dengan atau tanpa pemberitahuan terlebih dahulu.
                    Perubahan akan berlaku segera setelah diperbarui di sistem
                    Nubipay. Pengguna disarankan untuk secara rutin memeriksa
                    Syarat dan Ketentuan untuk mengetahui adanya
                    perubahan.Dengan menggunakan sistem Nubipay, pengguna
                    dianggap telah membaca, memahami, dan menyetujui Syarat dan
                    Ketentuan ini.
                  </p>
                </div>
              </div>
            </div>
            <hr className="solid-hr-sk" />
            <div className="footer-modal-sk">
              <button onClick={modalSK}>Close</button>
            </div>
          </div>
        </div>
      )}

      {isModalHelpOpen && (
        <Modal
          isModalHelpOpen={isModalHelpOpen}
          toggleModal={modalHelp}
          animationClass={animationClass}
        />
      )}
      {isModalSuspendOpen && (
        <div className="overlay-modal-suspend">
          <div className="container-modal-suspend">
            <button className="close-modal-suspend" onClick={modalSuspend}>
              <FontAwesomeIcon icon={faCircleXmark} />
            </button>
            <div className="error-title-suspend">ERROR!!!</div>
            <div className="error-message-supend">
              NOMOR ANDA SEDANG DI SUSPEND
            </div>
            <div className="error-submessage-suspend">
              Mohon Konfirmasi dengan Admin Kami
            </div>
            <div className="illustration-suspend">
              <img
                alt="Illustration-suspend of a person with a headset sitting at a desk with a laptop and a notepad"
                className="illusadmin-suspend"
                src={require("../../assets/image/CHARACTER ADMINs 3.webp")}
              />
            </div>
            <button className="contact-button-suspend">
              <FontAwesomeIcon className="icon-suspend" icon={faWhatsapp} />
              HUBUNGI KAMI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
