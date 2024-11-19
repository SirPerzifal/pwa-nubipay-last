import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

import CaraLogin from './navModalHelp/CaraLogin';
import CaraTopUp from './navModalHelp/CaraTopUp';
import CaraJalankanMesin from './navModalHelp/CaraJalankanMesin';
import CaraBeliSabun from './navModalHelp/CaraBeliSabun';
import '../assets/css/components/ModalHelp.css'; // Pastikan path sesuai

interface ModalProps {
  isModalHelpOpen: boolean;
  toggleModal: () => void;
  animationClass: string; // Tambahkan prop untuk animasi
}

const Modal: React.FC<ModalProps> = ({ isModalHelpOpen, toggleModal, animationClass }) => {
  const [activeTab, setActiveTab] = React.useState<string>('login');

  if (!isModalHelpOpen) return null;
  return (
    <div className="modal-help-overlay fade-in">
      <div className={`modal-help-content ${animationClass}`}>
        <button className="close-modal-help" onClick={toggleModal}>
          <FontAwesomeIcon icon={faCircleXmark} />
        </button>

        {/* Navbar Help */}
        <div className="modal-navbar-help">
          <div className="help-icon">
            <img
              src={require("../assets/image/v1_81.png")} // Pastikan path gambar benar
              alt="Help Icon"
              className="help-icon"
            />
          </div>

          <button onClick={() => setActiveTab('login')} className={activeTab === 'login' ? 'active-help' : ''}>
            Cara Login
          </button>
          <button onClick={() => setActiveTab('topup')} className={activeTab === 'topup' ? 'active-help' : ''}>
            Cara Top Up
          </button>
          <button onClick={() => setActiveTab('machine')} className={activeTab === 'machine' ? 'active-help' : ''}>
            Cara Jalankan Mesin
          </button>
          <button onClick={() => setActiveTab('buy')} className={activeTab === 'buy' ? 'active-help' : ''}>
            Cara Beli Sabun
          </button>
        </div>

        <hr />

        <div className="modal-body-help">
          {activeTab === 'login' && <CaraLogin />}
          {activeTab === 'topup' && <CaraTopUp />}
          {activeTab === 'machine' && <CaraJalankanMesin />}
          {activeTab === 'buy' && <CaraBeliSabun />}
        </div>
      </div>
    </div>
  );
};

export default Modal;
