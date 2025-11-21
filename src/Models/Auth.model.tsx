export interface ModalProps {
    isModalHelpOpen: boolean;
    toggleModal: () => void;
    animationClass: string; // Tambahkan prop untuk animasi
}

export interface OdooPartner {
    id: number;
    name: string;
    phone: string;
    branch_id: [number, string] | false;
    state: string;
    is_ban: boolean;
    is_otp_whatsapp: boolean;
    total_deposit: number;
    city: string;
    street: string;
    street2: string;
    state_id: [number, string] | false;
    country_id: [number, string] | false;
}

export interface ModalSKProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface ModalSuspendProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface Partner {
    id: number; // Ganti dengan tipe yang sesuai
    name: string; // Ganti dengan tipe yang sesuai
    phone: string; // Ganti dengan tipe yang sesuai
}

export interface EmployeeByBranch {
    id: number;
    name: string;
    branch_id: number;
    work_phone: string;
    mobile_phone: string;
}

export interface BypassReason {
    id: number;
    name: string;
}

// Misalkan ini adalah tipe yang Anda miliki

export interface transactionForBypass {
    date_order: string;
    branch_id: false | [number, string]; // Tipe yang diharapkan
    machine_type_custom: string;
    machine_display_name: string;
    price: number;
    partner_id: false | [number, string]; // Tipe yang diharapkan  
}

export interface Transaction {
    date_order: string;
    branch_id: [number, string] | false;
    machine_type_custom: string;
    machine_display_name: string;
    price: number;
    partner_id: [number, string] | false;
}

export interface MappedTransaction {
    date_order: string;
    outlet: string;
    partner_id: false | [number, string];
    machine_type_custom: string;
    machine_display_name: string;
    price: number;
    branch_id: false | [number, string]; // Tambahkan branch_id di sini
}

export interface ButtonInfo {
    name: string;
    mobilePhone: string;
    workPhone: string;  
}

export interface fullDataBypass {
    alasan: string | null;
    transaksi: Transaction; // Pastikan ini sesuai dengan tipe yang Anda gunakan
    namaPemilih: string | null; // Pastikan ini sesuai
    mobile_phone: string | null; // Pastikan ini sesuai
    work_phone: string | null; // Pastikan ini sesuai
}