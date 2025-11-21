import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use"; // Optional to handle window resizing
import "../../assets/css/main/successPageStyle.css";

interface PurchasedProduct {
  namaBarang: string;
  harga: number;
  quantity: number;
}

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { purchasedProducts } = location.state as { purchasedProducts: PurchasedProduct[] }; // Add type here
  const { width, height } = useWindowSize(); // To adapt confetti to window size

  useEffect(() => {
    // Play the success sound when the components mounts
    const audio = new Audio(process.env.REACT_APP_SOUND_HURRAY);
    audio.play().catch((error) => console.error("Error playing audio:", error));

    // Optional: Clean up the audio object when the components unmounts
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <div className="success-page">
      <Confetti width={width} height={height} /> {/* Add Confetti here */}
      {/* Bagian Header */}
      <div className="header-success">
        <img
          src={require("../../assets/image/v1_14.png")}
          alt="Logo"
          className="logo-success"
        />
      </div>
      {/* Bagian Utama Konten */}
      <div className="content-success">
        <h1 className="h1-success">Transaksi Berhasil</h1>
        <p className="p-success">Terimakasih! sudah Mencuci di Operasabun</p>

        {/* Animasi Check Icon */}
        <div className="check-animation-success">
          <img
            src={require("../../assets/image/berhasil.png")}
            alt="Success Icon"
            className="check-icon-success"
          />
        </div>

        {/* Kotak Info Pembelian */}
        {/* <div className="info-box-success">
          <h2 className="h2-success">
            Silahkan Tunjukkan Tampilan ini Pada Crew Kami
          </h2>
          <ul className="ul-success">
            {purchasedProducts.map((product: PurchasedProduct, index: number) => (
              <li className="li-success" key={index}>
                <span>{product.namaBarang}</span>
                <span>{product.quantity} pcs</span>
                <span>= Rp {(product.harga * product.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div> */}

        {/* Tombol Kembali */}
        <div className="container-tombol">
          <button
            className="back-button-success"
            onClick={() => navigate("/offline-main-page")}
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
