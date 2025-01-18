import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import { fetchBypassAndTransactions } from '../utils/ExternalAPI';
import '../assets/css/components/modalBypassStyle.css';

interface ModalBypassProps {
  onClose: () => void;
  buttonName: string | null; // Menambahkan props baru
}

interface Transaction {
  date_order: string;
  branch_id: [number, string] | false;
  machine_type_custom: string;
  machine_display_name: string;
  price: number;
  partner_id: [number, string] | false;
}

interface MappedTransaction {
  date_order: string;
  outlet: string;
  machine_type_custom: string;
  machine_display_name: string;
  price: number;
  partner_id: string;
}

interface BypassReason {
  id: number;
  name: string;
}

const ModalBypass: React.FC<ModalBypassProps> = ({ onClose, buttonName }) => {
  const [step, setStep] = useState<number>(1);
  const [alasan, setAlasan] = useState<string | null>(null);
  const [transaksi, setTransaksi] = useState<any>(null);
  const [fulldata, setFulldata] = useState<any>(null);
  const [listTransaksi, setListTransaksi] = useState<MappedTransaction[]>([]);
  const [bypassReasons, setBypassReasons] = useState<BypassReason[]>([]);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleNext = () => {
    // Tambahkan validasi untuk alasan
    if (step === 1 && !alasan) {
      alert('Silakan pilih alasan terlebih dahulu');
      return;
    }
  
    if (step === 2 && !transaksi) {
      alert('Silakan pilih transaksi terlebih dahulu');
      return;
    }
  
    if (step === 2 && transaksi) {
      setFulldata({ alasan, transaksi, namaPemilih: buttonName });
    }
    
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCloseOrBack = () => {
    if (step === 1) {
      onClose(); 
    } else {
      handlePrevious(); 
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlasan(e.target.value);
  };

  const handleTransactionClick = (transaction: any) => {
    setTransaksi(transaction);
    setFulldata({ alasan, transaksi: transaction, namaPemilih: buttonName });
    setStep(3); 
  };

  const handleSubmit = () => {
    if (!fulldata || !fulldata.alasan || !fulldata.transaksi) {
      alert('Pastikan semua data telah terisi');
      return;
    }
  
    // Proses submit data
    alert(`Data: ${JSON.stringify({
      ...fulldata,
      namaPemilih: buttonName
    }, null, 2)}`);

    // Save data to session storage
    sessionStorage.setItem('bypassData', JSON.stringify({
      alasan: fulldata.alasan,
      transaksi: fulldata.transaksi,
      namaPemilih: fulldata.namaPemilih,
    }));

    // Navigate to MainPageCrew
    navigate('/main/crew'); // Adjust the path as necessary
  };
  
  const fetchWithRetry = async (
    fetchFunction: () => Promise<{
      bypassReasons: BypassReason[];
      transactions: Transaction[];
    }>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ) => {
    let lastError;
  
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fetchFunction();
      } catch (error) {
        lastError = error;
        if (i === maxRetries - 1) throw error;
        console.warn(`Retrying... Attempt ${i + 1}`);
        await new Promise(res => setTimeout(res, baseDelay * Math.pow(2, i)));
      }
    }
  
    throw lastError;
  };
  
  // Modifikasi useEffect untuk mengambil alasan bypass dan transaksi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { bypassReasons, transactions } = await fetchWithRetry( () => fetchBypassAndTransactions(), 3, 1000 );
        
        // Set alasan bypass
        setBypassReasons(bypassReasons);

        // Map transactions
        const mappedTransactions = transactions.map((transaction: Transaction) => ({
          date_order: transaction.date_order || '',
          outlet: transaction.branch_id ? transaction.branch_id[1] : '',
          partner_id: transaction.partner_id ? transaction.partner_id[1] : '',
          machine_type_custom: transaction.machine_type_custom || '',
          machine_display_name: transaction.machine_display_name || '',
          price: transaction.price || 0,
        }));

        setListTransaksi(mappedTransactions);
      } catch (error) {
        console.error("Error fetching data:", error);
        setBypassReasons([]);
        setListTransaksi([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="modal-bypass-overlay">
      <div className={`container-modal-bypass ${step === 2 ? 'step2' : ''}`}>
        <button className="close-button-bypass" onClick={handleCloseOrBack}>
          {step === 1 ? (
            <FontAwesomeIcon icon={faXmark} className="xmark-bypass" />
          ) : (
            <FontAwesomeIcon icon={faArrowLeft} className="arrowleft-bypass" />
          )}
        </button>

        {step === 1 ? (
          <>
            <h1>MENU BYPASS</h1>
            <p>Pilihlah Alasan yang Sesuai Kondisi.</p>
          </>
        ) : step === 2 ? (
          <>
            <h1>PILIH TRANSAKSI</h1>
          </>
        ) : (
          <>
            <h1>SUBMIT</h1>
            <p>Pastikan alasan dan transaksi sudah benar.</p>
          </>
        )}

        <div className="steps-bypass">
          <div className="step-bypass">
            <div className={`circle ${step === 1 ? 'active' : 'inactive'}`}>1</div>
            <div>ALASAN</div>
          </div>
          <div className="line-bypass"></div>
          <div className="step-bypass">
            <div className={`circle ${step === 2 ? 'active' : 'inactive'}`}>2</div>
            <div>TRANSAKSI</div>
          </div>
          <div className="line-bypass"></div>
          <div className="step-bypass">
            <div className={`circle ${step === 3 ? 'active' : 'inactive'}`}>3</div>
            <div>SUBMIT</div>
          </div>
        </div>

        <div className="content-bypass">
          {step === 1 && (
            <div className="reasons-bypass">
              <div className="kiri-bypass">
                {bypassReasons.slice(0, Math.ceil(bypassReasons.length / 2)).map((reason) => (
                  <label key={reason.id}>
                    <input 
                      type="radio" 
                      name="reason" 
                      value={reason.name} 
                      onChange={handleReasonChange} 
                    /> 
                    {reason.name}
                  </label>
                ))}
              </div>
              <div className="kanan-bypass">
                {bypassReasons.slice(Math.ceil(bypassReasons.length / 2)).map((reason) => (
                  <label key={reason.id}>
                    <input 
                      type="radio" 
                      name="reason" 
                      value={reason.name} 
                      onChange={handleReasonChange} 
                    /> 
                    {reason.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="transaction-bypass">
              <p>Silakan pilih detail transaksi:</p>
              <div className="scroll-bypass-data">
                <table className="data-tabel-style">
                    <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>No HP</th>
                        <th>Outlet</th>
                        <th>Tipe</th>
                        <th>Info</th>
                        <th>Jumlah</th>
                    </tr>
                    </thead>
                    <tbody>
                    {listTransaksi.map((item, index) => (
                        <tr key={index} onClick={() => handleTransactionClick(item)}>
                            <td>{item.date_order}</td>
                            <td>{item.partner_id}</td>
                            <td>{item.outlet}</td>
                            <td>{item.machine_type_custom}</td>
                            <td>{item.machine_display_name}</td>
                            <td>{item.price}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && fulldata && (
            <div className="submit-bypass">
              <p>LIST TRANSAKSI</p>
              <div className="submit-justify-bypass">
                <div className="submit-justify-bypass">
                    <div className="kiri-bypass">
                    <p>Tanggal</p>
                    <p>No HP</p>
                    <p>Info</p>
                    </div>
                    <div className="kanan-bypass">
                    <p>: {fulldata.transaksi?.date_order}</p>
                    <p>: {fulldata.transaksi?.partner_id}</p>
                    <p>: {fulldata.transaksi?.machine_display_name}</p>
                    </div>
                </div>
                <div className="submit-justify-bypass">
                    <div className="kiri-bypass">
                    <p>Tipe</p>
                    <p>Jumlah</p>
                    </div>
                    <div className="kanan-bypass">
                    <p>: {fulldata.transaksi?.machine_type_custom}</p>
                    <p>: {fulldata.transaksi?.price}</p>
                    </div>
                </div>
              </div>
              <div className="bawah-bypass">
                <p>ALASAN MENGGUNAKAN BYPASS</p>
                <p className="lighter-font-bypass">{fulldata.alasan}</p>
                {/* Tambahkan baris ini untuk menampilkan nama pemilih */}
                <p className="lighter-font-bypass">Nama Pemilih: {fulldata.namaPemilih}</p>
              </div>
            </div>
          )}
        </div>

        <div className="navigation-bypass">
          {step === 3 && (
            <button className="prev-button-bypass" onClick={handlePrevious}>
              Ganti Transaksi
            </button>
          )}
          <button className="next-button-bypass" onClick={step === 3 ? handleSubmit : handleNext}>
            {step === 3 ? 'SUBMIT' : 'NEXT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalBypass;
