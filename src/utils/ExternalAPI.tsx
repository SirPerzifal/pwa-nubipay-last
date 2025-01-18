import * as xmlrpc from 'xmlrpc';

const db = 'os_np_16';
const username = 'admin';
const password = '$g33d3@y0D';

interface Voucher {
  id: number;
  voucher_id: { name: string }; // Assuming voucher_id has a name property
  voucher_nominal: number;
  voucher_nominal_mode: string;
  expired_date: string | null; // Can be null if no expiration date
  for_washer_voucher: boolean;
  for_dryer_voucher: boolean;
}

async function xmlRpcWithRetry<T>(
  fn: () => Promise<T>, 
  maxRetries = 3, 
  baseDelay = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`XML-RPC Attempt ${attempt} failed:`, error);
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

//fungsi autentikasi
const authenticate = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/common`, headers: { 'Access-Control-Allow-Origin': '*' } });
    client.methodCall('authenticate', [db, username, password, {}], (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};

//fungsi cari pengguna
const searchPartner = (uid: number, phoneNumber: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/object`, headers: {'Access-Control-Allow-Origin': '*'}});
    client.methodCall('execute_kw', [
      db, uid, password,
      'res.partner', 'search_read',
      [[['phone', '=', phoneNumber], ['active', 'in', [true, false]], ['is_ban', 'in', [true, false]]]],
      { fields: ['id', 'name', 'phone', 'branch_id', 'state', 'is_ban', 'is_otp_whatsapp', 'total_deposit', 'city', 'street', 'street2', 'state_id', 'country_id'] }
    ], (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};

// Fungsi untuk mengambil data transaksi berdasarkan partner_id
const fetchTransactionsByPartnerId = (uid: number, partnerId: number): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ 
      url: `/xmlrpc/2/object`, 
      headers: { 'Access-Control-Allow-Origin': '*' } 
    });

    // Sesuaikan fields dengan yang tersedia di model sgeede.mqtt.device.history
    client.methodCall('execute_kw', [
      db, uid, password,
      'sgeede.mqtt.device.history', 'search_read',
      [[['partner_id', '=', partnerId]]],
      { 
        fields: [
          'date_order', 
          'outlet', 
          'machine_type_custom',  // Gunakan create_date sebagai pengganti date_order
          'machine_display_name',        // Gunakan field yang sesuai untuk nilai transaksi
          'price', 
          'price'
        ], 
        limit: 50 
      }
    ], (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};

// Fungsi regis
const regisPartner = (uid: number, phoneNumber: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/object`, headers: {'Access-Control-Allow-Origin': '*'}});
    
    client.methodCall('execute_kw', [
      db, uid, password,
      'res.partner', 'create',
      [
        {
          name: phoneNumber, 
          state: 'waiting',
          active: true,
          phone: phoneNumber, 
          email: 'admin@yourcompany.example.com', 
          city: 'Batam', 
          street: 'Batam',
          zip: 29444,
          state_id: 629, 
          country_id: 100
        }
      ]
    ], (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};

// Fungsi untuk mengambil data transaksi bypass
const fetchTransactionsBypass = (uid: number, branchId?: number): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ 
      url: `/xmlrpc/2/object`, 
      headers: { 'Access-Control-Allow-Origin': '*' } 
    });

    // Buat domain dinamis berdasarkan branchId
    let domain: any[] = [];
    
    if (branchId) {
      domain = [['branch_id', '=', branchId]];
    }

    client.methodCall('execute_kw', [
      db, uid, password,
      'sgeede.mqtt.device.history', 'search_read',
      [domain], // Gunakan domain yang sudah dibuat
      { 
        fields: [
          'date_order', 
          'branch_id',  
          'machine_type_custom',
          'machine_display_name',
          'price',
          'partner_id'  
        ], 
        limit: 50,
        order: 'date_order desc'
      }
    ], (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};

// Fungsi untuk mengambil karyawan berdasarkan branch
const fetchEmployeesByBranch = (uid: number, branchId: number): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ 
      url: `/xmlrpc/2/object`, 
      headers: { 'Access-Control-Allow-Origin': '*' } 
    });

    client.methodCall('execute_kw', [
      db, uid, password,
      'hr.employee', 'search_read',
      [[['branch_id', '=', branchId]]], 
      { 
        fields: ['id', 'name', 'branch_id'],
        limit: 0 // Tambahkan ini untuk mengambil semua data
      }
    ], (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};

// Fungsi untuk mengambil alasan bypass
const fetchBypassReasons = (uid: number): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ 
      url: `/xmlrpc/2/object`, 
      headers: { 'Access-Control-Allow-Origin': '*' } 
    });

    client.methodCall('execute_kw', [
      db, uid, password,
      'sgeede.os.bypass.reason', 'search_read',
      [[]], // Mengambil semua alasan bypass
      { fields: ['id', 'name'] } // Sesuaikan fields yang ingin diambil
    ], (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};

// Fungsi untuk mengambil produk
const fetchProducts = (uid: number, branchId: number): Promise<any[]> => {
  return xmlRpcWithRetry(() => {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createClient({ url: `/xmlrpc/2/object`, headers: { 'Access-Control-Allow-Origin': '*' } });
  
      client.methodCall('execute_kw', [
        db, uid, password,
        'product.product', 'search_read',
        [[['product_tmpl_id.branch_ids', 'in', [branchId]]]], // Adjusted domain
        { fields: ['id', 'name', 'image_1920', 'list_price', 'qty_available'] }
      ], (error, value) => {
        if (error) reject(error);
        else resolve(value);
      });
    });
  });
};

// Fungsi untuk mengambil data mesin
const fetchMachinesPrice = (uid: number, branchId: number): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/object` });
    client.methodCall('execute_kw', [
      db, uid, password,
      'sgeede.mqtt.device', 'search_read',
      [[['branch_id', '=', branchId]]],
      { fields: ['machine_id', 'label_atas', 'label_bawah', 'price_top', 'price_bottom', 'duration_top', 'duration_bottom', 'inc_price_top', 'inc_price_bot', 'inc_duration_top', 'inc_duration_bot'], limit: 50 }
    ], (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};

// Fungsi untuk mengambil data promo
const fetchPromoData = async (uid: number, branchId: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/object` });
    client.methodCall('execute_kw', [
      db, uid, password,
      'os.promo', 'search_read',
      [[['branch_id', '=', branchId]]],
      { fields: ['id', 'name', 'start_time_voucher', 'end_time_voucher', 'percent_discount', 'max_price', 'for_washer_discount', 'for_dryer_discount', 'voucher', 'is_qty_promo', 'is_tp_voucher', 'display_discount_amount'], limit: 1, order: 'id desc' }
    ], async (error, promos) => {
      if (error) {
        reject(error);
        return;
      }

      if (promos.length === 0) {
        resolve({ active_voucher: false, data_promo: [] });
        return;
      }

      const promo = promos[0];
      const activeVoucher = promo.voucher || promo.is_qty_promo || promo.is_tp_voucher;

      const todayDatetime = new Date();
      const today = todayDatetime.toISOString().split('T')[0];

      // Check voucher validity
      const voucherData = await fetchAvailableVouchers(uid, promo.id, today);
      const discountData = await fetchDiscountData(uid, promo.id, today, todayDatetime);

      resolve({
        active_voucher: activeVoucher,
        data_promo: voucherData,
        ...discountData,
        display_discount: promo.display_discount_amount,
      });
    });
  });
};

const fetchAvailableVouchers = async (uid: number, promoId: number, today: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/object` });
    client.methodCall('execute_kw', [
      db, uid, password,
      'os.promo.voucher', 'search_read',
      [[['promo_id', '=', promoId], ['state', '=', 'available'], ['expired_date', '>=', today]]],
      { fields: ['id', 'voucher_id', 'voucher_nominal', 'voucher_nominal_mode', 'expired_date', 'for_washer_voucher', 'for_dryer_voucher'], order: 'expired_date ASC' }
    ], (error, vouchers) => {
      if (error) {
        reject(error);
      } else {
        const dataPromo = vouchers.map((voucher: Voucher) => ({ // Use the Voucher type here
          id: voucher.id,
          name: voucher.voucher_id.name,
          nominal: voucher.voucher_nominal,
          type_nominal: voucher.voucher_nominal_mode,
          expired: voucher.expired_date ? voucher.expired_date.split('T')[0] : '-',
          for: `${voucher.for_washer_voucher ? 'washer' : ''}${voucher.for_dryer_voucher ? (voucher.for_washer_voucher ? ',dryer' : 'dryer') : ''}`,
        }));
        resolve(dataPromo);
      }
    });
  });
};

