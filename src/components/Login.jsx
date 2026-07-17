import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './Login.css';

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isRegister) {
        // 1. Firebase Authentication: Create User
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // 2. Send Verification Email
        await sendEmailVerification(user);

        // 3. Save Extra Details to Firestore Database
        await setDoc(doc(db, 'users', user.uid), {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          createdAt: new Date()
        });

        // Logout immediately so they can't access without verification
        await signOut(auth);

        setMessage({ 
          type: 'success', 
          text: 'Registration successful! A verification link has been sent to your email. Please verify before logging in.' 
        });
        
        // Switch to login tab
        setFormData({ name: '', phone: '', email: '', password: '' });
        setIsRegister(false);

      } else {
        // Login Logic
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Check if email is verified
        if (!user.emailVerified) {
          await signOut(auth);
          setMessage({ 
            type: 'error', 
            text: 'Please verify your email address first. Check your inbox/spam folder.' 
          });
        } else {
          setMessage({ type: 'success', text: 'Login successful! Welcome back.' });
          setTimeout(() => {
            if(onLoginSuccess) onLoginSuccess(user);
            onClose();
          }, 1500);
        }
      }
    } catch (error) {
      let errorMsg = 'An error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') errorMsg = 'This email is already registered.';
      if (error.code === 'auth/invalid-credential') errorMsg = 'Invalid email or password.';
      if (error.code === 'auth/weak-password') errorMsg = 'Password should be at least 6 characters.';
      
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <span className="brand-mark-small">A</span>
          <h2>{isRegister ? 'Join Amrutam' : 'Welcome Back'}</h2>
          <p>{isRegister ? 'Start your journey of purity.' : 'Login to access your premium orders.'}</p>
        </div>

        {message.text && (
          <div className={`message-box ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Min. 6 characters" />
          </div>

          <button type="submit" className="primary-btn auth-btn" disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Register & Send Verification' : 'Secure Login')}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button className="toggle-auth-btn" onClick={() => {
              setIsRegister(!isRegister);
              setMessage({ type: '', text: '' });
            }}>
              {isRegister ? 'Login Here' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;