import * as xmlrpc from 'xmlrpc';

const db = 'os_np_16';
const username = 'admin';
const password = '$g33d3@y0D';

const authenticate = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const client = xmlrpc.createClient({ url: `/xmlrpc/2/common`, headers: { 'Access-Control-Allow-Origin': '*' } });
    client.methodCall('authenticate', [db, username, password, {}], (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};

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
    console.error('Error checking user in Odoo:', error);
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
      const branchId = 7;

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
    const branch_id = 7;
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