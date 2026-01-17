import { useStore } from '../lib/store';

describe('POS Store', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    category: 'T-Shirts' as any,
    price: 10,
    size: 'M',
    color: 'Red',
    stock: 10,
    sku: 'SKU-1',
    barcode: '123'
  };

  beforeEach(() => {
    useStore.getState().clearCart();
    useStore.getState().setProducts([mockProduct]);
  });

  it('should initialize with products after setting them', () => {
    const { products } = useStore.getState();
    expect(products.length).toBeGreaterThan(0);
  });

  it('should add items to cart', () => {
    const { addToCart } = useStore.getState();
    addToCart(mockProduct);

    const { cart } = useStore.getState();
    expect(cart.length).toBe(1);
    expect(cart[0].id).toBe(mockProduct.id);
  });

  it('should add item by barcode', () => {
    const { addToCartByBarcode } = useStore.getState();
    const success = addToCartByBarcode(mockProduct.barcode);
    expect(success).toBe(true);

    const { cart } = useStore.getState();
    expect(cart.find(i => i.id === mockProduct.id)).toBeDefined();
  });

  it('should apply discount', () => {
    const { applyDiscount } = useStore.getState();
    applyDiscount(10);
    expect(useStore.getState().currentDiscount).toBe(10);
  });
});