const fetchDiscountData = async (uid: number, promoId: number, today: string, todayDatetime: Date): Promise<any> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/object` });
    client.methodCall('execute_kw', [
      db, uid, password,
      'os.promo.discount', 'search_count',
      [[['promo_id', '=', promoId], ['get_discount_date', '=', today]]]
    ], (error, discountCount) => {
      if (error) {
        reject(error);
      } else {
        // Implement logic to check discounts based on conditions from the original Python code
        // This part should include the logic for discount calculation based on day conditions and max limits

        resolve({
          discount_data_washer: 0, // Placeholder for actual discount data
          max_discount_washer: 0, // Placeholder for max discount data
          type_machine_washer: '', // Placeholder for machine type
          discount_data_dryer : 0, // Placeholder for actual discount data
          max_discount_dryer: 0, // Placeholder for max discount data
          type_machine_dryer: '', // Placeholder for machine type
        });
      }
    });
  });
};

// Fungsi untuk menjalankan mesin
const statusMachine = async (machineId: number, branchId: number, statusWasher: string, statusDryer: string): Promise<any> => {
  try {
    const uid = await authenticate();
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/object` });

    // Update status washer dan dryer berdasarkan machineId dan branchId
    const response = await new Promise((resolve, reject) => {
      client.methodCall('execute_kw', [
        db, uid, password,
        'sgeede.mqtt.device', 'write',
        [[machineId], { status_washer: statusWasher, status_dryer: statusDryer, branch_id: branchId }]
      ], (error, value) => {
        if (error) reject(error);
        else resolve(value);
      });
    });
    console.log('Machine ID:', machineId);
