import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import "../../assets/css/main/mainPageStyle.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faCaretLeft,
  faCaretRight,
  faSyncAlt,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

// import machineData from "../../assets/data/mesinCuciSadai.json";
import statusData from "../../assets/data/status.json";
import MachineButton from "../../components/MachineButton";
import Kupon from "../../assets/data/kupon.json"
import { useMachineTimer } from "../../hooks/useMachineTimer";
import { checkUserInOdoo } from "../../utils/ExternalAPI";

// Define interface untuk tipe data
interface Provider {
  name: string;
  label_atas: string;
  label_bawah: string;
  mesin_type: string;
  mesin_name: string;
  status_dryer: string;
  status_washer: string;
  end_time_top: string | number;
  end_time_bottom: string;
  total_machine: string;
}

// Interface untuk response API
interface ApiResponse {
  error: number;
  status_code: number;
  datas: Array<{
    providers: Provider[];
  }>;
}

const MainPage: React.FC = () => {
  const currencySymbol = ' ⓟ';
  let machineCounter = 1; // Gunakan counter manual untuk penomoran
  const [user, setUser] = useState<any>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  // const [machines, setMachines] = useState(machineData);
  const [machinesNew, setMachinesNew] = useState<Provider[]>([]);
  const [kupon] = useState(Kupon);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [isLoadingSaldo, setIsLoadingSaldo] = useState(false); // Tambahkan state untuk saldo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // Untuk animasi penutupan
  const [waktu, setWaktu] = useState<number>(0); // State untuk waktu
  const navigate = useNavigate();

  // Fungsi untuk fetch data mesin menggunakan fetch native
  const fetchMachines = async () => {
    try {
      setIsLoadingMachines(true);
      
      // Konstruksi body request
      const requestBody = new URLSearchParams({
        token: '9s8UXnLBoJqOyiB2',
        username: 'operasabun',
        branch_name: 'sei panas'
      });

      const response = await fetch(
        '/api/get/public_link_data', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: requestBody
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ApiResponse = await response.json();

      if (data && data.datas && data.datas[0].providers) {
        // Transform data if needed
        const transformedMachines = data.datas[0].providers.map(machine => ({
          ...machine,
          // Tambahkan transformasi tambahan jika diperlukan
        }));

        setMachinesNew(transformedMachines);
        console.log("klikrefresh", transformedMachines)
      }

    } catch (error) {
      console.error("Error fetching machines:", error);
      // Fallback ke data lokal jika fetch gagal
    } finally {
      setIsLoadingMachines(false);
    }
  };

  // Efek untuk load user dan fetch machines
  useEffect(() => {
    // Load user dari session
    const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser") || "{}");
    setUser(loggedUser);
    setSaldo(loggedUser.total_deposit || 0);

    // Fetch machines
    fetchMachines();
  }, []);

  // Komponen terpisah untuk timer
  const MachineTimer: React.FC<{ endTime: string | number }> = ({ endTime }) => {
    const { timeLeft } = useMachineTimer({ endTime });
    return <>{timeLeft}</>;
  };

  const renderMachineItem = (machine: Provider) => {
    const isPengeringA = machine.mesin_type.toLocaleLowerCase() === 'tumbler' && machine.label_atas.endsWith("A");
    const isPengeringB = machine.mesin_type.toLocaleLowerCase() === 'tumbler' && machine.label_bawah.endsWith("B");
    const isWasherDryerD = machine.mesin_type.toLocaleLowerCase() === 'wd' && machine.label_atas.startsWith("D");
    const isWasherDryerW = machine.mesin_type.toLocaleLowerCase() === 'wd' && machine.label_bawah.startsWith("W");
  
    if (isPengeringA) {
  
      return (
        <div className="mesin-item-wrapper" key={machine.name}>
          <span className="machine-number">{machineCounter++}</span>
          <div className="mesin-item machine-tumbler">
            <img              
              src={require(`../../assets/image/mesin/${machine.mesin_name}.webp`)}
              alt="Pengering"
              className="mesin-image"
            />
            <div className="machine-label-top">{machine.label_atas}</div>
            <MachineButton
              className="machine-button-a"
              status={convertStatus(
                machine.status_dryer, 
                undefined, 
                selectedMachine?.nama, 
                machine.label_atas
              )}
              handleClick={() => handleMachineClick(machine.label_atas)}
              disabled={machine.status_dryer === 'bussy' || machine.status_dryer === 'offline'}
            />
            {machine.status_dryer === "bussy" && (
              <div className="waktu-mundur-mesin a">
                <p><MachineTimer endTime={machine.end_time_top || 0} /></p>
              </div>
            )}
            {isPengeringB && (
              <>
                <div className="machine-label-bottom">
                  {machine.label_bawah}
                </div>
                <MachineButton
                  className="machine-button-b"
                  status={convertStatus(
                    machine.status_washer, 
                    undefined, 
                    selectedMachine?.nama, 
                    machine.label_bawah
                  )}
                  handleClick={() => handleMachineClick(machine.label_bawah)}
                  disabled={machine.status_washer === 'bussy' || machine.status_washer === 'offline'}
                />
                {machine.status_washer === "bussy" && (
                  <div className="waktu-mundur-mesin b">
                    <p><MachineTimer endTime={machine.end_time_bottom || 0} /></p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    } else if (isWasherDryerD) {
                           
      return (
        <div className="mesin-item-wrapper" key={machine.name}>
          <span className="machine-number">{machineCounter++}</span>
          <div className="mesin-item machine-wd">
            <img
              src={require(`../../assets/image/mesin/${machine.mesin_name}.webp`)}
              alt="Tumbler"
              className="mesin-image"
            />
            <div className="machine-label-top-wd">{machine.label_atas}</div>
            <MachineButton
              className="machine-button-d"
              status={convertStatus(
                machine.status_dryer, 
                undefined, 
                selectedMachine?.nama, 
                machine.label_atas
              )}
              handleClick={() => handleMachineClick(machine.label_atas)}
              disabled={machine.status_dryer === 'bussy' || machine.status_dryer === 'offline'}
            />
            {machine.status_dryer === "bussy" && (
              <div className="waktu-mundur-mesin d">
                <p><MachineTimer endTime={machine.end_time_top || 0} /></p>
              </div>
            )}
            {isWasherDryerW && (
              <>
                <div className="machine-label-bottom-wd">
                  {machine.label_bawah}
                </div>
                <MachineButton
                  className="machine-button-w"
                  status={convertStatus(
                    machine.status_washer, 
                    undefined, 
                    selectedMachine?.nama, 
                    machine.label_bawah
                  )}
                  handleClick={() => handleMachineClick(machine.label_bawah)}
                  disabled={machine.status_washer === 'bussy' || machine.status_washer === 'offline'}
                />
                {machine.status_washer === "bussy" && (
                  <div className="waktu-mundur-mesin w">
                    <p><MachineTimer endTime={machine.end_time_bottom || 0} /></p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    } else {
  
      return (
        <div className="mesin-item-wrapper" key={machine.name}>
          <span className="machine-number">{machineCounter++}</span>
          <div
            className={`mesin-item ${getMachineClass(machine.mesin_name)}`}
          >
            <img
              src={require(`../../assets/image/mesin/${machine.mesin_name}.webp`)}
              alt={machine.name}
              className="mesin-image"
            />
            <div className="machine-label">{machine.label_atas}</div>
            <MachineButton
              className="machine-button"
              status={convertStatus(
                machine.status_dryer, 
                machine.status_washer, 
                selectedMachine?.nama, 
                machine.label_atas
              )}
              handleClick={() => handleMachineClick(machine.label_atas)}
              disabled={machine.status_dryer === 'bussy' || machine.status_dryer === 'offline'}
            />
            {machine.status_washer === "bussy" && (
              <div className="waktu-mundur-mesin">
                <p><MachineTimer endTime={machine.end_time_bottom || 0} /></p>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  const handleRefreshMachinesClick = () => {
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
    setIsLoadingMachines(true); // Ubah state menjadi loading
    fetchMachines()
    setTimeout(() => {
      setIsLoadingMachines(false); // Kembalikan ke state semula setelah 2 detik
    }, 2000); // Delay 2 detik
  };

  const handleRefreshSaldoClick = async () => {
    try {
      // Ambil data user yang tersimpan
      const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser") || "{}");
      
      // Mainkan suara
      const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
      audio.play();
      
      // Ubah state menjadi loading
      setIsLoadingSaldo(true);
  
      // Dapatkan nomor telepon tersimpan
      const storedPhoneNumber = loggedUser.phone;
  
      // Periksa user di Odoo
      const { partners, banned } = await checkUserInOdoo(storedPhoneNumber);
  
      if (partners) {
        if (banned) {
          // Jika user dibanned, redirect ke halaman login
          // Misalnya:
          // navigate('/login');
          // atau
          // window.location.href = '/login';
          
          // Tambahkan notifikasi bahwa akun dibanned
          // toast.error('Akun Anda telah dibanned');
        } else {
          // sessionStorage.removeItem('dataUser.total_deposit')
          // Simpan data user di session storage
          sessionStorage.setItem('loggedUser', JSON.stringify(partners));
          
          // Log data partner (opsional)
          console.log("Partner data:", JSON.stringify(partners.total_deposit));
          setSaldo(partners.total_deposit)
          // console.log(sessionStorage.getItem('dataUser'))
          // Refresh saldo atau lakukan operasi lanjutan
          // Misalnya:
          // await fetchSaldo();
        }
      } else {
        // Handle kasus jika partners tidak ditemukan
        console.warn('Tidak dapat menemukan data partner');
        // Tambahkan notifikasi atau tindakan yang sesuai
      }
    } catch (error) {
      // Tangani error dengan lebih detail
      console.error('Error saat refresh saldo:', error);
      
      // Tambahkan notifikasi error
      // toast.error('Gagal memperbarui saldo');
    } finally {
      // Pastikan state loading dikembalikan, bahkan jika terjadi error
      setIsLoadingSaldo(false);
    }
  };
  
  // Fungsi untuk menghitung harga mesin
  const calculateMachinePrice = (machine: Provider): number => {
    // Logika penentuan harga berdasarkan tipe mesin
    switch (machine.mesin_type.toLowerCase()) {
      case 'sw':
        return 10000; // Single Washer
      case 'wd':
        if (waktu === 22) return 5000; // Washer Dryer, 22 menit
        if (waktu === 44) return 10000; // Washer Dryer, 44 menit
        if (waktu === 66) return 15000; // Washer Dryer, 66 menit
        return 10000; // Default harga
      case 'tumbler':
        return Math.floor(waktu / 6) * 4000; // Tumbler, Rp 4000 per 6 menit
      default:
        return 10000; // Default harga
    }
  };

  // Fungsi untuk menghitung waktu mesin
  const calculateMachineTime = (machine: Provider): number => {
    // Logika penentuan waktu berdasarkan tipe mesin
    switch (machine.mesin_type.toLowerCase()) {
      case 'sw': return 25; // Single Washer
      case 'wd':
        return 44; // Washer Dryer, label atas
      case 'tumbler': return 24; // Tumbler
      default: return 25; // Default waktu
    }
  }

  const convertStatus = (
    statusDryer: string | undefined, 
    statusWasher?: string | undefined,
    selectedMachineName?: string, // Tambahkan parameter ini
    currentMachineName?: string   // Tambahkan parameter ini
  ) => {
    // Untuk mesin dengan status_dryer saja
    if (!statusWasher) {
      if (statusDryer === 'bussy') {
        return 'digunakan';
      }
      if (statusDryer === 'offline') {
        return 'offline';
      }
      // Tambahkan kondisi untuk status dipilih
      if (selectedMachineName === currentMachineName) {
        return 'dipilih';
      }
      return 'tersedia';
    }

    // Untuk mesin dengan status_washer saja
    if (!statusDryer) {
      if (statusWasher === 'bussy') {
        return 'digunakan';
      }
      if (statusWasher === 'offline') {
        return 'offline';
      }
      // Tambahkan kondisi untuk status dipilih
      if (selectedMachineName === currentMachineName) {
        return 'dipilih';
      }
      return 'tersedia';
    }
  
    // Untuk mesin dengan kedua status
    if (statusDryer === 'bussy' || statusWasher === 'bussy') {
      return 'digunakan';
    }
  
    // Tambahkan kondisi untuk status dipilih
    if (selectedMachineName === currentMachineName) {
      return 'dipilih';
    }
  
    return 'tersedia';
  };

  // Modifikasi handleMachineClick untuk bekerja dengan data baru
  const handleMachineClick = (machineName: string) => {
    const machine = machinesNew.find(m => 
      m.label_atas === machineName || m.label_bawah === machineName
    );
  
    // Jika mesin yang diklik sama dengan mesin yang sudah dipilih, batalkan pemilihan
    if (selectedMachine && selectedMachine.nama === machineName) {
      setSelectedMachine(null);
      return;
    }
  
    if (machine) {
      let status: string;
      let statusField: string;
  
      switch (machine.mesin_type.toLowerCase()) {
        case 'tumbler':
          // Hanya ubah status untuk mesin yang dipilih
          status = convertStatus(
            machine.status_dryer, 
            undefined, 
            selectedMachine?.nama, 
            machine.label_atas
          );
          statusField = machine.status_dryer;
          break;
        case 'sw':
          // Hanya ubah status untuk mesin yang dipilih
          status = convertStatus(
            undefined, 
            machine.status_washer, 
            selectedMachine?.nama, 
            machine.label_atas
          );
          statusField = machine.status_washer;
          break;
        case 'wd':
          // Untuk WD, perlu logika khusus
          status = machine.label_atas === machineName 
            ? convertStatus(
                machine.status_dryer, 
                undefined, 
                selectedMachine?.nama, 
                machine.label_atas
              )
            : convertStatus(
                undefined, 
                machine.status_washer, 
                selectedMachine?.nama, 
                machine.label_bawah
              );
          statusField = machine.label_atas === machineName 
            ? machine.status_dryer 
            : machine.status_washer;
          break;
        default:
          status = convertStatus(
            machine.status_dryer, 
            machine.status_washer, 
            selectedMachine?.nama, 
            machine.label_atas
          );
          statusField = machine.status_dryer;
      }
  
      // Cek apakah mesin tersedia sebelum memilih
      if (status === 'tersedia' || status === 'dipilih') {
        setSelectedMachine({
          id: machine.name,
          nama: machineName,
          tipe: machine.mesin_type,
          harga: calculateMachinePrice(machine),
          waktu: calculateMachineTime(machine),
          status: status,
          statusField: statusField
        });
      } else {
        // Mainkan suara error
        const errorAudio = new Audio(process.env.REACT_APP_SOUND_BUTTON_NEGATIIVE);
        errorAudio.play();
      }
    }
  };

  const toggleModal = () => {
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
    if (isModalOpen) {
      setIsClosing(true); // Mulai animasi penutupan
      setTimeout(() => {
        setIsModalOpen(false); // Tutup modal setelah animasi selesai
        setIsClosing(false); // Reset animasi
      }, 300); // Sesuaikan durasi dengan animasi penutupan (0.3s)
    } else {
      setIsModalOpen(true); // Buka modal
    }
  };

  const getMachineClass = (machineId: string) => {
    switch (machineId) {
      case "Single Washer":
        return "machine-10kg";
      case "BC30 Kuning":
        return "machine-16kg";
      case "BC40 Kuning":
        return "machine-21kg";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (selectedMachine) {
      console.log(selectedMachine)
      setWaktu(selectedMachine.waktu); // Set waktu ke waktu dari mesin yang dipilih
    } else {
      setWaktu(0); // Set waktu default 0 jika belum ada mesin yang dipilih
    }
  }, [selectedMachine]);

  const playButtonSound = () => {
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
  };
  
  const jalankanMesin = () => {
    if (selectedMachine) {
      const audio = new Audio(process.env.REACT_APP_SOUND_GOOD_RESULT);
      audio.play();
      // Tambahkan logika lain yang diperlukan saat mesin dijalankan
    } else {
      const errorAudio = new Audio(process.env.REACT_APP_SOUND_BAD_MACHINE);
      errorAudio.play();
    }
  }

  // Fungsi untuk menambah atau mengurangi waktu
  const handleTimeChange = (increment: boolean) => {
    if (selectedMachine) {
      if (increment) {
        setWaktu((prevWaktu) => prevWaktu + 5); // Tambah 5 menit
      } else {
        setWaktu((prevWaktu) => (prevWaktu > 0 ? prevWaktu - 5 : 0)); // Kurangi 5 menit, minimal 0
      }
    }
  };

  return (
    <div className="main-page">
      <Header user={user} />
      <div className="content">
        {/* Bagian atas untuk saldo dan total */}
        <div className="row">
          <div className="saldo-total-container">
            <div className="saldo-section">
              <div className="saldo-box saldo-total-container">
                <div className="ket-saldo">
                  <h3>Poin Anda:</h3>
                  <p>{saldo.toLocaleString()} {currencySymbol}</p>
                  {!isLoadingSaldo ? (
                    <button
                      className="refresh-button"
                      onClick={handleRefreshSaldoClick}
                    >
                      <FontAwesomeIcon
                        icon={faSyncAlt}
                        className="refresh-icon"
                      />
                    </button>
                  ) : (
                    <div className="loader-saldo"></div>
                  )}
                </div>
                <div>
                  <button className="topup-button" onClick={toggleModal}>
                    <strong>+ Top Up</strong>
                  </button>
                  <button
                    className="buy-soap-button"
                    onClick={() => {
                      playButtonSound(); 
                      navigate("/shop");
                    }}
                  >
                    <strong>Beli Sabun</strong>
                  </button>
                </div>
              </div>
            </div>

            <div className="total-section">
              <div className="total-box saldo-total-container">
                <div className="ket-total-belanja">
                  <h3>TOTAL BELANJA</h3>
                  <div className="terpotong">
                    <p className="p1">Poin Terpotong</p>
                    <p className="p2">
                      {" "}
                      {selectedMachine
                        ? selectedMachine.harga.toLocaleString()
                        : 0} {currencySymbol}
                    </p>
                  </div>
                </div>
                <div className="ket-sisa-saldo">
                  <h3>SISA POIN</h3>
                  <p>
                    {" "}
                    {(
                      saldo - (selectedMachine ? selectedMachine.harga : 0)
                    ).toLocaleString()} {currencySymbol}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bagian mesin cuci */}
        <div className="mesin-status-container">
          <div className="refresh-container">
            {!isLoadingMachines ? (
              <button
                className="refresh-button"
                onClick={handleRefreshMachinesClick}
              >
                <FontAwesomeIcon icon={faSyncAlt} className="refresh-icon" />
              </button>
            ) : (
              <div className="loader"></div>
            )}
          </div>
          <h3 className="judul">
            {selectedMachine ? (
              saldo - selectedMachine.harga < 0 ? (
                "Saldo tidak cukup, silahkan melakukan Top Up"
              ) : (
                `Anda telah memilih mesin ${selectedMachine.nama}`
              )
            ) : (
              "Silahkan pilih mesin yang bisa digunakan"
            )}
          </h3>
          <div className="col-8 mesin-section">
            <div className="mesin-list">
              <div className="mesin-list">
              {isLoadingMachines ? (
                <div>Loading...</div>
              ) : (
                machinesNew.map(renderMachineItem)
              )}
              </div>
            </div>
          </div>

          {/* Bagian kanan: Status mesin */}
          <div className="col-4 status-section">
            <div className="status-list">
              {statusData.map((status) => (
                <div key={status.id} className="status-item">
                  {status.require.endsWith(".webp") ? (
                    <img
                      src={require(`../../assets/image/${status.require}`)}
                      alt={status.nama}
                      className="status-icon"
                      style={{
                        width: "70px", // Control size as per your need
                        height: "70px",
                        objectFit: "cover", // Ensures the image fits well inside the circle
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faRotate}
                      size="2x"
                      spin
                      className="rotate-icon margin-left-ownself"
                      style={{ animationDuration: '5s' }}
                    />
                  )}
                  <p>{status.nama}</p>
                </div>
              ))}
                  <div className="promo-container-main">
                      <span className="promo-text-main">PROMO</span>
                      <div className="select-container-main">
                        {kupon.length > 0 ? (
                          <select>
                            <option value="">Pilih Voucher</option>
                            {kupon.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.nama}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-gray-500">Tidak ada voucher</p>
                        )}
                      </div>
                  </div>
            </div>
          </div>
        </div>

        {/* Keterangan Mesin dan Tombol Jalankan */}
        <div className="mesin-info">
          <div className="left-contain-mesin-info">
            <div className="mesin-type">
              <h4>
                MESIN {selectedMachine ? selectedMachine.nama : "MAX 10 KG"}
              </h4>
            </div>
            <div className="timer-control">
              <button
                className="arrow-button left-arrow"
                onClick={() => handleTimeChange(false)} // Kurangi waktu
                disabled={!selectedMachine || selectedMachine.tipe === 'sw'} // Disable jika belum memilih mesin
                style={{ color: selectedMachine && selectedMachine.tipe !== 'sw' ? "black" : "#A5A5A5" }} // Ubah warna tombol
              >
                <FontAwesomeIcon
                  icon={faCaretLeft}
                  style={{ fontSize: "70px" }}
                />
              </button>
              <div className="time-info">
                <span>{selectedMachine ? `${waktu} Menit` : "0 Menit"}</span>
              </div>
              <button
                className="arrow-button right-arrow"
                onClick={() => handleTimeChange(true)} // Tambah waktu
                disabled={!selectedMachine || selectedMachine.tipe === 'sw'} // Disable jika belum memilih mesin
                style={{ color: selectedMachine && selectedMachine.tipe !== 'sw' ? "black" : "#A5A5A5" }} // Ubah warna tombol
              >
                <FontAwesomeIcon
                  icon={faCaretRight}
                  style={{ fontSize: "70px" }}
                />
              </button>
              <div className="price-info">
                <span>
                  {selectedMachine
                    ? `Rp ${selectedMachine.harga.toLocaleString()}`
                    : "Rp 0"}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={jalankanMesin} 
            className={`jalankan-button ${!selectedMachine ? 'disabled' : ''}`}
          >
            Jalankan
          </button>
        </div>

        {/* Modal Top Up */}
        {isModalOpen && (
          <div
            className={`modal-overlay-main-page ${isClosing ? "closing" : ""}`}
          >
            <div
              className={`modal-content-main-page ${
                isClosing ? "slide-up" : "slide-down"
              }`}
            >
              <button className="close-modal-main-page" onClick={toggleModal}>
                <FontAwesomeIcon icon={faCircleXmark} />
              </button>
              <div className="payment-options">
                <a href="/type/Qris" className="qris-option">
                  <img
                    src={require("../../assets/image/qris_modal.webp")}
                    alt="QRIS"
                  />
                </a>
                <a href="/type/Cash" className="cash-option">
                  <img
                    src={require("../../assets/image/cash_modal.webp")}
                    alt="Cash"
                  />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
