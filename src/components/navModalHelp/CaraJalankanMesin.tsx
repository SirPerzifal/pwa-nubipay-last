import React from 'react';
import { cjm1, cjm2 } from '../../assets/image/Modal Help';
import '../../assets/css/components/navModalHelp.css'

const CaraJalankanMesin: React.FC = () => {
  return (
    <div>
      <h2>Cara Jalankan Mesin</h2>
      <p>Berikut adalah langkah-langkah untuk menjalankan mesin:</p>
      <div className='scrollable-gambar'>
        <img className='ukuran-gambar' src={cjm1} alt="Cara Jalankan Mesin 1" />
        <img className='ukuran-gambar' src={cjm2} alt="Cara Jalankan Mesin 2" />
      </div>
    </div>
  );
};

export default CaraJalankanMesin;
