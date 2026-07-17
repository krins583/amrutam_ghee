import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Cart.css';

const Cart = ({ isOpen, onClose, user, cartCount, price, selectedSize, onCheckoutSuccess }) => {
  const [address, setAddress] = useState({ street: '', city: '', pincode: '' });
  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('GPay');
  const [loading, setLoading] = useState(false);

  // Fetch saved address when cart opens
  useEffect(() => {
    if (isOpen && user) {
      const fetchAddress = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().address) {
          setAddress(docSnap.data().address);
          setIsEditingAddress(false); // Address mil gaya toh form chhupa do
        } else {
          setIsEditingAddress(true);
        }
      };
      fetchAddress();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const totalAmount = cartCount * price;

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const saveAddress = async () => {
    if (!address.street || !address.city || !address.pincode) {
      return; // Agar details adhoori hain toh save mat karo
    }
    setLoading(true);
    try {
      // { merge: true } taaki purana data (jaise name, phone) delete na ho
      await setDoc(doc(db, 'users', user.uid), { address }, { merge: true });
      setIsEditingAddress(false);
    } catch (error) {
      console.error("Error saving address:", error);
    }
    setLoading(false);
  };

  const handleCheckout = () => {
    if (isEditingAddress) {
      alert("Please save your address first!"); // Fallback if they click directly
      return;
    }
    // Mock Checkout - Calls function in App.jsx to show Premium Dialog
    onCheckoutSuccess(paymentMethod, totalAmount);
  };

  return (
    <div className="cart-overlay">
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose} style={{ position: 'relative', top: 0, right: 0 }}>&times;</button>
        </div>

        <div className="cart-body">
          {cartCount === 0 ? (
            <p className="empty-cart">Your cart is feeling a bit light. Add some golden goodness!</p>
          ) : (
            <>
              {/* Items Section */}
              <div className="cart-item">
                <img src="./6.jpeg" alt="Amrutam Ghee" />
                <div className="cart-item-details">
                  <h4>Amrutam A2 Bilona Ghee</h4>
                  <p>{selectedSize} × {cartCount}</p>
                  <p style={{ color: '#cca03c', marginTop: '4px' }}>₹{(price).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="cart-section">
                <h3>Delivery Address 
                  {!isEditingAddress && (
                    <button className="edit-btn" onClick={() => setIsEditingAddress(true)}>Edit</button>
                  )}
                </h3>
                
                {isEditingAddress ? (
                  <div className="auth-form">
                    <div className="input-group">
                      <input type="text" name="street" value={address.street} onChange={handleAddressChange} placeholder="Flat/House No., Street Name" required />
                    </div>
                    <div className="input-group">
                      <input type="text" name="city" value={address.city} onChange={handleAddressChange} placeholder="City & State" required />
                    </div>
                    <div className="input-group">
                      <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="Pincode" maxLength="6" required />
                    </div>
                    <button className="primary-btn" onClick={saveAddress} disabled={loading || !address.street || !address.city || !address.pincode}>
                      {loading ? 'Saving...' : 'Save & Continue'}
                    </button>
                  </div>
                ) : (
                  <div className="saved-address-card">
                    <strong>Saved Location:</strong><br />
                    {address.street},<br />
                    {address.city} - {address.pincode}
                  </div>
                )}
              </div>

              {/* Payment Section */}
              <div className="cart-section">
                <h3>Payment Method (Test Mode)</h3>
                <div className="payment-grid">
                  {['GPay', 'PhonePe', 'Paytm', 'Cash on Delivery'].map((method) => (
                    <button 
                      key={method}
                      className={`payment-btn ${paymentMethod === method ? 'active' : ''}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {cartCount > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total Amount:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <button 
              className="primary-btn place-order-btn shine-hover" 
              onClick={handleCheckout}
              disabled={isEditingAddress}
            >
              Place Order Securely
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;