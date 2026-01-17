'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  UserPlus,
  Tag,
  Barcode,
  Loader2
} from 'lucide-react';
import { Product, CartItem, Customer } from '@/lib/types';
import { getProducts, getCustomers, createSale, addCustomer } from '@/lib/actions';

export default function POSPage() {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    applyDiscount,
    currentDiscount,
    setProducts,
    setCustomers,
    customers,
    addToCartByBarcode
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    loadData();
    // Keep barcode input focused
    const focusInterval = setInterval(() => {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT') {
        barcodeInputRef.current?.focus();
      }
    }, 1000);
    return () => clearInterval(focusInterval);
  }, []);

  async function loadData() {
    setLoading(true);
    const [productsData, customersData] = await Promise.all([
      getProducts(),
      getCustomers()
    ]);
    setProducts(productsData as any);
    setCustomers(customersData as any);
    setLoading(false);
  }

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput) {
      const success = addToCartByBarcode(barcodeInput);
      if (!success) {
        // Optional: play error sound or show toast
      }
      setBarcodeInput('');
    }
  };

  const categories = ['All', 'T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Accessories', 'Shoes'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = currentDiscount;
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + tax;

  const handleCheckout = async () => {
    setCheckingOut(true);
    const saleData = {
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod,
      customerId: selectedCustomer || undefined
    };

    const result = await createSale(saleData);
    setCheckingOut(false);

    if (result.success) {
      clearCart();
      setIsCheckoutModalOpen(false);
      loadData(); // Reload to get updated stock
      alert('Transaction completed successfully!');
    } else {
      alert(result.error || 'Failed to complete transaction');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Barcode Hidden Input */}
      <form onSubmit={handleBarcodeSubmit} className="absolute opacity-0 pointer-events-none">
        <input
          ref={barcodeInputRef}
          type="text"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          autoFocus
        />
      </form>

      {/* Main Content - Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Categories and Search */}
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  disabled={product.stock <= 0}
                  onClick={() => addToCart(product)}
                  className={`flex flex-col text-left bg-white p-3 rounded-xl border border-slate-200 hover:shadow-md transition-all group ${
                    product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    <Barcode className="text-slate-300" size={48} />
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 border border-slate-100">
                      {product.sku}
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 truncate w-full">{product.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{product.category} • {product.size}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="font-bold text-blue-600">${product.price.toFixed(2)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {product.stock} left
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-10">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-slate-600" />
            <h2 className="font-bold text-lg">Current Cart</h2>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Clear Cart"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingCart size={32} />
              </div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="w-12 h-12 bg-slate-50 rounded flex-shrink-0 flex items-center justify-center">
                  <Barcode size={24} className="text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 truncate">{item.name}</h4>
                  <p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs text-red-500 hover:underline mt-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer & Discounts */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Guest Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.loyaltyPoints} pts)</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
              title="Add Customer"
            >
              <UserPlus size={18} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => applyDiscount(5)}
              className={`flex-1 py-1 px-2 rounded border text-xs font-medium transition-colors ${currentDiscount === 5 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              -$5 Off
            </button>
            <button
              onClick={() => applyDiscount(10)}
              className={`flex-1 py-1 px-2 rounded border text-xs font-medium transition-colors ${currentDiscount === 10 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              -$10 Off
            </button>
            <button
              onClick={() => applyDiscount(20)}
              className={`flex-1 py-1 px-2 rounded border text-xs font-medium transition-colors ${currentDiscount === 20 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              -$20 Off
            </button>
            <button
              onClick={() => {
                const val = prompt('Enter discount amount:');
                if (val) applyDiscount(parseFloat(val));
              }}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
              title="Custom Discount"
            >
              <Tag size={16} />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 bg-white border-t border-slate-200 space-y-3">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Discount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600 text-sm">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg mt-4 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Complete Payment</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-slate-500 mb-1">Total Amount Due</p>
                <p className="text-4xl font-black text-slate-900">${total.toFixed(2)}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'Cash'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <Banknote size={32} />
                    <span className="font-bold">Cash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'Card'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <CreditCard size={32} />
                    <span className="font-bold">Card</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold hover:bg-white transition-colors"
              >
                Back
              </button>
              <button
                disabled={checkingOut}
                onClick={handleCheckout}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                {checkingOut && <Loader2 size={18} className="animate-spin" />}
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Add New Customer</h2>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const result = await addCustomer({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
              });
              if (result.success) {
                loadData();
                setIsCustomerModalOpen(false);
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input name="name" type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input name="email" type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input name="phone" type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
