import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate } from '@fortawesome/free-solid-svg-icons';

interface MachineButtonProps {
  status: string;
  handleClick: (isSelected: boolean) => void;
  className: string;
  disabled: boolean;
}

const MachineButton: React.FC<MachineButtonProps> = ({ status, handleClick, className, disabled }) => {
  const playSound = (isSelected: boolean) => {
    const audio = new Audio(isSelected 
      ? process.env.REACT_APP_SOUND_BUTTON_PRESSED
      : process.env.REACT_APP_SOUND_BUTTON_NEGATIIVE);
    audio.play();
  };

  const handleChange = () => {
    if (disabled) {
      playSound(false); // Play negative sound when disabled
      return;
    }
    const isSelected = status !== 'dipilih';
    playSound(isSelected);
    handleClick(isSelected);
  };

  return (
    <label className={`${className}`}>
      <input
        type="checkbox"
        checked={status === 'dipilih'}
        onChange={handleChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      {status === 'tersedia' && (
        <img 
          src={require("../assets/image/cekabu.webp")} 
          alt="Tersedia"
          style={{
            width: '70px',
            height: '70px',
            objectFit: 'cover',
          }}
        />
      )}
      {status === 'dipilih' && (
        <img 
          src={require("../assets/image/cekijo.webp")} 
          alt="Dipilih"
          style={{
            width: '70px',
            height: '70px',
            objectFit: 'cover',
          }}
        />
      )}
      {status === 'perbaikan' && (
        <img 
          src={require("../assets/image/xmark.webp")} 
          alt="Perbaikan"
          style={{
            width: '70px',
            height: '70px',
            objectFit: 'cover',
          }}
        />
      )}
      {status === 'digunakan' && (
        <FontAwesomeIcon icon={faRotate} size="2x" spin className="rotate-icon" />
      )}
    </label>
  );
};

export default MachineButton;