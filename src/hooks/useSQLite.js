// src/hooks/useSQLite.js
import { useEffect, useState, useCallback, useRef } from 'react';

export function useSQLite() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const pendingRequests = useRef(new Map());
  const requestId = useRef(0);

  useEffect(() => {
    // Inisialisasi worker
    workerRef.current = new Worker('/sqliteWorker.js');

    workerRef.current.onmessage = (e) => {
      const { type, id, data, message, lastInsertId } = e.data;

      if (type === 'ready') {
        // console.log('✅ SQLite Database ready!');
        setIsReady(true);
      } else if (type === 'error' && !id) {
        console.error('❌ SQLite Error:', message);
        setError(message);
      } else if (id && pendingRequests.current.has(id)) {
        const { resolve, reject } = pendingRequests.current.get(id);
        pendingRequests.current.delete(id);

        if (type === 'error') {
          reject(new Error(message));
        } else if (type === 'result') {
          resolve(data);
        } else if (type === 'success') {
          resolve({ success: true, lastInsertId });
        }
      }
    };

    workerRef.current.onerror = (err) => {
      console.error('Worker error:', err);
      setError(err.message);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Execute SQL tanpa return data (CREATE, DROP, dll)
  const exec = useCallback((sql) => {
    if (!workerRef.current) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    return new Promise((resolve, reject) => {
      const id = ++requestId.current;
      pendingRequests.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ type: 'exec', sql, id });
    });
  }, []);

  // Query dengan return data (SELECT)
  const query = useCallback((sql) => {
    if (!workerRef.current) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    return new Promise((resolve, reject) => {
      const id = ++requestId.current;
      pendingRequests.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ type: 'query', sql, id });
    });
  }, []);

  // Run SQL dengan lastInsertId (INSERT, UPDATE, DELETE)
  const run = useCallback((sql) => {
    if (!workerRef.current) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    return new Promise((resolve, reject) => {
      const id = ++requestId.current;
      pendingRequests.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ type: 'run', sql, id });
    });
  }, []);

  return { isReady, error, exec, query, run };
}