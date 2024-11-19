import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import '../../assets/css/payment_methode/cashStyle.css';

const TopUpCash: React.FC = () => {
  const currencySymbol = ' ⓟ';
  const [user, setUser] = useState<any>(null);
  const [payment, setPayment] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0); // Sebagai contoh, saldo awal 50.000
  const [bonus, setBonus] = useState<number>(0);
  const navigate = useNavigate(); 

  useEffect(() => {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser') || '{}');
    setUser(loggedUser);
    setCurrentBalance(loggedUser.total_deposit)
  }, []);

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPayment(isNaN(value) ? 0 : value);
  };

  const clearPayment = () => {
    setPayment(0);
  };

  const pay = () => {
    const newBonus = payment * 0.1; // contoh bonus 10%
    const newBalance = currentBalance + payment + newBonus;

    setCurrentBalance(newBalance);
    setBonus(newBonus);
  };

  return (
    <div>
      <Header user={user} />
      <div className="title-cash">TOP UP SALDO</div>
      <div className="topup-container">
        <div className="container-left-section">
          <div className="section-cash">
            <div className="section-title-cash">Total Pembayaran :</div>
            <div className="input-group-cash">
              <input 
                type="text" 
                value={payment.toLocaleString()} 
                onChange={handlePaymentChange} // Tambahkan event handler
                placeholder="Masukkan jumlah"
              />
              <button onClick={clearPayment}>CLEAR</button>
            </div>
          </div>
          <div className="section-cash">
            <div className="section-title-cash">Total Harga :</div>
            <div className="price-details-cash">
              <div>
                <span>Poin Sekarang</span>
                <span>{currentBalance.toLocaleString()} {currencySymbol}</span>
              </div>
              <div>
                <span>Poin Topup</span>
                <span>Rp {payment.toLocaleString()}</span>
              </div>
              <div>
                <span className="bonus">Bonus</span>
                <span>{bonus.toLocaleString()}  {currencySymbol}</span> {/* Tampilkan bonus */}
              </div>
              <div className="total">
                <span>Total Poin</span>
                <span>{(currentBalance + payment + bonus).toLocaleString()} {currencySymbol}</span> {/* Update total saldo */}
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <div>
            <div className="illustration">
              <img style={{ margin: 0 }} src={require(`../../assets/image/topup_saldo_icon.webp`)} alt="Insert Cash" />
              <p style={{ margin: 0 }}>Silahkan</p>
              <p style={{ margin: 0 }}>Masukkan Uang Cash</p>
            </div>
            <div>
              <button className="back-btn" onClick={() => navigate('/main')}>Kembali</button>
              <button className="pay-btn" onClick={pay}>Bayar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpCash;
