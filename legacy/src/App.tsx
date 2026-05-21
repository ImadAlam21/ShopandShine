import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  Heart, 
  Search, 
  User, 
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
  ShieldCheck,
  Truck,
  RotateCcw,
  LogOut,
  Plus,
  Minus,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { supabase, signInWithGoogle, signOut } from "./supabase";

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Diamond Solitaire Ring", price: 45000, category: "Rings", description: "A timeless 18k white gold ring with a brilliant-cut diamond.", image: "https://picsum.photos/seed/ring1/800/1000" },
  { id: 2, name: "Gold Chain Necklace", price: 28000, category: "Necklaces", description: "Elegant 22k gold chain with a minimalist design.", image: "https://picsum.photos/seed/necklace1/800/1000" },
  { id: 3, name: "Pearl Drop Earrings", price: 15000, category: "Earrings", description: "Classic freshwater pearls with silver hooks.", image: "https://picsum.photos/seed/earrings1/800/1000" },
  { id: 4, name: "Emerald Tennis Bracelet", price: 62000, category: "Bracelets", description: "Stunning emeralds set in a flexible gold band.", image: "https://picsum.photos/seed/bracelet1/800/1000" },
  { id: 5, name: "Rose Gold Band", price: 12000, category: "Rings", description: "Simple and modern rose gold wedding band.", image: "https://picsum.photos/seed/ring2/800/1000" },
  { id: 6, name: "Sapphire Pendant", price: 35000, category: "Necklaces", description: "Deep blue sapphire encased in a diamond halo.", image: "https://picsum.photos/seed/pendant1/800/1000" },
];

export default function App() {
  return (
    <BrowserRouter>
      <ShopAndShine />
    </BrowserRouter>
  );
}

