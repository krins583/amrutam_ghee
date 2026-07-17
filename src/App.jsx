import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { auth, db } from './firebase'; // db import kiya
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions import kiye
import Login from './components/Login';
import './App.css';

const benefits = [
  { value: 'A2', label: 'Gir cow milk' },
  { value: '30+', label: 'slow churn hours' },
  { value: '0%', label: 'preservatives' },
  { value: '4.9', label: 'customer rating' },
];

const process = [
  'Fresh curd is set from A2 milk',
  'Hand-churned with the Bilona method',
  'Slow-cooked until golden and aromatic',
  'Packed in small batches for freshness',
];

const slideshowImages = [
  './s1.jpeg',
  './s2.jpeg',
  './s3.jpeg',
  './s4.jpeg',
  './s5.jpeg',
];

/* ---------- Shared motion presets ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } },
};

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const Reveal = ({ as = 'div', className, children, variants = fadeUp, ...rest }) => {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={variants}
      {...rest}
    >
      {children}
    </Comp>
  );
};

const App = () => {
  const heroRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  
  // Dynamic Pricing States
  const [selectedSize, setSelectedSize] = useState('1kg');
  const [price, setPrice] = useState(1900);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auth States
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(''); // User ka naam store karne ke liye state

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroBgY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Track Authentication Status & Fetch User Name
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
        
        // Firestore se user ka naam nikalein
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name);
          } else {
            setUserName('User'); // Agar naam na mile toh 'User' dikhaye
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
          setUserName('User');
        }
        
      } else {
        setUser(null);
        setUserName('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    if (size === '500gm') {
      setPrice(950);
    } else if (size === '1kg') {
      setPrice(1900);
    }
  };

  // Secure Checkout/Inquiry Function
  const handleCheckout = (e) => {
    e.preventDefault();
    if (!user) {
      setShowLogin(true);
    } else {
      alert(`Thank you for your inquiry, ${userName.split(' ')[0]}! We will contact you soon for your order of ${selectedSize} Amrutam Ghee.`);
    }
  };

  // Logout with Confirmation
  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      await signOut(auth);
      alert('Logged out successfully');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setShowStickyCta(y > window.innerHeight * 0.9);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className="site-shell">
      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
        <a className="brand" href="#home" aria-label="Amrutam home">
          <span className="brand-mark">A</span>
          <span>AMRUTAM</span>
        </a>
        <div className="nav-links" aria-label="Primary navigation">
          <a href="#story">Story</a>
          <a href="#process">Process</a>
          <a href="#benefits">Benefits</a>
          <a href="#shop">Shop</a>
        </div>
        
        {/* Dynamic Nav Button: Shows 'Hi, [Name]' when logged in */}
        {user ? (
          <button 
            className="ghost-btn shine-hover" 
            style={{minHeight: '38px', padding: '0 16px', fontSize: '0.85rem', textTransform: 'capitalize'}} 
            onClick={handleLogout}
            title="Click to logout"
          >
            Hi, {userName ? userName.split(' ')[0] : 'User'}
          </button>
        ) : (
          <button className="nav-cta" onClick={() => setShowLogin(true)}>Login / Buy</button>
        )}
      </nav>

      <section id="home" className="hero-section" ref={heroRef}>
        <motion.div className="hero-bg" style={{ y: heroBgY }} />
        <div className="gold-orbit gold-orbit-one" />
        <div className="gold-orbit gold-orbit-two" />
        <div className="hero-grain" />

        <motion.div
          className="hero-content"
          style={{ y: heroContentY, opacity: heroContentOpacity }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <span className="eyebrow shimmer-text">Small batch A2 Bilona Ghee</span>
          <h1>Golden purity, crafted like a ritual.</h1>
          <p className="hero-copy">
            Amrutam brings slow-churned Gir cow ghee with a rich aroma,
            grainy texture, and the warmth of traditional Indian kitchens.
          </p>
          <div className="hero-actions">
            <button className="primary-btn shine-hover" onClick={handleCheckout}>
              <span>Order Pure Ghee</span>
            </button>
            <a className="ghost-btn" href="#process">See Process</a>
          </div>
          <div className="hero-microproof">
            <span>★★★★★</span>
            <span>4.9 from 2,400+ families</span>
          </div>
        </motion.div>

        <motion.div
          className="hero-product"
          style={{ y: heroImageY }}
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        >
          <div className="product-halo" />
          <div className="relative w-full aspect-[4/5] rounded-[34px] overflow-hidden border-8 border-white/70 shadow-[0_24px_70px_rgba(83,54,11,0.18)]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={slideshowImages[currentSlide]}
                alt="Amrutam Premium Ghee Showcase"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </AnimatePresence>
          </div>
          <div className="floating-badge badge-top">Vedic Bilona</div>
          <div className="floating-badge badge-bottom">Lab Tested</div>
        </motion.div>
      </section>

      <motion.section
        className="stats-strip"
        aria-label="Product highlights"
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        {benefits.map((item) => (
          <motion.div className="stat-card" key={item.label} variants={staggerChild}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </motion.div>
        ))}
      </motion.section>

      <section id="story" className="split-section">
        <Reveal className="image-stack" variants={fadeIn}>
          <img className="stack-main" src="./5.jpeg" alt="Traditional ghee ingredients" />
          <motion.img
            className="stack-mini"
            src="./2.jpeg"
            alt="Amrutam Jar"
            initial={{ opacity: 0, x: 24, y: 24 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          />
        </Reveal>
        <Reveal as="div" className="section-copy">
          <p className="eyebrow">From pasture to pooja thali</p>
          <h2>Premium ghee that feels rich before you even taste it.</h2>
          <p>
            Every jar is made for homes that care about purity, flavour, and
            trust. The golden colour, nutty fragrance, and smooth mouthfeel come
            from patient cooking, not shortcuts.
          </p>
          <motion.div
            className="feature-grid"
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.span variants={staggerChild}>Free-grazing Gir cows</motion.span>
            <motion.span variants={staggerChild}>Wooden churned makhan</motion.span>
            <motion.span variants={staggerChild}>No artificial colour</motion.span>
            <motion.span variants={staggerChild}>Deep roasted aroma</motion.span>
          </motion.div>
        </Reveal>
      </section>

      <section id="process" className="process-section">
        <Reveal className="section-heading">
          <p className="eyebrow">The slow method</p>
          <h2>Bilona process, refined for a premium experience.</h2>
        </Reveal>
        <motion.div
          className="process-grid"
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {process.map((step, index) => (
            <motion.article className="process-card" key={step} variants={staggerChild}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step}</h3>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section id="shop" className="shop-section">
        <Reveal className="product-gallery" variants={fadeIn}>
          <img className="gallery-large" src="./6.jpeg" alt="Amrutam ghee closeup" />
          <div className="gallery-row">
            <img src="./1.jpeg" alt="Health benefits of ghee" />
            <img src="./4.jpeg" alt="Ghee wellness benefits" />
          </div>
        </Reveal>

        <Reveal as="div" className="shop-panel" variants={fadeUp}>
          <p className="tag">Best Seller</p>
          <h2>Amrutam A2 Bilona Cow Ghee</h2>
          <p className="rating">★★★★★ 4.9 rating · 2,400+ happy families</p>
          <p className="product-copy">
            Dense, aromatic and naturally golden. Perfect for rotis, dal,
            sweets, coffee, fasting food, and daily wellness rituals.
          </p>
          <div className="price-row">
            <strong>₹{price.toLocaleString('en-IN')}</strong>
            <span>₹{(price * 1.25).toLocaleString('en-IN')}</span>
            <small>Save 20%</small>
          </div>
          
          <div className="size-row" aria-label="Choose size">
            <button 
              type="button" 
              className={selectedSize === '1kg' ? 'active' : ''} 
              onClick={() => handleSizeChange('1kg')}
            >
              1kg
            </button>
            <button 
              type="button" 
              className={selectedSize === '500gm' ? 'active' : ''} 
              onClick={() => handleSizeChange('500gm')}
            >
              500gm
            </button>
          </div>

          <div className="checkout-row">
            <button type="button" className="primary-btn shine-hover" onClick={handleCheckout}>
              Send Inquiry
            </button>
          </div>
          <div className="trust-line">
            <span>Free delivery</span>
            <span>Secure checkout</span>
            <span>Fresh batch</span>
          </div>
        </Reveal>
      </section>

      <section id="benefits" className="benefits-section">
        <Reveal as="div" className="benefit-copy">
          <p className="eyebrow">Daily spoon, deeper nourishment</p>
          <h2>Made for taste, digestion, strength, and glow.</h2>
          <p>
            Bring a luxurious finish to everyday food while supporting a clean,
            traditional lifestyle your family can trust.
          </p>
        </Reveal>
        <Reveal className="benefit-visual" variants={fadeIn}>
          <img src="./3.jpeg" alt="Spoon pouring golden ghee" />
          <motion.div
            className="shine-card"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <strong>100% Pure</strong>
            <span>No additives. No shortcuts.</span>
          </motion.div>
        </Reveal>
      </section>

      <Reveal as="footer" className="footer" variants={fadeIn}>
        <div>
          <h2>AMRUTAM</h2>
          <p>Pure A2 Gir Cow Bilona Ghee, made with patience and tradition.</p>
        </div>
        <button className="primary-btn shine-hover" onClick={handleCheckout}>Order Your Jar</button>
      </Reveal>

      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            className="sticky-cta"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="sticky-cta-info">
              <img src="./6.jpeg" alt="" aria-hidden="true" />
              <div>
                <strong>Amrutam A2 Bilona Ghee</strong>
                <span>₹{price.toLocaleString('en-IN')} · {selectedSize}</span>
              </div>
            </div>
            <button className="primary-btn shine-hover" onClick={handleCheckout}>Buy Now</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Login Modal */}
      <Login 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} 
      />
    </main>
  );
};

export default App;