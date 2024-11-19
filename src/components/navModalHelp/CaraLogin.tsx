import React from 'react';
import { cl1, cl2, cl3 } from '../../assets/image/Modal Help'
import '../../assets/css/components/navModalHelp.css'

const CaraLogin: React.FC = () => {
    return (
    <div>
      <h2>Cara Login</h2>
      <p>Berikut adalah langkah-langkah untuk login ke dalam sistem:</p>
      <div className='scrollable-gambar'>
        <img className='ukuran-gambar' src={cl1} alt="Cara Login 1" />
        <img className='ukuran-gambar' src={cl2} alt="Cara Login 2" />
        <img className='ukuran-gambar' src={cl3} alt="Cara Login 3" />
      </div>
    </div>
  );
};

export default CaraLogin;
