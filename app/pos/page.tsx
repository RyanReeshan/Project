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
  CheckCircle2,
  Barcode,
  Tag
} from 'lucide-react';
import { Category, Product } from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function POSPage() {
  const {
    products,
    cart,
    currentDiscount,
    addToCart,
    addToCartByBarcode,
    removeFromCart,
    updateCartQuantity,
    applyDiscount,
    completeSale
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef<HTMLInputElement>(null);

  const categories: string[] = ['All', 'T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Accessories', 'Shoes'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = currentDiscount;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08; // 8% tax
  const finalTotal = taxableAmount + tax;

  const handleCheckout = (paymentMethod: 'Cash' | 'Card') => {
    if (cart.length === 0) return;

    const sale = {
      items: [...cart],
      subtotal,
      tax,
      discount,
      total: finalTotal,
      paymentMethod,
    };

    completeSale(sale);
    setLastSale({ ...sale, timestamp: Date.now() });
    setShowReceipt(true);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput) {
      const success = addToCartByBarcode(barcodeInput);
      if (!success) {
        alert('Product not found or out of stock');
      }
      setBarcodeInput('');
    }
  };

  // Keep barcode input focused for rapid scanning
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.activeElement?.tagName !== 'INPUT' && barcodeRef.current) {
        barcodeRef.current.focus();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Hidden Barcode Input for Scanner */}
      <form onSubmit={handleBarcodeSubmit} className="absolute opacity-0 pointer-events-none">
        <input
          ref={barcodeRef}
          type="text"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          autoFocus
        />
      </form>
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg whitespace-nowrap transition-colors font-medium",
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left border border-transparent hover:border-blue-200 group relative"
            >
              <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400">
                <ShoppingCart size={32} />
              </div>
              <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
              <p className="text-xs text-slate-500 mb-2">{product.category}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
                <span className="text-xs text-slate-400">{product.stock} left</span>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-blue-600 text-white p-1 rounded-full">
                  <Plus size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" />
            Order
          </h2>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
            <Barcode size={12} />
            SCANNER ACTIVE
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-xl group">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-500">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex flex-col gap-2 py-2">
            <div className="flex justify-between items-center text-slate-600 text-sm">
              <span className="flex items-center gap-1">
                <Tag size={14} className="text-blue-600" />
                Discount
              </span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-red-600">-${discount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => applyDiscount(0)}
                className={cn(
                  "flex-1 py-1 text-[10px] font-bold rounded border transition-colors",
                  discount === 0 ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                )}
              >
                NONE
              </button>
              {[5, 10, 20].map((amt) => (
                <button
                  key={amt}
                  onClick={() => applyDiscount(amt)}
                  className={cn(
                    "flex-1 py-1 text-[10px] font-bold rounded border transition-colors",
                    discount === amt ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                  )}
                >
                  ${amt}
                </button>
              ))}
              <button
                onClick={() => {
                  const custom = prompt('Enter discount amount:');
                  if (custom && !isNaN(parseFloat(custom))) {
                    applyDiscount(parseFloat(custom));
                  }
                }}
                className={cn(
                  "flex-1 py-1 text-[10px] font-bold rounded border transition-colors",
                  ![0, 5, 10, 20].includes(discount) ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                )}
              >
                CUSTOM
              </button>
            </div>
          </div>

          <div className="flex justify-between text-slate-600 text-sm">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              disabled={cart.length === 0}
              onClick={() => handleCheckout('Cash')}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <Banknote className="text-green-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Cash</span>
            </button>
            <button
              disabled={cart.length === 0}
              onClick={() => handleCheckout('Card')}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-50"
            >
              <CreditCard />
              <span className="text-xs font-bold uppercase tracking-wider">Card</span>
            </button>
          </div>
        </div>
      </div>

      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-6">Transaction ID: {lastSale.id}</p>

            <div className="text-left border-y border-slate-100 py-4 mb-6">
              <div className="flex justify-between mb-2 font-medium">
                <span>Total Amount Paid</span>
                <span className="text-blue-600">${lastSale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Payment Method</span>
                <span>{lastSale.paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(false)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Next Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
