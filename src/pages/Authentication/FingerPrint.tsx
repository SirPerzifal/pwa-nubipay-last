import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/css/Auth/fingerprintStyle.css';

interface Partner {
  id: number; // Ganti dengan tipe yang sesuai
  name: string; // Ganti dengan tipe yang sesuai
  phone: string; // Ganti dengan tipe yang sesuai
  // Tambahkan properti lain yang relevan
}

const Fingerprint: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isRegistered, setIsRegistered] = useState(true);
  const [isOtpWhatsapp, setIsOtpWhatsapp] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
      window.location.href = "Fingerprintin:";
  })

  useEffect(() => {
    const state = location.state as { cleanPhoneNumber?: string; phoneNumber?: string; partners?: Partner[] } | null;
    const storedIsRegistered = sessionStorage.getItem('isRegistered');
    const storedStatusOtpWhatsapp = sessionStorage.getItem('dataUser ');

    if (state?.cleanPhoneNumber) {
        setPhoneNumber(state.cleanPhoneNumber);
    } else if (state?.phoneNumber) {
        setPhoneNumber(state.phoneNumber);
    }

    if (state?.partners) {
      setPartners(state.partners); // Pastikan partners adalah array Partner
    }

    if (storedIsRegistered) {
        setIsRegistered(storedIsRegistered === 'true');
    }

    if (storedStatusOtpWhatsapp) {
        const parsedData = JSON.parse(storedStatusOtpWhatsapp);
        if (parsedData.is_otp_whatsapp === true) {
            setIsOtpWhatsapp(true);
        }
    }
  }, [location]);

  const handleAction = (event: React.FormEvent) => {
    if (isRegistered) {
      console.log("Fingerprint scanned for registered user");
      sessionStorage.setItem('loggedUser', JSON.stringify(partners));
      // window.location.href = "Fingerprintin:";
      navigate('/main'); // Menggunakan navigate dari react-router-dom
    } else {
      console.log("Fingerprint scanned for unregistered user");
      // Implementasi pemeriksaan sidik jari
      window.location.href = "Fingerprintin:";
    }
  };

  return (
    <div className="container-fingerprint">
      <div className="logo-fingerprint">
        <img
          alt="Opera Sabun Logo"
          height="50"
          src={require("../../assets/image/v1_14.png")}
        />
      </div>
      <div className="title-fingerprint">
        {isRegistered ? 'LETAKAN JARI TELUNJUK ANDA PADA SCAN' : `NOMOR ${phoneNumber} BELUM TERDAFTAR`}
      </div>
      <div className="subtitle-fingerprint">
        {isRegistered ? 'Pastikan Posisi Di Letakkan Dengan Jari Yang Di Da ftar' :  'Silakan daftar terlebih dahulu.'}
      </div>
      <button className="tombol-aksi-fingerprint" onClick={handleAction}>
        <div className="fingerprint" />
      </button>
      {isOtpWhatsapp ? (
        <>
          <button className="button-fingerprint button-fingerprint-left" onClick={() => navigate('/login')}>
            Kembali
          </button>
          <a className="button-fingerprint button-fingerprint-right" href="/kodeOTP">
            Kirimkan Kode via WhatsApp
          </a>
        </>
      ) : (
        <button className="button-fingerprint button-fingerprint-left" onClick={() => navigate('/login')}>
          Kembali
        </button>
      )}
    </div>
  );
};

export default Fingerprint;