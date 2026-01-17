import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Sale, Customer, CartItem } from './types';

interface POSState {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  cart: CartItem[];

  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, quantity: number) => void;

  // Cart actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Sale actions
  completeSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void;

  // Customer actions
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
}

const initialProducts: Product[] = [
  { id: '1', name: 'Classic White T-Shirt', category: 'T-Shirts', price: 19.99, size: 'M', color: 'White', stock: 50, sku: 'TS-001' },
  { id: '2', name: 'Slim Fit Blue Jeans', category: 'Jeans', price: 49.99, size: '32', color: 'Blue', stock: 30, sku: 'JN-001' },
  { id: '3', name: 'Floral Summer Dress', category: 'Dresses', price: 34.99, size: 'S', color: 'Floral', stock: 20, sku: 'DR-001' },
  { id: '4', name: 'Leather Biker Jacket', category: 'Jackets', price: 89.99, size: 'L', color: 'Black', stock: 10, sku: 'JK-001' },
  { id: '5', name: 'Canvas Sneakers', category: 'Shoes', price: 29.99, size: '42', color: 'Grey', stock: 15, sku: 'SH-001' },
];

export const useStore = create<POSState>()(
  persist(
    (set) => ({
      products: initialProducts,
      sales: [],
      customers: [],
      cart: [],

      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (product) => set((state) => ({
        products: state.products.map((p) => (p.id === product.id ? product : p)),
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      })),
      updateStock: (productId, quantity) => set((state) => ({
        products: state.products.map((p) =>
          p.id === productId ? { ...p, stock: p.stock - quantity } : p
        ),
      })),

      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find((item) => item.id === product.id);
        if (existingItem) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== productId),
      })),
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ).filter(item => item.quantity > 0),
      })),
      clearCart: () => set({ cart: [] }),

      completeSale: (saleData) => set((state) => {
        const newSale: Sale = {
          ...saleData,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };

        // Update stock for each item in the sale
        const updatedProducts = state.products.map((p) => {
          const cartItem = saleData.items.find((item) => item.id === p.id);
          if (cartItem) {
            return { ...p, stock: p.stock - cartItem.quantity };
          }
          return p;
        });

        return {
          sales: [newSale, ...state.sales],
          products: updatedProducts,
          cart: [],
        };
      }),

      addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (customer) => set((state) => ({
        customers: state.customers.map((c) => (c.id === customer.id ? customer : c)),
      })),
    }),
    {
      name: 'pos-storage',
    }
  )
);
