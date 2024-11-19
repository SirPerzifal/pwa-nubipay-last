import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import "../../assets/css/Auth/ByPassStyle.css";
import ModalBypass from "../../components/ModalBypass";
import { fetchEmployeesAndTechnicians } from "../../utils/ExternalAPI";

interface Employee {
  id: number;
  name: string;
  branch_id: [number, string];
}

const ByPassPage = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [buttonName, setButtonName] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { 
          employees: fetchedEmployees
        } = await fetchEmployeesAndTechnicians();

        setEmployees(fetchedEmployees)
      } catch (error) {
        console.error('Error fetching employees and technicians:', error);
      }
    };

    fetchEmployees();
  }, []);

  const openModal = (name: string) => {
    setButtonName(name);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setButtonName(null);
  };

  // Gabungkan employees dan technicians
  const allStaff = [...employees];

  return (
    <div className="bypass-page">
      <div className="left-section-bypass">
        <img
          src={require("../../assets/image/v1_14.png")}
          alt="Opera Sabun Logo"
          className="logo-bypass"
        />
        <h1 className="welcome-text-bypass">
          SELAMAT DATANG DI <br />
          <span className="brand-text-bypass">OPERA SABUN</span>
        </h1>
      </div>
      <div className="right-section-bypass">
        <button onClick={() => window.location.href= "/login"} className="button-back-style-bypass">
            <FontAwesomeIcon icon={faArrowLeft} className="back-button-bypass"/>
        </button>
        
        {allStaff.map((staff) => (
          <button 
            key={staff.id}
            type="submit" 
            className="submit-button-bypass" 
            onClick={() => openModal(staff.name)}
          >
            {staff.name}
          </button>
        ))}
      </div>
      <img
        src={require("../../assets/image/v1_15.png")}
        alt="Mascot"
        className="mascot-background-bypass"
      />
      {isModalOpen && 
        <ModalBypass onClose={handleCloseModal} buttonName={buttonName} />
      }
    </div>
  );
};

export default ByPassPage;