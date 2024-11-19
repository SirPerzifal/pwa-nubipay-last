import React from 'react';
import { ctu1, ctu2, ctu3, ctu4 } from '../../assets/image/Modal Help';
import '../../assets/css/components/navModalHelp.css'

const CaraTopUp: React.FC = () => {
  return (
    <div>
      <h2>Cara Top Up</h2>
      <p>Berikut adalah langkah-langkah untuk melakukan top up poin:</p>
      <div className='scrollable-gambar'>
        <img className='ukuran-gambar' src={ctu1} alt="Cara Top Up 1" />
        <img className='ukuran-gambar' src={ctu2} alt="Cara Top Up 2" />
        <img className='ukuran-gambar' src={ctu3} alt="Cara Top Up 3" />
        <img className='ukuran-gambar' src={ctu4} alt="Cara Top Up 4" />
      </div>
    </div>
  );
};

export default CaraTopUp;