function ShopAndShine() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
    setIsCartOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // Fetch Products
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // Supabase Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePayment = async () => {
    if (cart.length === 0) return;
    if (!user) {
      alert("Please sign in to complete your purchase.");
      return;
    }

    try {
      const response = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      
      const order = await response.json();
      
      if (!response.ok) {
        throw new Error(order.error || "Failed to create payment order");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "Shop & Shine",
        description: "Luxury Jewelry Purchase",
        order_id: order.id,
        handler: function (response: any) {
          alert("Payment Successful! ID: " + response.razorpay_payment_id);
          setCart([]);
          setIsCartOpen(false);
        },
        prefill: {
          name: user.user_metadata?.full_name || "Guest User",
          email: user.email || "guest@example.com",
        },
        theme: {
          color: "#D4AF37",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment failed to initialize. Check console for details.");
    }
  };

  const handleAuth = async () => {
    if (user) {
      await signOut();
    } else {
      await signInWithGoogle();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex gap-6 text-sm font-medium tracking-widest uppercase text-gray-500">
              <Link to="/collections" className="hover:text-gold transition-colors">Collections</Link>
              <Link to="/bespoke" className="hover:text-gold transition-colors">Bespoke</Link>
              <Link to="/story" className="hover:text-gold transition-colors">Our Story</Link>
            </div>
          </div>

          <Link to="/" className="text-2xl md:text-3xl font-serif tracking-tighter font-bold text-ink">
            SHOP <span className="text-gold">&</span> SHINE
          </Link>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
            >
              <Search className="w-5 h-5" />
            </button>
            <button onClick={handleAuth} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <img src={user.user_metadata?.avatar_url} className="w-6 h-6 rounded-full" alt="Avatar" />
                  <LogOut className="w-4 h-4 text-gray-400" />
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home products={products} loading={loading} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/collections" element={<Collections products={products} loading={loading} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} searchQuery={searchQuery} />} />
        <Route path="/collections/:category" element={<Collections products={products} loading={loading} addToCart={addToCart} favorites={favorites} toggleFavorite={toggleFavorite} searchQuery={searchQuery} />} />
        <Route path="/bespoke" element={<Bespoke />} />
        <Route path="/story" element={<OurStory />} />
        <Route path="/repair" element={<ServicePage title="Repair & Care" description="Our master craftsmen provide expert repair and maintenance services to keep your jewelry shining for generations." />} />
        <Route path="/appointment" element={<ServicePage title="Virtual Appointment" description="Schedule a one-on-one virtual consultation with our jewelry experts from the comfort of your home." />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping" element={<ServicePage title="Shipping & Returns" description="We offer secure worldwide shipping and a hassle-free 30-day return policy for all our luxury pieces." />} />
        <Route path="/care" element={<ServicePage title="Care Guide" description="Learn how to properly care for your precious metals and gemstones to maintain their brilliance over time." />} />
        <Route path="/privacy" element={<ServicePage title="Privacy Policy" description="We are committed to protecting your personal information and ensuring a secure shopping experience." />} />
      </Routes>

      <Newsletter />
      <Footer />

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold">Your Bag ({totalItems})</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-gray-500">Your bag is empty.</p>
                    <button onClick={() => setIsCartOpen(false)} className="mt-6 text-gold font-bold uppercase tracking-widest text-sm">Start Shopping</button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <img src={item.image} className="w-24 h-32 object-cover rounded-2xl" alt={item.name} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-serif font-bold">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-ink transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{item.category}</p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center border rounded-full px-2 py-1 gap-3">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded-full"><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded-full"><Plus className="w-3 h-3" /></button>
                          </div>
                          <p className="text-gold font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex justify-between mb-6">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-xl font-serif font-bold">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={handlePayment}
                    className="w-full gold-button py-4 text-sm uppercase tracking-[0.2em] font-bold"
                  >
                    Checkout with Razorpay
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest">Secure checkout powered by Razorpay</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-full max-w-sm bg-white z-[70] shadow-2xl p-10"
            >
              <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>

              <div className="mt-12 space-y-8">
                <div className="space-y-4">
                  <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold">Collections</h5>
                  <ul className="text-3xl font-serif space-y-4">
                    <li className="hover:italic hover:pl-2 transition-all cursor-pointer"><Link to="/collections">All Collections</Link></li>
                    <li className="hover:italic hover:pl-2 transition-all cursor-pointer"><Link to="/collections/Bridal">Bridal</Link></li>
                    <li className="hover:italic hover:pl-2 transition-all cursor-pointer"><Link to="/collections/Minimalist">Minimalist</Link></li>
                    <li className="hover:italic hover:pl-2 transition-all cursor-pointer"><Link to="/collections/Heritage">Heritage</Link></li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold">Services</h5>
                  <ul className="text-xl font-serif space-y-4">
                    <li className="hover:text-gold transition-colors cursor-pointer"><Link to="/bespoke">Bespoke Design</Link></li>
                    <li className="hover:text-gold transition-colors cursor-pointer"><Link to="/repair">Repair & Care</Link></li>
                    <li className="hover:text-gold transition-colors cursor-pointer"><Link to="/appointment">Virtual Appointment</Link></li>
                  </ul>
                </div>

                <div className="pt-10 border-t border-gray-100">
                  <button onClick={handleAuth} className="flex items-center gap-4 text-sm font-medium text-gray-500">
                    <User className="w-5 h-5" />
                    <span>{user ? "Sign Out" : "Sign In / Register"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Newsletter() {
  return (
    <section className="py-24 bg-ink text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h3 className="text-4xl font-serif mb-6">Join the Inner Circle</h3>
        <p className="text-gray-400 mb-10">Subscribe to receive updates on new collections, exclusive events, and bespoke offers.</p>
        <form className="flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-gold transition-colors"
          />
          <button className="gold-button whitespace-nowrap">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-20 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl font-serif font-bold mb-6">SHOP <span className="text-gold">&</span> SHINE</h2>
          <p className="text-gray-500 max-w-sm mb-8">Crafting timeless elegance since 2014. Our pieces are designed to celebrate life's most precious moments.</p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-gold hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-gold hover:text-white transition-all"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-gold hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
          </div>
        </div>
        <div>
          <h5 className="font-bold uppercase text-xs tracking-widest mb-6">Shop</h5>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><Link to="/collections" className="hover:text-gold transition-colors">All Collections</Link></li>
            <li><Link to="/collections/Best Sellers" className="hover:text-gold transition-colors">Best Sellers</Link></li>
            <li><Link to="/collections/New Arrivals" className="hover:text-gold transition-colors">New Arrivals</Link></li>
            <li><Link to="/bespoke" className="hover:text-gold transition-colors">Bespoke Service</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold uppercase text-xs tracking-widest mb-6">Support</h5>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><Link to="/shipping" className="hover:text-gold transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/care" className="hover:text-gold transition-colors">Care Guide</Link></li>
            <li><Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-20 mt-20 border-t border-gray-100 flex flex-col md:row justify-between items-center gap-6 text-xs text-gray-400 uppercase tracking-widest font-bold">
        <p>© 2026 Shop & Shine Jewelry. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}

function Home({ products, loading, addToCart, favorites, toggleFavorite }: { products: Product[], loading: boolean, addToCart: (p: Product) => void, favorites: number[], toggleFavorite: (id: number) => void }) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/jewelry-hero/1920/1080" 
            alt="Hero" 
            className="w-full h-full object-cover brightness-75"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <span className="uppercase tracking-[0.3em] text-sm font-semibold text-gold mb-4 block">New Collection 2026</span>
            <h2 className="text-6xl md:text-8xl font-serif leading-none mb-8">
              Elegance <br /> <span className="italic font-light">Redefined.</span>
            </h2>
            <p className="text-lg text-gray-200 mb-10 max-w-md leading-relaxed">
              Discover our latest collection of handcrafted luxury jewelry, where every piece tells a story of timeless beauty.
            </p>
            <div className="flex gap-4">
              <Link to="/collections" className="gold-button">Shop Now</Link>
              <Link to="/collections/New Arrivals" className="px-8 py-3 rounded-full border border-white text-white font-medium hover:bg-white hover:text-ink transition-all">
                View Lookbook
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-6 z-10 hidden lg:block">
          <div className="vertical-text text-white">Scroll to explore</div>
          <div className="w-px h-20 bg-white/30 mx-auto mt-4"></div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="uppercase tracking-[0.3em] text-xs font-bold text-gold mb-4 block">Curated Selection</span>
              <h3 className="text-5xl font-serif">Featured Collections</h3>
            </div>
            <Link to="/collections" className="text-sm font-bold uppercase tracking-widest border-b-2 border-gold pb-2 hover:text-gold transition-colors">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 aspect-[4/5] rounded-3xl mb-6"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                </div>
              ))
            ) : (
              products.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} isFavorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Bespoke Banner */}
      <section className="py-32 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/bespoke-home/800/1000" 
                className="w-full rounded-3xl shadow-2xl" 
                alt="Bespoke" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-3xl shadow-xl hidden lg:block">
                <p className="text-gold font-serif text-2xl italic mb-2">"True luxury is personal."</p>
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400">— Sarah Shine, Founder</p>
              </div>
            </div>
            <div>
              <span className="uppercase tracking-[0.3em] text-xs font-bold text-gold mb-4 block">Custom Creations</span>
              <h3 className="text-5xl font-serif mb-8">The Bespoke Experience</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-10">
                Create a piece as unique as your story. Our master craftsmen work closely with you to bring your vision to life, using only the finest ethically sourced materials.
              </p>
              <Link to="/bespoke" className="gold-button">Start Your Journey</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import { useParams } from "react-router-dom";

function Collections({ products, loading, addToCart, favorites, toggleFavorite, searchQuery }: { products: Product[], loading: boolean, addToCart: (p: Product) => void, favorites: number[], toggleFavorite: (id: number) => void, searchQuery: string }) {
  const { category } = useParams();
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !category || product.category === category || (category === "Best Sellers" && product.id % 2 === 0) || (category === "New Arrivals" && product.id % 3 === 0);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="mb-16">
        <h2 className="text-5xl font-serif mb-4">{category || "All Collections"}</h2>
        <p className="text-gray-500">
          {searchQuery ? `Showing results for "${searchQuery}"` : "Discover our complete range of handcrafted jewelry."}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 aspect-[4/5] rounded-3xl mb-6"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-500 text-xl">No products found matching your criteria.</p>
            <Link to="/collections" className="mt-4 inline-block text-gold font-bold uppercase tracking-widest">View All Collections</Link>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} isFavorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} />
          ))
        )}
      </div>
    </div>
  );
}

