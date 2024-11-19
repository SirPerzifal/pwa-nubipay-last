import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../assets/css/components/headerStyle.css'; // CSS untuk header
import DataTables from './DataTables';
import voucherData from '../assets/data/kupon.json'; // Impor data voucher dari JSON
import { fetchTransactions } from '../utils/ExternalAPI';

// Font Awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser , faRightFromBracket, faHistory, faCircleXmark, faBell } from '@fortawesome/free-solid-svg-icons';

interface User {
  id: number;
  phone: string;
  nama: string;
  saldo: number;
}

interface Voucher {
  id: number;
  image?: string; // Marked as optional
  nama: string;
  purpose: string;
  harga: number;
  exp: string;
  status: string;
}

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [voucherDropdownOpen, setVoucherDropdownOpen] = useState(false);
  const [listTransaksi, setListTransaksi] = useState<{
    date_order: string;
    outlet: string;
    machine_type_custom: string;
    machine_display_name: string;
    price: number;
    balance: number;
  }[]>([]);
  const [phoneNumber, setPhoneNumber] = useState(''); // Menyimpan nomor telepon
  const [isMobileView, setIsMobileView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voucherCount, setVoucherCount] = useState(voucherData.length); // Lencana jumlah voucher

  useEffect(() => {
    const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser") || "{}");
    setPhoneNumber(loggedUser.phone);
  }, []);

  const location = useLocation();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    if (isMobileView) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  // Toggle voucher dropdown visibility
  const toggleVoucherDropdown = () => {
    setVoucherDropdownOpen(!voucherDropdownOpen);
    if (voucherDropdownOpen === false) {
      setVoucherCount(0); // Set badge count to 0 when vouchers are viewed
    }
  };

  // Toggle modal visibility with slide up/down animations
  const toggleModal = () => {
    if (isModalOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsClosing(false);
      }, 500);
    } else {
      fetchUserTransactions(); // Ambil data transaksi saat modal dibuka
      setIsModalOpen(true);
    }
  };

  const fetchUserTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const transactions = await fetchTransactions(phoneNumber);
      
      const mappedTransactions = transactions.map((transaction: any) => ({
        date_order: transaction.date_order,
        outlet: Array.isArray(transaction.branch_id) ? transaction.branch_id[1] : '',
        machine_type_custom: transaction.machine_type_custom,
        machine_display_name: transaction.machine_display_name,
        price: transaction.price || 0,
        balance: transaction.balance || 0,
      }));

      setListTransaksi(mappedTransactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      setError('Gagal mengambil data transaksi');
      setListTransaksi([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('loggedUser');
    window.location.href = '/';
  };

  // Effect to track screen size and update mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 866);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <header className="header">
        <div className="left-header">
          <img src={require('../assets/image/v1_14.png')} alt="Logo" className="logo" />
        </div>

        {location.pathname !== '/shop' && (
          <div className="right-header">
            {user && (
              <>
                <span className="user-number">{user.phone}</span>
                <button className="history-button" onClick={toggleModal}>
                  <FontAwesomeIcon icon={faHistory} style={{ fontSize: '40px' }} />
                </button>

                {/* Profile button for opening voucher dropdown in larger screens */}
                {!isMobileView && (
                  <button className="profile-button" onClick={toggleVoucherDropdown}>
                    <FontAwesomeIcon icon={faUser } style ={{ fontSize: '40px' }} />
                    {voucherCount > 0 && (
                      <span className="badge">{voucherCount}</span> // Lencana jumlah voucher
                    )}
                  </button>
                )}

                {/* Profile button dropdown for smaller screens */}
                {isMobileView && (
                  <>
                    <button className="profile-button" onClick={toggleDropdown}>
                      <FontAwesomeIcon icon={faUser } style={{ fontSize: '30px' }} />
                    </button>
                    <button className="bell-button" onClick={toggleVoucherDropdown}>
                      <FontAwesomeIcon icon={faBell} style={{ fontSize: '30px' }} />
                      {voucherCount > 0 && (
                        <span className="badge">{voucherCount}</span> // Lencana jumlah voucher
                      )}
                    </button>
                  </>
                )}

                {/* Dropdown Voucher */}
                {voucherDropdownOpen && (
                  <div className="dropdown-menu-voucher">
                    {voucherData.map((voucher: Voucher) => (
                      <div key={voucher.id} className="voucher-item">
                        {voucher.image && (
                          <img
                            src={require(`../assets/image/${voucher.image}`)}
                            alt={`${voucher.nama}`}
                            className="voucher-image"
                          />
                        )}
                        <div className="voucher-details">
                          <p>{voucher.nama}</p>
                          <h3>{voucher.purpose}</h3>
                          <p>Harga: {voucher.harga} Exp: {voucher.exp}</p>
                        </div>
                        {voucher.status === "available" ? (
                          <button className="voucer-pakai-button active">
                            Pakai
                          </button>
                        ) : (
                          <button className="voucer-pakai-button">
                            Pakai
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropdown untuk mobile screen */}
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <span className="user-number-dropdown">{user.phone}</span>
                    <button className="history-button-dropdown" onClick={toggleModal}>
                      <FontAwesomeIcon icon={faHistory} style={{ fontSize: '24px' }} />
                    </button>
                    <button className="logout-button-dropdown" onClick={handleLogout}>
                      <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: '24px' }} />
                      LOGOUT
                    </button>
                  </div>
                )}

                <button className="logout-button" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: '40px' }} />
                  LOGOUT
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Modal History */}
      {isModalOpen && (
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
          <div className={`modal-content ${isClosing ? 'slide-up' : 'slide-down'}`}>
            <button className="close-modal" onClick={toggleModal}>
              <FontAwesomeIcon icon={faCircleXmark} />
            </button>
            <h2 className="modal-title">LIST TRANSAKSI TERAKHIR</h2>
            <div className="modal-body">
            {error ? (
            <div className="error-message-log-history">
              {error}
                </div>
              ) : isLoading ? (
                <div className="loader-log-history"></div>
              ) : listTransaksi.length === 0 ? (
                <div className="no-data-log-history">
                  Tidak ada transaksi
                </div>
              ) : (
                <DataTables data={listTransaksi} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;