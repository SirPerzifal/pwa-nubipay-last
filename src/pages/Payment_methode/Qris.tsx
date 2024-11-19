import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import '../../assets/css/payment_methode/qrisStyle.css';
import { useNavigate } from 'react-router-dom';

const Qris = () => {
  const currencySymbol = ' ⓟ';
  const [user, setUser] = useState<any>(null);
  const [saldo, setSaldo] = useState<number>(0); // Saldo sekarang
  const [totalTopup, setTotalTopup] = useState<number>(0); // Saldo topup
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);
  const navigate = useNavigate();

  // Fetch user and saldo
  useEffect(() => {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser') || '{}');
    setUser(loggedUser);
    setSaldo(loggedUser.total_deposit || 0); // Set saldo from loggedUser
  }, []);

  const handleTopupClick = (amount: number) => {
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
    setTotalTopup(prev => prev + amount);
    setIsButtonPressed(true);

    // Reset the button press animation after 1 second
    setTimeout(() => {
      setIsButtonPressed(false);
    }, 1000);
  };

  const handleClear = () => {
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
    setTotalTopup(0);
  };

  const totalSaldo = saldo + totalTopup; // Calculate total saldo

  return (
    <div>
      <Header user={user} />
      <div className="container-qris">
        <div className="title-qris">TOP UP SALDO</div>
        <div className="subtitle-qris">Pilih dan Tekan Jumlah yang ingin di Top Up</div>
        <div className="buttons-qris">
          <div className="tombol-kiri-qris">
            <button
              onClick={() => handleTopupClick(10000)}
              className={isButtonPressed ? "animate-button" : ""}
            >10.000</button>
            <button
              onClick={() => handleTopupClick(100000)}
              className={isButtonPressed ? "animate-button" : ""}
            >100.000</button>
          </div>
          <div className="tombol-kanan-qris">
            <button
              onClick={() => handleTopupClick(50000)}
              className={isButtonPressed ? "animate-button" : ""}
            >50.000</button>
            <button
              onClick={() => handleTopupClick(500000)}
              className={isButtonPressed ? "animate-button" : ""}
            >500.000</button>
          </div>
        </div>
        <div className="wilayah-bawah-qris">
          <div className="wilayah-total-qris">
            <div className="total-payment-qris">Total Pembayaran :</div>
            <div className="payment-input-qris">
              <input type="text" value={totalTopup.toLocaleString()} readOnly />
              <button onClick={handleClear}>CLEAR</button>
            </div>
            <div className="total-payment-qris">Total Harga :</div>
            <div className="summary-qris">
              <div className="price-details-qris">
                  <div>
                      <span>Poin Sekarang</span>
                      <span>{saldo.toLocaleString()} {currencySymbol}</span>
                  </div>
                  <div>
                      <span>Poin Topup</span>
                      <span>Rp {totalTopup.toLocaleString()}</span>
                  </div>
                  <div>
                      <span className="bonus">Bonus</span>
                      <span>0 {currencySymbol}</span>
                  </div>
                  <div className="total">
                      <span>Total Poin</span>
                      <span>{totalSaldo.toLocaleString()} {currencySymbol}</span> {/* Total saldo = saldo sekarang + saldo topup */}
                  </div>
              </div>
            </div>
          </div>
          <div className="tombol-aksi-qris">
            <div className="actions-qris">
              <button className="back-qris" onClick={() => navigate("/main")}>Kembali</button>
              <button>Bayar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qris;