function ServicePage({ title, description }: { title: string, description: string }) {
  return (
    <div className="pt-40 pb-32 max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-6xl font-serif mb-10">{title}</h2>
      <p className="text-gray-600 text-xl leading-relaxed mb-16">{description}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-10 bg-gray-50 rounded-[40px]">
          <ShieldCheck className="w-10 h-10 text-gold mx-auto mb-6" />
          <h4 className="font-bold uppercase text-xs tracking-widest mb-2">Guaranteed</h4>
          <p className="text-gray-500 text-sm">Quality you can trust</p>
        </div>
        <div className="p-10 bg-gray-50 rounded-[40px]">
          <Truck className="w-10 h-10 text-gold mx-auto mb-6" />
          <h4 className="font-bold uppercase text-xs tracking-widest mb-2">Secure</h4>
          <p className="text-gray-500 text-sm">Insured worldwide shipping</p>
        </div>
        <div className="p-10 bg-gray-50 rounded-[40px]">
          <RotateCcw className="w-10 h-10 text-gold mx-auto mb-6" />
          <h4 className="font-bold uppercase text-xs tracking-widest mb-2">Flexible</h4>
          <p className="text-gray-500 text-sm">30-day return policy</p>
        </div>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="pt-40 pb-32 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <h2 className="text-6xl font-serif mb-10">Contact Us</h2>
          <p className="text-gray-600 text-xl leading-relaxed mb-12">
            Have a question about our collections or interested in a bespoke piece? Our team is here to assist you.
          </p>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold shrink-0">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold uppercase text-xs tracking-widest mb-1">Instagram</h4>
                <p className="text-gray-500">@shopandshine_jewelry</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold uppercase text-xs tracking-widest mb-1">Email</h4>
                <p className="text-gray-500">concierge@shopandshine.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-12 rounded-[40px]">
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">First Name</label>
                <input type="text" className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-gold transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Last Name</label>
                <input type="text" className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-gold transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Email Address</label>
              <input type="email" className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-gold transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Message</label>
              <textarea rows={4} className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-gold transition-all"></textarea>
            </div>
            <button className="gold-button w-full py-5">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Bespoke() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-5xl font-serif mb-8">Bespoke Design Service</h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-12">
          Create a piece as unique as your story. Our master craftsmen work closely with you to bring your vision to life, using only the finest ethically sourced materials.
        </p>
        <button className="gold-button">Book a Consultation</button>
      </div>
    </div>
  );
}

