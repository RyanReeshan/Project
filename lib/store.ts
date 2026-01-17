import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Sale, Customer, CartItem } from './types';

interface POSState {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  cart: CartItem[];
  currentDiscount: number; // Flat amount discount

  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, quantity: number) => void;

  // Cart actions
  addToCart: (product: Product) => void;
  addToCartByBarcode: (barcode: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  applyDiscount: (amount: number) => void;
  clearCart: () => void;

  // Sale actions
  completeSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void;

  // Customer actions
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  setProducts: (products: Product[]) => void;
  setSales: (sales: Sale[]) => void;
  setCustomers: (customers: Customer[]) => void;
}

export const useStore = create<POSState>()(
  persist(
    (set, get) => ({
      products: [],
      sales: [],
      customers: [],
      cart: [],
      currentDiscount: 0,

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
      addToCartByBarcode: (barcode) => {
        const product = get().products.find(p => p.barcode === barcode);
        if (product && product.stock > 0) {
          get().addToCart(product);
          return true;
        }
        return false;
      },
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== productId),
      })),
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ).filter(item => item.quantity > 0),
      })),
      applyDiscount: (amount) => set({ currentDiscount: amount }),
      clearCart: () => set({ cart: [], currentDiscount: 0 }),

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
      setProducts: (products) => set({ products }),
      setSales: (sales) => set({ sales }),
      setCustomers: (customers) => set({ customers }),
    }),
    {
      name: 'pos-storage',
      partialize: (state) => ({
        cart: state.cart,
        currentDiscount: state.currentDiscount
      }),
    }
  )
);
