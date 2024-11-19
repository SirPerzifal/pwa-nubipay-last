// src/types/odoo-xmlrpc.d.ts
declare module 'odoo-xmlrpc' {
    interface OdooConfig {
      db: string;
      username: string;
      password: string;
    }
  
    class Odoo {
      constructor(config: OdooConfig);
      
      connect(callback: (err: Error | null, uid: number) => void): void;
      
      execute_kw(
        params: {
          model: string;
          method: string;
          args: any[];
          params?: any;
        },
        callback: (err: Error | null, result: any) => void
      ): void;
    }
  
    export default Odoo;
  }