console.log('Status Washer:', statusWasher);
console.log('Status Dryer:', statusDryer);
console.log('Branch ID:', branchId);
    return response;
  } catch (error) {
    console.error('Error running machine:', error);
    console.log('Machine ID:', machineId);
console.log('Status Washer:', statusWasher);
console.log('Status Dryer:', statusDryer);
console.log('Branch ID:', branchId);
    throw error;
  }
};

// Fungsi untuk membuat data baru di sgeede.mqtt.device.history
const DeviceHistory = async (data: {
  device_id: number;
  partner_id: number;
  name: string;
  status: string;
  date_order: string;
  is_tumble: boolean;
  user_id: number;
  outlet: string;
  machine_type: string;
  price: number;
  duration: number;
  branch_id: number;
  machine_id: number;
  machine_label: string;
  currency_id: number;
  state: string;
  date: string;
}): Promise<any> => {
  try {
    const uid = await authenticate();
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/object` });

    // Menggunakan metode 'create' untuk menambahkan data baru
    const response = await new Promise((resolve, reject) => {
      client.methodCall('execute_kw', [
        db, uid, password,
        'sgeede.mqtt.device.history', 'create',
        [{
          device_id: data.device_id,
          partner_id: data.partner_id,
          name: data.name,
          status: data.status,
          date_order: data.date_order,
          is_tumble: data.is_tumble,
          user_id: data.user_id,
          outlet: data.outlet,
          machine_type: data.machine_type,
          price: data.price,
          duration: data.duration,
          branch_id: data.branch_id,
          machine_id: data.machine_id,
          machine_label: data.machine_label,
          currency_id: data.currency_id,
          state: data.state,
          date: data.date,
        }]
      ], (error, value) => {
        if (error) reject(error);
        else resolve(value);
      });
    });
    return response;
  } catch (error) {
    console.error('Error creating device history:', error);
    throw error;
  }
};

// Fungsi untuk menjalankan mesin dan mencatat riwayat
export const runMachine = async (machineId: number, branchId: number, statusWasher: string, statusDryer: string, historyData: any): Promise<any> => {
  try {
    // Jalankan mesin
    const machineResponse = await statusMachine(machineId, branchId, statusWasher, statusDryer);
    console.log('Machine status updated:', machineResponse);

    // Buat riwayat perangkat
    const historyResponse = await DeviceHistory(historyData);
    console.log('Device history created:', historyResponse);

    return {
      machineResponse,
      historyResponse,
    };
  } catch (error) {
    console.error('Error in runMachine:', error);
    throw error;
  }
};

// Fungsi untuk mengambil data utama
export const fetchMainPageData = async (branchId: number): Promise<any> => {
  try {
    const uid = await authenticate();
    if (uid) {
      // Ambil data mesin
      const machines = await fetchMachinesPrice(uid, branchId);
      // Ambil data promo
      const promoData = await fetchPromoData(uid, branchId);

      return {
        machines,
        promoData,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching main page data:', error);
    throw error;
  }
};

// Fungsi untuk mengambil produk berdasarkan branch
export const fetchProductsByBranch = async (branchId: number): Promise<any[]> => {
  try {
    const uid = await authenticate();
    if (uid) {
      const products = await fetchProducts(uid, branchId); // Assuming you have a function to fetch products
      console.log(products)
      return products;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const checkUserInOdoo = async (phoneNumber: string): Promise<{ partners: any; banned: boolean }> => {
  try {
    const uid = await authenticate();
    if (uid) {
      const partners = await searchPartner(uid, phoneNumber);
      console.log('tes', partners)
      if (partners.length > 0) {
        const isBanned = partners[0].is_ban === true;
        return { partners: partners[0], banned: isBanned };
      }
    }
    return { partners: null, banned: false };
  } catch (error) {
    console.error('Error checking user in Odoo:', JSON.stringify(error, null, 2));
    throw error;
  }
};

// Fungsi baru untuk mendaftarkan partner baru
export const registerUserInOdoo = async (phoneNumber: string): Promise<any> => {
  try {
    const uid = await authenticate();
    if (uid) {
      await regisPartner(uid, phoneNumber);
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error('Error registering user in Odoo:', error);
    throw error;
  }
};

// Fungsi baru untuk mengambil transaksi
export const fetchTransactions = async (phoneNumber: string): Promise<any[]> => {
  try {
    const { partners } = await checkUserInOdoo(phoneNumber);
    if (partners) {
      const uid = await authenticate();
      const transactions = await fetchTransactionsByPartnerId(uid, partners.id);
      console.log("tes", transactions)
      return transactions; // Kembalikan data transaksi
    }
    return []; // Kembalikan array kosong jika tidak ada partner
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Modifikasi bypassFetchTransactions untuk menerima branchId
export const bypassFetchTransactions = async (branchId?: number): Promise<any[]> => {
  try {
    const uid = await authenticate();
    const transactions = await fetchTransactionsBypass(uid, branchId);
    console.log("tes", transactions)
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const fetchEmployeesAndTechnicians = async (): Promise<{
  employees: any[];
}> => {
  try {
    const uid = await authenticate();
    if (uid) {
      const branchId = 6;

      // Ambil data karyawan dan teknisi
      const employees = await fetchEmployeesByBranch(uid, branchId);
      
      console.log('Employees count:', employees.length);
      
      // Log detail untuk debugging
      console.log('First few employees:', employees.slice(0, 5));

      return {
        employees
      };
    }
    return { 
      employees: []
    };
  } catch (error) {
    console.error('Error fetching employees and technicians:', error);
    throw error;
  }
};

export const fetchBypassAndTransactions = async (): Promise<{
  bypassReasons: any[];
  transactions: any[];
}> => {
  try {
    const uid = await authenticate();
    const branch_id = 6;
    if (uid) {
      // Ambil data alasan bypass dan transaksi
      const bypassReasons = await fetchBypassReasons(uid);
      const transactions = await bypassFetchTransactions(branch_id);

      return {
        bypassReasons,
        transactions,
      };
    }
    return { 
      bypassReasons: [], 
      transactions: [] 
    };
  } catch (error) {
    console.error('Error fetching bypass reasons and transactions:', error);
    throw error;
  }
};

// Fungsi gabungan jika masih diperlukan
export const fetchCrewData = async (): Promise<any> => {
  try {
    const employeesData = await fetchEmployeesAndTechnicians();
    const bypassData = await fetchBypassAndTransactions();

    return {
      ...employeesData,
      ...bypassData
    };
  } catch (error) {
    console.error('Error fetching crew data:', error);
    throw error;
  }
};

