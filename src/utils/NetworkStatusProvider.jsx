// NetworkStatusProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSQLite } from '../hooks/useSQLite';
import { DBActions } from '../db/action';

const NetworkStatusContext = createContext();

export const useNetworkStatus = () => {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within NetworkStatusProvider');
  }
  return context;
};

export const NetworkStatusProvider = ({ children }) => {
  const location = useLocation(); // ⬅️ AMBIL ROUTE SEKARANG
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);

    // Auto hide setelah 5 detik
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  // Function untuk sync data (dummy)
  const syncOfflineData = async () => {
    setIsSyncing(true);
    
    try {
      // Simulasi proses sync ke API
      console.log('🔄 Memulai sinkronisasi data offline...');
      // const sqlite = useSQLite();
      // const db = sqlite.isReady ? new DBActions(sqlite) : null;

      // const userId = sessionStorage.getItem("userId") || "";
      // const getUserData = await db?.getUserById(userId);
      // const getTransaksi = await db?.getTransaksi()

      // console.log(getUserData, "User data")
      // console.log(getTransaksi, "Transaksi Data");
      

      // Simulasi API call dengan delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Dummy API call
      // const response = await fetch('https://your-api.com/sync', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(offlineData)
      // });

      // console.log('✅ Data berhasil disinkronisasi:', offlineData);
      showNotification('✅ Data offline berhasil disinkronisasi');
      
    } catch (error) {
      console.error('❌ Error saat sinkronisasi:', error);
      showNotification('❌ Gagal sinkronisasi data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoToOnline = async () => {
    // Jalankan sync data dulu
    await syncOfflineData();
    
    // Tutup modal
    setShowModal(false);
    
    // Redirect ke halaman online atau refresh
    // window.location.href = '/dashboard'; // Ganti dengan route Anda
    console.log('🌐 Redirect ke halaman online');
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowModal(true); // Tampilkan modal saat online
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('🔴 Tidak ada koneksi internet - Mode Offline Aktif');
      setShowModal(false);
    };

    // Cek koneksi secara berkala (setiap 30 detik)
    const checkConnection = async () => {
      try {
        await fetch('https://www.google.com/favicon.ico', {
          mode: 'no-cors',
          cache: 'no-store'
        });
        if (!isOnline && !navigator.onLine) {
          return;
        }
      } catch (err) {
        if (isOnline && navigator.onLine) {
          handleOffline();
        }
      }
    };

    const intervalId = setInterval(checkConnection, 30000);

    // Event listeners untuk perubahan status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  return (
    <NetworkStatusContext.Provider value={{ isOnline, syncOfflineData }}>
      {children}
      
      {/* Toast Notification untuk Offline */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: showToast ? '20px' : '-400px',
            zIndex: 9999,
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px',
            maxWidth: '400px',
            border: '1px solid #f5c6cb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'slideIn 0.3s ease-out',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px'
          }}
        >
          <span style={{ flex: 1 }}>{toastMessage}</span>
          <button
            onClick={() => setShowToast(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              marginLeft: '10px',
              color: 'inherit',
              padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Modal untuk Online */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.3s ease-out',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#d4edda',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '30px'
            }}>
              🟢
            </div>

            <h2 style={{
              margin: '0 0 15px 0',
              color: '#155724',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Jaringan Sudah Online
            </h2>

            <p style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.5',
              margin: '0 0 25px 0'
            }}>
              Jaringan sudah online, bisa lanjutkan transaksi dengan sistem online
            </p>

            {isSyncing && (
              <div style={{
                backgroundColor: '#e7f3ff',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                color: '#004085',
                fontSize: '14px'
              }}>
                🔄 Sedang sinkronisasi data offline...
              </div>
            )}

            <button
              onClick={handleGoToOnline}
              disabled={isSyncing}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: isSyncing ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                opacity: isSyncing ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!isSyncing) {
                  e.target.style.backgroundColor = '#218838';
                }
              }}
              onMouseOut={(e) => {
                if (!isSyncing) {
                  e.target.style.backgroundColor = '#28a745';
                }
              }}
            >
              {isSyncing ? 'Mohon Tunggu...' : 'Lanjut ke Sistem Online'}
            </button>

            {!isSyncing  && location.pathname === "/offline-main-page" && (
              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Nanti Saja
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            right: -400px;
            opacity: 0;
          }
          to {
            right: 20px;
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </NetworkStatusContext.Provider>
  );
};