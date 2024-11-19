import React from 'react';
import { cbs1, cbs2, cbs3, cbs4 } from '../../assets/image/Modal Help';
import '../../assets/css/components/navModalHelp.css'

const CaraBeliSabun: React.FC = () => {
  return (
    <div>
      <h2>Cara Beli Sabun</h2>
      <p>Berikut adalah langkah-langkah untuk membeli sabun:</p>
      <div className='scrollable-gambar'>
        <img className='ukuran-gambar' src={cbs1} alt="Cara Beli Sabun 1" />
        <img className='ukuran-gambar' src={cbs2} alt="Cara Beli Sabun 2" />
        <img className='ukuran-gambar' src={cbs3} alt="Cara Beli Sabun 3" />
        <img className='ukuran-gambar' src={cbs4} alt="Cara Beli Sabun 4" />
      </div>
    </div>
  );
};

export default CaraBeliSabun;