function OurStory() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-5xl font-serif mb-8">Crafting Timeless <br/> Elegance Since 2014</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Shop & Shine was founded on the belief that jewelry should be more than just an accessory—it should be a celebration of life's most precious moments.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Every piece in our collection is meticulously handcrafted in our studio, blending traditional techniques with contemporary design to create jewelry that lasts for generations.
          </p>
        </div>
        <div className="relative">
          <img src="https://picsum.photos/seed/story/800/1000" className="w-full rounded-3xl shadow-2xl" alt="Our Story" />
          <div className="absolute -bottom-10 -left-10 bg-gold text-white p-10 rounded-3xl hidden lg:block">
            <p className="text-4xl font-serif font-bold">10+</p>
            <p className="text-xs uppercase tracking-widest mt-2">Years of Excellence</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  addToCart: (p: Product) => void;
  isFavorite: boolean;
  toggleFavorite: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart, isFavorite, toggleFavorite }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-3xl aspect-[4/5] mb-6 bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={() => addToCart(product)}
          className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md py-4 rounded-2xl font-bold text-sm uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-gold hover:text-white"
        >
          Add to Bag
        </button>
        <button 
          onClick={() => toggleFavorite(product.id)}
          className={`absolute top-6 right-6 p-3 backdrop-blur-md rounded-full transition-colors ${isFavorite ? "bg-gold text-white" : "bg-white/50 text-ink hover:bg-white"}`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{product.category}</span>
          <h4 className="text-xl font-serif mt-1">{product.name}</h4>
        </div>
        <span className="font-medium text-gold">₹{product.price.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}
