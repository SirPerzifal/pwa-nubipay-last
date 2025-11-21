// src/db/actions.js

export class DBActions {
  constructor(dbHook) {
    this.query = dbHook.query;
    this.run = dbHook.run;
    this.exec = dbHook.exec;
  }

  // ============= USER ACTIONS =============
  
  async addUser(nomor_telepon, saldo = 0, fingerprint = null) {
    try {
      const fingerprintValue = fingerprint ? `'${fingerprint}'` : 'NULL';
      const result = await this.run(`
        INSERT INTO user (nomor_telepon, saldo, fingerprint)
        VALUES ('${nomor_telepon}', ${saldo}, ${fingerprintValue})
      `);
      
      return {
        success: true,
        message: 'berhasil_menambahkan_user',
        userId: result.lastInsertId
      };
    } catch (e) {
      console.error('Error adding user:', e);
      return {
        success: false,
        message: 'gagal',
        error: e.message
      };
    }
  }

  async getUser(nomorTelepon) {
    try {
      const result = await this.query(`
        SELECT * FROM user WHERE nomor_telepon = '${nomorTelepon}'
      `);

      if (result.length === 0) return null;

      return result[0]; // Return object langsung karena rowMode: 'object'
    } catch (e) {
      console.error('Error getting user:', e);
      return null;
    }
  }

  async getUserById(userId) {
    try {
      const result = await this.query(`
        SELECT * FROM user WHERE id = ${userId}
      `);

      if (result.length === 0) return null;
      return result[0];
    } catch (e) {
      console.error('Error getting user by id:', e);
      return null;
    }
  }

  async getAllUsers() {
    try {
      const result = await this.query('SELECT * FROM user');
      return result;
    } catch (e) {
      console.error('Error getting all users:', e);
      return [];
    }
  }

  async updateSaldo(userId, saldoBaru) {
    try {
      await this.run(`
        UPDATE user SET saldo = ${saldoBaru}
        WHERE id = ${userId}
      `);
      
      return {
        success: true,
        message: 'berhasil_update_saldo'
      };
    } catch (e) {
      console.error('Error updating saldo:', e);
      return {
        success: false,
        message: 'gagal_update_saldo',
        error: e.message
      };
    }
  }

  async updateFingerprint(userId, fingerprintBaru) {
    try {
      await this.run(`
        UPDATE user SET fingerprint = '${fingerprintBaru}'
        WHERE id = ${userId}
      `);
      
      return {
        success: true,
        message: 'berhasil_update_fingerprint'
      };
    } catch (e) {
      console.error('Error updating fingerprint:', e);
      return {
        success: false,
        message: 'gagal_update_fingerprint',
        error: e.message
      };
    }
  }

  // ============= TRANSAKSI ACTIONS =============
  async addTransaksi(userId, jenis, controlId, vend, topup, datetime) {
    try {
      const sql = `
        INSERT INTO transaksi 
        (user_id, jenis_transaksi, control_id_mesin, vend_mesin, topup_amount, datetime)
        VALUES 
        ('${userId}', '${jenis}', '${controlId}', '${vend}', ${topup}, '${datetime}')
      `;

      const result = await this.run(sql);

      return {
        success: true,
        message: 'berhasil_menambahkan_transaksi',
        transaksiId: result.lastInsertId
      };
    } catch (e) {
      console.error("Error adding transaksi:", e);
      return {
        success: false,
        message: "gagal_menambahkan_transaksi",
        error: e.message
      };
    }
  }

  async getTransaksi(limit = null) {
    try {
      const limitClause = limit ? `LIMIT ${limit}` : '';
      const result = await this.query(`
        SELECT * FROM transaksi 
        ORDER BY id DESC 
        ${limitClause}
      `);
      
      return result;
    } catch (e) {
      console.error('Error getting transaksi:', e);
      return [];
    }
  }

  async getTransaksiByJenis(jenis) {
    try {
      const result = await this.query(`
        SELECT * FROM transaksi 
        WHERE jenis_transaksi = '${jenis}'
        ORDER BY id DESC
      `);
      
      return result;
    } catch (e) {
      console.error('Error getting transaksi by jenis:', e);
      return [];
    }
  }

  async getTotalTopup() {
    try {
      const result = await this.query(`
        SELECT SUM(topup_amount) as total 
        FROM transaksi 
        WHERE jenis_transaksi = 'topup'
      `);
      
      return result[0]?.total || 0;
    } catch (e) {
      console.error('Error getting total topup:', e);
      return 0;
    }
  }
}