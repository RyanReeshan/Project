import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem, Customer } from './types';

interface POSState {
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  currentDiscount: number;
  discountType: 'amount' | 'percentage';

  setProducts: (products: Product[]) => void;
  setCustomers: (customers: Customer[]) => void;
  addToCart: (product: Product) => void;
  addToCartByBarcode: (barcode: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (discount: number, type?: 'amount' | 'percentage') => void;
}

export const useStore = create<POSState>()(
  persist(
    (set, get) => ({
      products: [],
      customers: [],
      cart: [],
      currentDiscount: 0,
      discountType: 'amount',

      setProducts: (products) => set({ products }),
      setCustomers: (customers) => set({ customers }),

      addToCart: (product) => {
        const { cart } = get();
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            cart: cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ cart: [...cart, { ...product, quantity: 1 }] });
        }
      },

      addToCartByBarcode: (barcode) => {
        const { products, addToCart } = get();
        const product = products.find((p) => p.barcode === barcode || p.sku === barcode);
        if (product && product.stock > 0) {
          addToCart(product);
          return true;
        }
        return false;
      },

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),

      updateCartQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
          ).filter(item => item.quantity > 0),
        })),

      clearCart: () => set({ cart: [], currentDiscount: 0, discountType: 'amount' }),

      applyDiscount: (discount, type = 'amount') => set({ currentDiscount: discount, discountType: type }),
    }),
    {
      name: 'pos-storage',
      partialize: (state) => ({
        cart: state.cart,
        currentDiscount: state.currentDiscount,
        discountType: state.discountType
      }),
    }
  )
);
