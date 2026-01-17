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

  it('should clear cart after sale', () => {
    const { products, addToCart, completeSale } = useStore.getState();
    const product = products[0];
    addToCart(product);

    const cartBefore = useStore.getState().cart;
    completeSale({
      items: cartBefore,
      total: 100,
      paymentMethod: 'Cash'
    });

    const { cart, sales } = useStore.getState();
    expect(cart.length).toBe(0);
    expect(sales.length).toBe(1);
  });
});
