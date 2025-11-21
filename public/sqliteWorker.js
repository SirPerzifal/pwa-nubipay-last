// public/sqliteWorker.js
importScripts('/sqlite3.js');

let db = null;
let sqlite3 = null;

// Inisialisasi SQLite
self.sqlite3InitModule({
  print: console.log,
  printErr: console.error,
}).then((sqlite3Module) => {
  sqlite3 = sqlite3Module;
  
  if (!sqlite3.opfs) {
    self.postMessage({ 
      type: 'error', 
      message: 'OPFS tidak didukung di browser ini' 
    });
    return;
  }

  try {
    db = new sqlite3.oo1.OpfsDb('/appdb.sqlite');
    
    // Buat tabel USER
    db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomor_telepon TEXT,
        fingerprint TEXT,
        saldo INTEGER
      );
    `);

    // Buat tabel TRANSAKSI

    db.exec(`
      CREATE TABLE IF NOT EXISTS transaksi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        jenis_transaksi TEXT,
        control_id_mesin TEXT,
        vend_mesin TEXT,
        topup_amount INTEGER,
        datetime TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);

    // console.log('Database initialized successfully');
    self.postMessage({ type: 'ready' });
  } catch (err) {
    console.error('Database initialization error:', err);
    self.postMessage({ 
      type: 'error', 
      message: err.message 
    });
  }
});

// Handle pesan dari main thread
self.onmessage = (e) => {
  const { type, sql, params, id } = e.data;
  
  if (!db) {
    self.postMessage({ 
      id, 
      type: 'error', 
      message: 'Database belum siap' 
    });
    return;
  }

  try {
    switch (type) {
      case 'exec':
        db.exec(sql);
        self.postMessage({ id, type: 'success' });
        break;

      case 'query':
        const result = [];
        db.exec({
          sql: sql,
          rowMode: 'object',
          callback: (row) => {
            result.push(row);
          }
        });
        self.postMessage({ id, type: 'result', data: result });
        break;

      case 'run':
        // Untuk INSERT/UPDATE/DELETE dengan lastInsertId
        db.exec(sql);
        const lastId = db.selectValue('SELECT last_insert_rowid()');
        self.postMessage({ 
          id, 
          type: 'success', 
          lastInsertId: lastId 
        });
        break;

      default:
        self.postMessage({ 
          id, 
          type: 'error', 
          message: 'Unknown command type' 
        });
    }
  } catch (error) {
    console.error('Query error:', error);
    self.postMessage({ 
      id, 
      type: 'error', 
      message: error.message 
    });
  }
};