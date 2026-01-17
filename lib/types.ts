export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  size: string;
  color: string;
  stock: number;
  sku: string;
  barcode: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  loyaltyPoints: number;
}

export interface Sale {
  id: string;
  timestamp: Date;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  tenderedAmount: number;
  changeAmount: number;
  status: string;
  paymentMethod: string;
  customerId?: string;
  customer?: Customer;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}
