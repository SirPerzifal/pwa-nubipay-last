import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "../../assets/css/payment_methode/cashStyle.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useSQLite } from "../../hooks/useSQLite";
import { DBActions } from "../../db/action";
import { useSerial } from "../../hooks/SerialContext";

const TopUpPageOffline: React.FC = () => {
  const { connectToDevice, logs, sendBytes } = useSerial();

  const currencySymbol = " ⓟ";
  const [payment, setPayment] = useState<number>(0);
  const [saldoDisplay, setSaldoDisplay] = useState("");
  // const [bonus, setBonus] = useState<number>(0);
  const navigate = useNavigate();
  const [numberDisplay, setNumberDisplay] = useState("");
  const sqlite = useSQLite();
  const db = sqlite.isReady ? new DBActions(sqlite) : null;
  // ... other states

  useEffect(() => {
    const init = async () => {
      const ok = await connectToDevice();
      if (!ok) {
        return;
      }
      sendBytes([184]);
    };
    init();
    sendBytes([184]);
  }, []);

  useEffect(() => {
    async function loadUser() {
      const userId = sessionStorage.getItem("userId") || "";
      // console.log(userId);

      const getUserData = await db?.getUserById(userId);
      // console.log(getUserData);

      setNumberDisplay(getUserData?.nomor_telepon || "");
      setSaldoDisplay(getUserData?.saldo || "");
    }

    if (db) loadUser();
  }, [db]);

  // Tampilkan logs untuk debugging
  useEffect(() => {
    // console.log("Latest logs:", logs);

    // Contoh: Parse data dari Arduino
    const latestLog = logs[logs.length - 1];
    if (latestLog && latestLog.includes("Arduino:")) {
      const data = latestLog.replace("Arduino:", "").trim();
      console.log(data);
      if (data === "210823000000") {
        sendBytes([186]); // Kirim byte untuk nominal 10.000
      } else if (data === "210823010000") {
        handlePaymentChange(10000);
      } else if (data === "210823020000") {
        handlePaymentChange(20000);
      } else if (data === "210823050000") {
        handlePaymentChange(50000);
      } else if (data === "210823100000") {
        handlePaymentChange(100000);
      }
    }
  }, [logs]);

  const handlePaymentChange = (e: number) => {
    const value = parseInt(e as unknown as string, 10);
    if (payment) {
      setPayment(payment + (isNaN(value) ? 0 : value));
    } else {
      setPayment(isNaN(value) ? 0 : value);
    }
  };

  const pay = async () => {
    // const newBonus = payment * 0.1; // contoh bonus 10%
    // const newBalance = saldoDisplay + payment + newBonus;

    // setSaldoDisplay(newBalance);
    // setBonus(newBonus);
    if (saldoDisplay) {
      const newBalance = parseInt(saldoDisplay, 10) + payment;
      try {
        // User belum ada, tambahkan ke database
        const updateSaldo = await db?.updateSaldo(
          sessionStorage.getItem("userId"),
          newBalance
        );

        const createTransactionrRcord = await db?.addTransaksi(
          sessionStorage.getItem("userId"),
          "topup",
          "",
          "",
          payment,
          new Date().toISOString()
        );
        console.log(createTransactionrRcord);

        // Berhasil menambahkan user
        console.log("Update saldo successfull:", updateSaldo);
        navigate("/offline-main-page");
      } catch (error) {
        console.error("Error saat memproses user:", error);
      }
    } else {
      try {
        // User belum ada, tambahkan ke database
        const updateSaldo = await db?.updateSaldo(
          sessionStorage.getItem("userId"),
          payment
        );

        const createTransactionrRcord = await db?.addTransaksi(
          sessionStorage.getItem("userId"),
          "topup",
          "",
          "",
          payment,
          new Date().toISOString()
        );
        console.log(createTransactionrRcord);

        // Berhasil menambahkan user
        console.log("Update saldo successfull:", updateSaldo);
        navigate("/offline-main-page");
      } catch (error) {
        console.error("Error saat memproses user:", error);
      }
    }
    backToMain();
  };

  const Logout = () => {
    sendBytes([185]); // Kirim byte sebelum logout
    window.location.href = "login-offline";
  };

  const backToMain = () => {
    sendBytes([185]);
    navigate("/offline-main-page");
  };

  return (
    <div id="main-page-offline-mode">
      {/* Header */}
      <div id="header-main-page-offline-mode">
        <div id="logo-section-offline-mode">
          <img
            src={require("../../assets/image/v1_14.png")}
            alt="Opera Sabun Logo"
          />
        </div>
        <div id="profile-section-offline-mode">
          <span className="login-number-display">{numberDisplay}</span>
          <button
            onClick={() => Logout()}
            className="logout-button-offline-mode"
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              style={{ fontSize: "24px", marginRight: "10px" }}
            />
            LOGOUT
          </button>
        </div>
      </div>
      <div className="title-cash">TOP UP SALDO</div>
      <div className="topup-container">
        <div className="container-left-section">
          <div className="section-cash">
            <div className="section-title-cash">Total Pembayaran :</div>
            <div className="input-group-cash">
              <input type="text" disabled value={payment.toLocaleString()} />
            </div>
          </div>
          <div className="section-cash">
            <div className="section-title-cash">Total Harga :</div>
            <div className="price-details-cash">
              <div>
                <span>Poin Sekarang</span>
                <span>
                  {saldoDisplay.toLocaleString() || 0} {currencySymbol}
                </span>
              </div>
              <div>
                <span>Poin Topup</span>
                <span>
                  {payment.toLocaleString()} {currencySymbol}
                </span>
              </div>
              <div className="total">
                <span>Total Poin</span>
                <span>
                  {(saldoDisplay + payment).toLocaleString()} {currencySymbol}
                </span>{" "}
                {/* Update total saldo */}
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <div>
            <div className="illustration">
              <img
                style={{ margin: 0 }}
                src={require(`../../assets/image/topup_saldo_icon.webp`)}
                alt="Insert Cash"
              />
              <p style={{ margin: 0 }}>Silahkan</p>
              <p style={{ margin: 0 }}>Masukkan Uang Cash</p>
            </div>
            <div>
              <button className="back-btn" onClick={() => backToMain()}>
                Kembali
              </button>
              <button className="pay-btn" onClick={() => pay()}>
                Bayar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpPageOffline;
