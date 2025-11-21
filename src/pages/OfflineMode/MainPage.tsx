import React, { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import { RefreshCw } from "lucide-react";
import "../../assets/css/OfflineMode/MainPageOfflineMode.css";
import statusData from "../../assets/data/status.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
  faRightFromBracket,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

import MachineButton from "../../components/MachineButton";
import { useSQLite } from "../../hooks/useSQLite";
import { DBActions } from "../../db/action";
// Machine Image
import BCT020 from "../../assets/image/mesin/BC20 Kuning.webp";
import BCT030 from "../../assets/image/mesin/BC30 Kuning.webp";
import BCT040 from "../../assets/image/mesin/BC40 Kuning.webp";
import SW from "../../assets/image/mesin/Single Washer.webp";
import TBL from "../../assets/image/mesin/Tumbler.webp";
import WD from "../../assets/image/mesin/WD.webp";

import MachnineDummy from "../../assets/data/MesinOffline.json";
import { useNavigate } from "react-router-dom";
import { useSerial } from "../../hooks/SerialContext";

type Machine = {
  _id: string;
  controlId: string;
  modelNumber: string;
  status: {
    controlStatus: string;
  };
  nodeNumber: number;
  topoffPrice: number;
  topoffTimeInSeconds: number;
};

const MainPage = () => {
  const sqlite = useSQLite();
  const db = sqlite.isReady ? new DBActions(sqlite) : null;
  const [numberDisplay, setNumberDisplay] = useState("");
  const [saldoDisplay, setSaldoDisplay] = useState("");
  const [STEPPRICE, SETSTEPPRICE] = useState(4000);
  const [STEP, SETSTEP] = useState(360);

  const [duration, setDuration] = useState(0);
  const [price, setPrice] = useState(0);
  const [sisaSaldo, setSisaSaldo] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mesinGridRef = useRef<HTMLDivElement>(null);
  const [machineDataFromRaspiServer, setMachineDataFromRaspiServer] = useState<
    any[]
  >([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate
  const { connectToDevice } = useSerial();

  const fetchFromRaspi = async () => {
    const gridElement = mesinGridRef.current;
    const scrollWidth = gridElement?.scrollWidth;
    const clientWidth = gridElement?.clientWidth;

    if (gridElement) {
      try {
        const response = await axios.get(
          "http://192.168.42.1:8085/api/v1/controls"
        );

        const controls = response.data.controls;
        console.log("✅ Data yang akan di-set:", controls.length, "items");

        setMachineDataFromRaspiServer(controls);

        if ((scrollWidth || 0) > (clientWidth || 0)) {
          // Scroll ke kanan
          setTimeout(() => {
            gridElement.scrollTo({
              left: (scrollWidth || 0) - (clientWidth || 0),
              behavior: "smooth",
            });
          }, 500);

          // Scroll kembali ke kiri
          setTimeout(() => {
            gridElement.scrollTo({
              left: 0,
              behavior: "smooth",
            });
          }, 1000);
        }
      } catch (error) {
        console.error("Error fetching from Raspi:", error);
        setMachineDataFromRaspiServer(MachnineDummy);
      } finally {
        setLoading(false);
      }
    }
  };

  // Animation scroll ke kanan saat pertama kali load
  useEffect(() => {
    async function loadUser() {
      const userId = sessionStorage.getItem("userId") || "";
      // console.log(userId);

      const getUserData = await db?.getUserById(userId);
      // console.log(getUserData);

      setNumberDisplay(getUserData?.nomor_telepon || "");
      setSaldoDisplay(getUserData?.saldo || "");
      setMachineDataFromRaspiServer(MachnineDummy);
    }

    if (db) loadUser();
  }, [db]);

  const machineImages = {
    BCT020,
    BCT030,
    BCT040,
    SW,
    TBL,
    WD,
  };

  const getMachineImage = (controlId: string) => {
    if (controlId.startsWith("BCT020")) return machineImages.BCT020;
    if (controlId.startsWith("BCT030")) return machineImages.BCT030;
    if (controlId.startsWith("BCT040")) return machineImages.BCT040;
    if (controlId.startsWith("SW")) return machineImages.SW;
    if (controlId.startsWith("BTT30")) return machineImages.TBL;
    if (controlId.startsWith("WD")) return machineImages.WD;
    return "";
  };

  const isDoubleMachine = (controlId: string) => {
    return (
      controlId.startsWith("TBL") ||
      controlId.startsWith("WD") ||
      controlId.startsWith("BTT30")
    );
  };

  // ✅ FIXED: Group machines dengan logic yang lebih baik
  // ✅ FIXED: Group machines berdasarkan nodeNumber
  const groupMachines = () => {
    const grouped: Array<{
      type: "single" | "double";
      top?: Machine;
      bottom?: Machine;
      machine?: Machine;
    }> = [];

    const processed = new Set<string>();

    // Sort machines by nodeNumber first
    const sortedMachines = [...machineDataFromRaspiServer].sort(
      (a, b) => a.nodeNumber - b.nodeNumber
    );

    // console.log("Processing machines:", sortedMachines.length, "items");

    // Pisahkan mesin double dan single
    const doubleMachines: Machine[] = [];
    const singleMachines: Machine[] = [];

    sortedMachines.forEach((machine) => {
      if (isDoubleMachine(machine.modelNumber)) {
        doubleMachines.push(machine);
      } else {
        singleMachines.push(machine);
      }
    });

    // Add single machines
    singleMachines.forEach((machine) => {
      grouped.push({
        type: "single",
        machine,
      });
      processed.add(machine._id);
    });

    // Group double machines - setiap 2 mesin berurutan dipasangkan
    for (let i = 0; i < doubleMachines.length; i += 2) {
      const topMachine = doubleMachines[i]; // Node lebih kecil = TOP
      const bottomMachine = doubleMachines[i + 1]; // Node lebih besar = BOTTOM (jika ada)

      grouped.push({
        type: "double",
        top: topMachine,
        bottom: bottomMachine, // bisa undefined jika ganjil
      });

      processed.add(topMachine._id);
      if (bottomMachine) processed.add(bottomMachine._id);
    }

    // console.log("Grouped result:", grouped.length, "groups", grouped);
    return grouped;
  };

  const groupedMachines = useMemo(() => {
    if (machineDataFromRaspiServer.length === 0) {
      return [];
    }
    // console.log("Processing grouped data", machineDataFromRaspiServer.length);

    return groupMachines();
  }, [machineDataFromRaspiServer]);

  const formatLabel = (id: any) => {
    if (!id) return "";
    return id.length > 2 ? id.substring(0, 2) + "..." : id;
    // return id;
  };

  // ✅ FIXED: Parameter vend dan validasi
  const sampleRunMachine = async (controlId?: string, vend?: number) => {
    // Validasi
    if (!controlId) {
      alert("Silakan pilih mesin terlebih dahulu!");
      return;
    }

    if (!duration || duration <= 0) {
      alert("Durasi tidak valid!");
      return;
    }

    const currentSaldo = parseInt(saldoDisplay) || 0;
    console.log(
      "Running machine:",
      controlId,
      "Duration:",
      duration,
      "Price:",
      price
    );

    if (currentSaldo < price) {
      alert("Saldo tidak mencukupi! Silakan top up terlebih dahulu.");
      return;
    }

    // try {
    //   const token =
    //     "eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJpYXQiOjE3NTYxODkyNjgsImV4cCI6MTc2Mzk2NTI2OCwiYXVkIjoiaHR0cHM6Ly95b3VyZG9tYWluLmNvbSIsImlzcyI6ImZlYXRoZXJzIiwic3ViIjoiYW5vbnltb3VzIn0.Bb-zAPTGXlkJeq5zcWjt-tPkr41sswbB1T2FXcXPjJ8";

    //   const response = await axios.post(
    //     `http://192.168.42.1:8085/api/v1/commands`,
    //     {
    //       command: {
    //         commandType: 3,
    //         controlIds: [controlId],
    //         status: 1,
    //         connectivityTypeId: 3,
    //         parameters: {
    //           vend: duration, // ✅ FIXED: Gunakan duration, bukan price
    //         },
    //         firebase: false,
    //       },
    //     },
    //     {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );

    //   console.log("Machine run response:", response.data);

    //   if (response.status === 201) {
    const newSaldo = currentSaldo - price;

    const updateSaldo = await db?.updateSaldo(
      sessionStorage.getItem("userId"),
      newSaldo
    );
    console.log("Update saldo successfull:", updateSaldo);

    const createTransactionrRcord = await db?.addTransaksi(
      sessionStorage.getItem("userId"),
      "jalankan_mesin",
      controlId,
      vend,
      "",
      new Date().toISOString()
    );
    console.log(createTransactionrRcord);

    window.location.href = "success-page-offline";
    //   }
    // } catch (error) {
    //   console.error("Error during sample run:", error);
    //   alert("Gagal menjalankan mesin. Silakan coba lagi.");
    // }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // await fetchFromRaspi();
      setMachineDataFromRaspiServer(MachnineDummy);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const MIN_DURATION = 360;
  const MAX_DURATION = 3600;
  const canIncrease =
    duration < MAX_DURATION && duration !== 0 && duration !== 1500;
  const canDecrease =
    duration > MIN_DURATION && duration !== 0 && duration !== 1500;

  const handleDurationChange = (command: string) => {
    if (command !== "UP" && command !== "DOWN") return;

    const increment = command === "UP" ? STEP : -STEP;
    const incremenPrice = command === "UP" ? STEPPRICE : -STEPPRICE;
    const newDuration = duration + increment;
    const newPrice = price + incremenPrice;

    if (newDuration >= MIN_DURATION && newDuration <= MAX_DURATION) {
      setDuration(newDuration);
      setPrice(newPrice);
    }
  };

  const handleLabelClick = (machine: Machine, isSelected: boolean) => {
    console.log(
      "Clicked machine:",
      machine.controlId,
      "isSelected:",
      isSelected
    );

    if (isSelected) {
      setSelectedMachineId(machine._id);
      setSelectedMachine(machine);
      setPrice(0);
      setSisaSaldo(parseInt(saldoDisplay) || 0);
      setDuration(0);
      console.log(machine);

      // ✅ FIXED: Hitung price dan sisa saldo
      if (
        machine.modelNumber.startsWith("TBL") ||
        machine.modelNumber.startsWith("WD") ||
        machine.modelNumber.startsWith("BTT30")
      ) {
        setPrice(machine.topoffPrice);
        SETSTEPPRICE(machine.topoffPrice);
        setDuration(machine.topoffTimeInSeconds);
        SETSTEP(machine.topoffTimeInSeconds);
        setSisaSaldo((parseInt(saldoDisplay) || 0) - machine.topoffPrice);
      } else {
        if (machine.modelNumber.startsWith("BCT020")) {
          setPrice(10000);
          setDuration(1500);
          setSisaSaldo((parseInt(saldoDisplay) || 0) - 10000);
        } else if (machine.modelNumber.startsWith("BCT030")) {
          setPrice(13500);
          setDuration(1500);
          setSisaSaldo((parseInt(saldoDisplay) || 0) - 13500);
        } else if (machine.modelNumber.startsWith("BCT040")) {
          setPrice(16500);
          setDuration(1500);
          setSisaSaldo((parseInt(saldoDisplay) || 0) - 16500);
        }
      }
    } else {
      setSelectedMachineId(null);
      setSelectedMachine(null);
      setPrice(0);
      setSisaSaldo(parseInt(saldoDisplay) || 0);
      setDuration(0);
    }
  };

  const secondToMinutes = (seconds: number) => {
    return Math.floor(seconds / 60);
  };

  const getMachineMaxKG = (modelNumber?: string) => {
    if (modelNumber?.startsWith("BCT020")) return "MESIN MAX 10 KG";
    if (modelNumber?.startsWith("BCT030")) return "MESIN MAX 16 KG";
    if (modelNumber?.startsWith("BCT040")) return "MESIN MAX 21 KG";
    if (modelNumber?.startsWith("SW")) return "MESIN MAX 10 KG";
    if (modelNumber?.startsWith("BTT30")) return "MESIN PENGERING";
  };

  const directToTopupPage = async () => {
    const ok = await connectToDevice();

    // kalau gagal connect, JANGAN navigate
    if (!ok) return;

    navigate("/top-up-page-offline");
  };

  const Logout = () => {
    window.location.href = "login-offline";
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

      {/* Top Section */}
      <div id="top-section-main-page-offline-mode">
        {/* Left - Saldo */}
        <div id="left-section-of-main-page-offline-mode">
          <div id="saldo-detail-offline-mode">
            <h2>Saldo Anda:</h2>
            <div id="saldo-display-offline-mode">
              <h1>{saldoDisplay.toLocaleString() || 0}</h1>
              <span className="point-symbol">ⓟ</span>
            </div>
          </div>
          <button
            onClick={() => directToTopupPage()}
            className="topup-button-display"
          >
            <strong>+ Top Up</strong>
          </button>
        </div>

        {/* Right - Total Belanja - ✅ FIXED: Update nilai dinamis */}
        <div id="right-section-of-main-page-offline-mode">
          <div className="total-belanja-section-offline-mode">
            <h3>TOTAL BELANJA</h3>
            <div className="potongan-saldo-section-offline-mode">
              <p className="p1">Poin Terpotong</p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <p className="p2">{price.toLocaleString()}</p>
                <span className="point-symbol">ⓟ</span>
              </div>
            </div>
          </div>
          <div className="sisa-saldo-section-offline-mode">
            <h3>SISA POIN</h3>
            <div id="saldo-display-sisa-offline-mode">
              <p>{sisaSaldo.toLocaleString()}</p>
              <span className="point-symbol">ⓟ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Mesin Grid */}
      <div id="middle-section-main-page-offline-mode">
        <div id="fill-section-of-main-page-offline-mode">
          <div className="mesin-header-offline-mode">
            <h3>Silahkan pilih mesin yang bisa di gunakan</h3>
            <button
              className={`refresh-button-small-offline-mode ${
                isRefreshing ? "refreshing" : ""
              }`}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={28} />
            </button>
          </div>

          <div className="mesin-content-wrapper-offline-mode">
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}></div>
            ) : (
              <div className="mesin-grid-offline-mode" ref={mesinGridRef}>
                {groupedMachines.map((group, index) => {
                  if (group.type === "single" && group.machine) {
                    const isSelected = selectedMachineId === group.machine._id;
                    const statusToDisplay = isSelected
                      ? "dipilih"
                      : group.machine.status.controlStatus.toLowerCase();

                    return (
                      <div
                        key={`single-${group.machine._id}`}
                        className="machine-item machine-single"
                      >
                        <div
                          className={`machine-label machine-label-single ${group.machine.modelNumber.slice(
                            0,
                            6
                          )}`}
                        >
                          {formatLabel(group.machine.modelNumber)}
                        </div>
                        <MachineButton
                          className={`machine-btn machine-btn-single ${group.machine.modelNumber.slice(
                            0,
                            6
                          )}`}
                          status={statusToDisplay}
                          handleClick={(isSelected: boolean) =>
                            handleLabelClick(group.machine!, isSelected)
                          }
                          disabled={
                            group.machine.status.controlStatus.toLowerCase() ===
                              "unavailable" ||
                            group.machine.status.controlStatus.toLowerCase() ===
                              "in_use"
                          }
                        />
                        <img
                          src={getMachineImage(group.machine.modelNumber)}
                          alt={group.machine.modelNumber}
                          className="machine-image"
                        />
                      </div>
                    );
                  }

                  if (group.type === "double") {
                    const image = group.top
                      ? getMachineImage(group.top.modelNumber)
                      : group.bottom
                      ? getMachineImage(group.bottom.modelNumber)
                      : "";

                    return (
                      <div
                        key={`double-${index}`}
                        className="machine-item machine-double"
                      >
                        {group.top && (
                          <>
                            <div
                              className={`machine-label machine-label-top ${group.top.modelNumber.slice(
                                0,
                                6
                              )}`}
                            >
                              {formatLabel(group.top.modelNumber)}
                            </div>
                            <MachineButton
                              className={`machine-btn machine-btn-top ${group.top.modelNumber.slice(
                                0,
                                6
                              )}`}
                              status={
                                selectedMachineId === group.top._id
                                  ? "dipilih"
                                  : group.top.status.controlStatus.toLowerCase()
                              }
                              handleClick={(isSelected: boolean) =>
                                handleLabelClick(group.top!, isSelected)
                              }
                              disabled={
                                group.top.status.controlStatus.toLowerCase() ===
                                  "unavailable" ||
                                group.top.status.controlStatus.toLowerCase() ===
                                  "in_use"
                              }
                            />
                          </>
                        )}
                        {group.bottom && (
                          <>
                            <div
                              className={`machine-label machine-label-bottom ${group.bottom.modelNumber.slice(
                                0,
                                6
                              )}`}
                            >
                              {formatLabel(group.bottom.modelNumber)}
                            </div>
                            <MachineButton
                              className={`machine-btn machine-btn-bottom ${group.bottom.modelNumber.slice(
                                0,
                                6
                              )}`}
                              status={
                                selectedMachineId === group.bottom._id
                                  ? "dipilih"
                                  : group.bottom.status.controlStatus.toLowerCase()
                              }
                              handleClick={(isSelected: boolean) =>
                                handleLabelClick(group.bottom!, isSelected)
                              }
                              disabled={
                                group.bottom.status.controlStatus.toLowerCase() ===
                                  "unavailable" ||
                                group.bottom.status.controlStatus.toLowerCase() ===
                                  "in_use"
                              }
                            />
                          </>
                        )}
                        <img
                          src={image}
                          alt="Machine"
                          className="machine-image"
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* Legend */}
            <div className="legend-section-offline-mode">
              {statusData.map((status) => (
                <div key={status.id} className="status-item">
                  {status.require.endsWith(".webp") ? (
                    <img
                      src={require(`../../assets/image/${status.require}`)}
                      alt={status.nama}
                      className="status-icon"
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faRotate}
                      size="2x"
                      spin
                      className="rotate-icon margin-left-ownself"
                      style={{ animationDuration: "5s" }}
                    />
                  )}
                  <p>{status.nama}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div id="bottom-section-main-page-offline-mode">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            alignContent: "flex-end",
          }}
        >
          <div className="tipe-mesin-choose-offline-mode">
            <h4>{getMachineMaxKG(selectedMachine?.modelNumber)}</h4>
          </div>
          <div className="time-control-container-offline-mode">
            <button
              className={`arrow-button-offline-mode left-arrow-offline-mode`}
              onClick={() => handleDurationChange("DOWN")}
              disabled={!canDecrease}
              style={{
                opacity: canDecrease ? 1 : 0.4,
                cursor: canDecrease ? "pointer" : "not-allowed",
              }}
            >
              <FontAwesomeIcon
                icon={faCaretLeft}
                style={{
                  fontSize: "90px",
                  color: canDecrease ? "" : "#695d5d",
                }}
              />
            </button>

            <h1 className="time-info-offline-mode">
              {secondToMinutes(duration)} Menit
            </h1>

            <button
              className={`arrow-button-offline-mode right-arrow-offline-mode`}
              onClick={() => handleDurationChange("UP")}
              disabled={!canIncrease}
              style={{
                opacity: canIncrease ? 1 : 0.4,
                cursor: canIncrease ? "pointer" : "not-allowed",
              }}
            >
              <FontAwesomeIcon
                icon={faCaretRight}
                style={{
                  fontSize: "90px",
                  color: canIncrease ? "" : "#695d5d",
                }}
              />
            </button>

            <div style={{ display: "flex", flexDirection: "row" }}>
              <h1 className="harga-display-calculate-offline-mode">
                {price.toLocaleString()}
              </h1>
              <span className="point-symbol">ⓟ</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => sampleRunMachine(selectedMachine?.controlId, price)}
          className="button-jalankan-bottom-main-page-offline"
          disabled={!selectedMachine || sisaSaldo < 0}
          style={{
            opacity: !selectedMachine || sisaSaldo < 0 ? 0.5 : 1,
            cursor:
              !selectedMachine || sisaSaldo < 0 ? "not-allowed" : "pointer",
          }}
        >
          {sisaSaldo < 0 ? "Saldo Tidak Cukup" : "Jalankan"}
        </button>
      </div>
    </div>
  );
};

export default MainPage;
