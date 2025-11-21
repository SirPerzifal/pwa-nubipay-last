// Definisi tipe untuk Odoo
export interface OdooErrorData {
  name: string;
  debug: string;
  message: string;
}

export interface OdooError {
  code: number;
  message: string;
  data: OdooErrorData;
}

export interface OdooAuthResult {
  session_id: string;
  uid: number;
}

export interface OdooAuthResponse {
  jsonrpc: string;
  id: number;
  result: OdooAuthResult;
  error?: OdooError;
}

export interface OdooApiResponse<T> {
  jsonrpc: string;
  id: number;
  result: T;
  error?: OdooError;
}

// export Interface untuk model Branch
export interface BranchDataModel {
  id: number;
  name: string;
  [key: string]: number | string | boolean | null;
}

// export Interface untuk parameter kwargs
export interface OdooKwargs {
  fields?: string[];
  limit?: number;
  offset?: number;
  order?: string;
  context?: Record<string, unknown>;
  [key: string]: unknown;
}