import { useStore } from '../lib/store';

describe('POS Store', () => {
  it('should initialize with products', () => {
    const { products } = useStore.getState();
    expect(products.length).toBeGreaterThan(0);
  });

  it('should add items to cart', () => {
    const { products, addToCart } = useStore.getState();
    const product = products[0];
    addToCart(product);
    const { cart } = useStore.getState();
    expect(cart.length).toBe(1);
    expect(cart[0].id).toBe(product.id);
  });

  it('should add item by barcode', () => {
    const { products, addToCartByBarcode } = useStore.getState();
    const product = products[0];
    const success = addToCartByBarcode(product.barcode);
    expect(success).toBe(true);
    const { cart } = useStore.getState();
    expect(cart.find(i => i.id === product.id)).toBeDefined();
  });

  it('should apply discount', () => {
    const { applyDiscount } = useStore.getState();
    applyDiscount(10);
    const { currentDiscount } = useStore.getState();
    expect(currentDiscount).toBe(10);
  });

  it('should clear cart after sale', () => {
    const { products, addToCart, completeSale } = useStore.getState();
    const product = products[0];
    addToCart(product);

    const cartBefore = useStore.getState().cart;
    completeSale({
      items: cartBefore,
      subtotal: 100,
      tax: 8,
      discount: 0,
      total: 108,
      paymentMethod: 'Cash'
    });

    const { cart, sales } = useStore.getState();
    expect(cart.length).toBe(0);
    expect(sales.length).toBe(1);
  });
});
