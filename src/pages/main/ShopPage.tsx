import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

import '../../assets/css/main/shopPageStyle.css';
import { fetchProductsByBranch } from '../../utils/ExternalAPI';

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]); // State to hold products
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [saldo, setSaldo] = useState(26400);
  const [pembelian, setPembelian] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState<{ visible: boolean, products: { namaBarang: string, harga: number, quantity: number }[] }>({ visible: false, products: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser') || '{}');
    setUser(loggedUser);
    setSaldo(loggedUser.total_deposit);

        // Fetch products based on branch ID
        const fetchProducts = async () => {
          try {
            const branchId = 6; // Assuming branch_id is stored in the loggedUser 
            const productData = await fetchProductsByBranch(branchId);
            setProducts(productData);
            // console.log(productData)
          } catch (error) {
            console.error('Error fetching products:', error);
          }
        };
    
        fetchProducts();
  }, []);

  const updateCart = (productId: number, quantity: number) => {
    const audio = new Audio(process.env.REACT_APP_SOUND_BUTTON_PRESSED);
    audio.play();
    setCart(prevCart => {
      const newCart = { ...prevCart, [productId]: Math.max(0, (prevCart[productId] || 0) + quantity) }; // Ensure no negative values
      const newPembelian = products.reduce((sum, product) => {
        return sum + (newCart[product.id] || 0) * product.list_price; // Use the correct price field
      }, 0);
      setPembelian(newPembelian);
      return newCart;
    });
  };

  const handleConfirm = () => {
    if (saldo >= pembelian) {
      setSaldo(saldo - pembelian);
      setPembelian(0);
      setCart({});
  
      // Collect product purchase details
      const purchasedProducts = products
        .filter(product => cart[product.id] > 0)
        .map(product => ({
          namaBarang: product.name, // Use the correct name field
          harga: product.list_price, // Use the correct price field
          quantity: cart[product.id],
        }));
  
      // Set showModal and product details
      setShowModal({ visible: true, products: purchasedProducts });
    } else {
      alert("Saldo tidak cukup!");
    }
  };  

  return (
    <div className="shop-page">
      <Header user={user} />

      <div className="shop-content">
        <h1 className="shop-title">PEMBELIAN SABUN</h1>
        <div className="products-container">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={require(`../../assets/image/barang/${product.name}.webp`)} alt={product.namaBarang} className="product-image" />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>RP. {product.list_price.toLocaleString()}</p>
                <div className="quantity-control">
                  <button
                    className="quantity-button mines-button"
                    onClick={() => updateCart(product.id, -1)}
                    disabled={(cart[product.id] || 0) <= 0}
                  >
                    -
                  </button>
                  <span className='quantity-info'>{cart[product.id] || 0}</span>
                  <button
                    className="quantity-button plus-button"
                    onClick={() => updateCart(product.id, 1)}
                    disabled={product.stok <= (cart[product.id] || 0)}
                  >
                    +
                  </button>
                </div>
                <p className="stock-info">Sisa Stok {product.qty_available - (cart[product.id] || 0)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="total-container">
          <div className="total-shop-container">
            <h2>Total Belanja</h2>
            <div className="total-box-shop">
              <p>Poin Sekarang: <span>Rp {saldo.toLocaleString()}</span></p>
              <p>Pembelian: <span>Rp {pembelian.toLocaleString()}</span></p>
              <hr />
              <p>SISA POIN <span>Rp {(saldo - pembelian).toLocaleString()}</span></p>
            </div>
          </div>

          <div className="buttons-container">
            {/* Tambahkan onClick untuk tombol KEMBALI */}
            <button className="back-button" onClick={() => navigate("/main")}>KEMBALI</button>
            <button 
              className={`confirm-button ${pembelian === 0 ? 'disabled' : ''}`}
              onClick={handleConfirm} 
              disabled={pembelian === 0} // Tombol dinonaktifkan jika pembelian 0
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
      {showModal.visible && (
        <div className="modal-shop">
          <div className="modal-content-shop">
            <h2>Rincian Pembelian</h2>
            <p>Apakah kamu yakin untuk melanjutkan pembelian?</p>
            <h3>Rincian Pembelian Anda:</h3>
            {showModal.products.map((item, index) => (
              <ul>
                <li key={index}>
                  {item.namaBarang} 
                </li>
                <li>
                  - {item.quantity} x Rp {item.harga.toLocaleString()}
                </li>
                <li>
                  = Rp {(item.harga * item.quantity).toLocaleString()}
                </li>
              </ul>
            ))}
            <button onClick={() => {
              setShowModal({ visible: false, products: [] }); // Close the modal
              navigate('/success', { state: { purchasedProducts: showModal.products } }); // Pass products
            }}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
