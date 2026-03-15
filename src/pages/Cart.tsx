import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gps, setGps] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.phone) setPhone(data.phone);
            if (data.address) setAddress(data.address);
            if (data.gps) setGps(data.gps);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps(`${position.coords.latitude}, ${position.coords.longitude}`);
          setIsLocating(false);
          toast.success('Location acquired!');
        },
        (error) => {
          setIsLocating(false);
          toast.error('Failed to get location. Please enter manually.');
        }
      );
    } else {
      setIsLocating(false);
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !address) {
      toast.error('Please fill in your phone number and address.');
      return;
    }

    setIsSubmitting(true);
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    try {
      // Save user details if logged in
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            phone,
            address,
            gps
          });
        } catch (error) {
          console.error("Error updating user profile:", error);
        }
      }

      // Construct WhatsApp message
      let message = `*New Order: ${orderId}*\n\n*Items:*\n`;
      items.forEach(item => {
        message += `- ${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}\n`;
      });
      message += `\n*Total:* ₹${(totalPrice * 1.08).toFixed(2)} (incl. tax)\n\n*Customer Details:*\nPhone: ${phone}\nAddress: ${address}\nGPS: ${gps || 'Not provided'}`;
      
      const waLink = `https://wa.me/919241762133?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp using a hidden anchor tag
      try {
        const link = document.createElement('a');
        link.href = waLink;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (waError) {
        console.error('Failed to open WhatsApp window:', waError);
        toast.error('Could not open WhatsApp automatically. Please contact us.');
      }
      
      // Clear cart and redirect
      clearCart();
      toast.success('Redirecting to WhatsApp...');
      navigate('/');
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="inline-block bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium py-2 px-6 rounded-full transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm h-fit">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Shopping Cart</h1>
          
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded overflow-hidden mr-6 mb-4 sm:mb-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-2 mb-1">{item.name}</h3>
                  <p className="text-xl font-bold text-gray-900 mb-4">₹{item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-1 font-medium text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary & Checkout */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-3 text-sm text-gray-600 mb-6 border-b pb-6">
            <div className="flex justify-between">
              <span>Items ({totalItems}):</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & handling:</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Total before tax:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated tax (8%):</span>
              <span>₹{(totalPrice * 0.08).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
            <span>Order total:</span>
            <span>₹{(totalPrice * 1.08).toFixed(2)}</span>
          </div>
          
          {!isCheckingOut ? (
            <button 
              onClick={() => setIsCheckingOut(true)}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-full transition-colors shadow-sm"
            >
              Proceed to Checkout
            </button>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-bold text-gray-900">Delivery Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  maxLength={19}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., 9876543210"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                <textarea 
                  maxLength={499}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={3}
                  placeholder="Full address with landmark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPS Location (Optional)</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    maxLength={99}
                    value={gps}
                    onChange={(e) => setGps(e.target.value)}
                    className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    placeholder="Latitude, Longitude"
                  />
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md border border-gray-300 flex items-center transition-colors disabled:opacity-50"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    {isLocating ? 'Locating...' : 'Get'}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-full transition-colors shadow-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? 'Processing...' : 'Place Order via WhatsApp'}
              </button>
              <button 
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-full border border-gray-300 transition-colors shadow-sm"
              >
                Back to Cart
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
