export type Category = 'T-Shirts' | 'Jeans' | 'Dresses' | 'Jackets' | 'Accessories' | 'Shoes';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  size: string;
  color: string;
  stock: number;
  sku: string;
  barcode: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  timestamp: number;
  customerId?: string;
  paymentMethod: 'Cash' | 'Card' | 'Other';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
}
