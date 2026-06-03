import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, ShoppingBag, ArrowRight, Star, ShieldCheck, Heart } from 'lucide-react';
import consumerImg from '../assets/Consumer.png';
import producerImg from '../assets/Producer.png';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/consumer-dashboard");
        }
      } catch (e) {
        console.error("Session parse error: ", e);
      }
    }
  }, [navigate]);
  return (
    <div className="flex flex-col items-center bg-white overflow-hidden relative min-h-screen">
      
      {/* GLOBAL BACKGROUND DOT PATTERN */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.25] z-0" 
           style={{
             backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}
      />

      {/* 1. HERO SECTION */}
      <section className="w-full relative py-24 sm:py-36 flex justify-center z-10">
        {/* Colorful Mesh Gradients in Background */}
        <div className="absolute top-0 right-0 -translate-y-24 translate-x-1/4 opacity-30 pointer-events-none z-0">
          <div className="w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-gradient-to-br from-orange-400 to-amber-300 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute top-1/3 left-0 -translate-x-1/4 opacity-20 pointer-events-none z-0">
          <div className="w-[400px] h-[400px] bg-amber-400 rounded-full blur-3xl"></div>
        </div>

        {/* Floating 3D-like Food Emojis */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute left-[8%] top-[20%] text-4xl sm:text-5xl hidden md:block select-none filter drop-shadow-lg"
        >
          🍲
        </motion.div>
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          className="absolute right-[12%] top-[15%] text-4xl sm:text-5xl hidden md:block select-none filter drop-shadow-lg"
        >
          🥗
        </motion.div>
        <motion.div 
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
          className="absolute left-[15%] bottom-[15%] text-4xl hidden lg:block select-none filter drop-shadow-lg"
        >
          🍱
        </motion.div>
        <motion.div 
          animate={{ y: [0, 10, 0], rotate: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.5 }}
          className="absolute right-[10%] bottom-[20%] text-4xl hidden lg:block select-none filter drop-shadow-lg"
        >
          🍛
        </motion.div>

        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-700 text-sm font-extrabold mb-8 border border-orange-200/50 shadow-sm backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              The #1 Tiffin Network in India
            </span>
            
            <h1 className="text-6xl sm:text-8xl font-black text-gray-900 tracking-tight mb-8 leading-[1.05]">
              Ghar ka Khana, <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
                Delivered Daily.
              </span>
            </h1>
            
            <p className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed font-semibold">
              The ultimate marketplace connecting busy food lovers with verified, passionate home chefs. Experience hot, hygienic home meals every day.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" state={{ isRegister: true }} className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4.5 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:from-orange-600 hover:to-amber-600 transition-all w-full sm:w-auto">
                  <ShoppingBag className="w-6 h-6" />
                  Order Food Now
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" state={{ isRegister: true }} className="flex items-center justify-center gap-3 bg-white text-gray-800 border-2 border-gray-200 px-8 py-4.5 rounded-2xl font-bold text-lg hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50/50 hover:shadow-lg transition-all w-full sm:w-auto group">
                  <ChefHat className="w-6 h-6 text-gray-500 group-hover:text-orange-500 transition-colors" />
                  Become a Chef
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CONSUMER SECTION */}
      <section className="w-full py-28 bg-gradient-to-b from-gray-50/80 to-orange-50/20 border-y border-gray-100 flex justify-center relative z-10">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-20">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex-1 space-y-8"
          >
            <div className="inline-block px-4 py-2 bg-orange-100 text-orange-800 font-extrabold rounded-2xl text-sm tracking-wider uppercase shadow-sm">
              😋 For Food Lovers
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-gray-900 leading-tight">
              Discover local kitchens & subscribe instantly.
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              Tired of restaurant grease? Browse curated menus from verified home cooks in your neighborhood. Pick a custom plan, check out, and enjoy warm home food.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg font-bold text-gray-700">
              <li className="flex items-center gap-3"><span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">✓</span> Custom Veg/Jain filters</li>
              <li className="flex items-center gap-3"><span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">✓</span> Pausable subscriptions</li>
              <li className="flex items-center gap-3"><span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">✓</span> Complete Mon-Sun schedules</li>
              <li className="flex items-center gap-3"><span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">✓</span> Direct messaging to chef</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            {/* Multi-layered glow circles under images */}
            <div className="absolute inset-0 bg-orange-200/50 rounded-[3rem] blur-3xl opacity-40 transform rotate-6 scale-95 pointer-events-none"></div>
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-100 to-amber-50 rounded-[2.5rem] transform -rotate-3 z-0 border border-orange-200/50 shadow-inner"></div>
            <img 
              src={consumerImg} 
              alt="Consumer App Mockup" 
              className="relative z-10 w-full max-w-md mx-auto rounded-[2rem] shadow-2xl border-8 border-white transform transition-transform hover:scale-105 duration-500"
            />
          </motion.div>

        </div>
      </section>

      {/* 3. PROVIDER SECTION */}
      <section className="w-full py-28 bg-white flex justify-center relative z-10">
        <div className="absolute bottom-1/4 left-0 w-[450px] h-[450px] bg-orange-100/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col-reverse lg:flex-row items-center gap-20">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <div className="absolute inset-0 bg-orange-300 rounded-[3rem] blur-3xl opacity-40 transform -rotate-6 scale-95 pointer-events-none"></div>
            <div className="absolute -inset-4 bg-gradient-to-br from-orange-100 to-amber-50 rounded-[2.5rem] transform rotate-3 z-0 border border-orange-200/50 shadow-inner"></div>
            
            <img 
              src={producerImg} 
              alt="Provider Dashboard Mockup" 
              className="relative z-10 w-full max-w-lg mx-auto rounded-[2rem] shadow-2xl border-8 border-white transform transition-transform hover:scale-105 duration-500"
            />
            
            {/* Dynamic floating badge overlay */}
            <motion.div 
              animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute -left-8 bottom-12 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-orange-100 z-20 hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👩‍🍳</span>
                </div>
                <div>
                  <p className="text-xs font-black text-orange-600 uppercase tracking-wider">Kitchen Growth</p>
                  <p className="text-lg font-black text-gray-900">+45 Orders This Week</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex-1 space-y-8"
          >
            <div className="inline-block px-4 py-2 bg-orange-100 text-orange-800 font-extrabold rounded-2xl text-sm tracking-wider uppercase shadow-sm">
              🍳 For Home Chefs
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-gray-900 leading-tight">
              Turn your kitchen into a business.
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              Passionate about cooking? Host your menus, plan flexible weekly routines, track subscribers, review monthly income, and get fast direct payouts.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg font-bold text-gray-700">
              <li className="flex items-center gap-3"><span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">✓</span> Live menu managers</li>
              <li className="flex items-center gap-3"><span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">✓</span> In-depth payouts tracker</li>
              <li className="flex items-center gap-3"><span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">✓</span> Automated order system</li>
              <li className="flex items-center gap-3"><span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">✓</span> Chef verified credentials</li>
            </ul>
          </motion.div>

        </div>
      </section>

      {/* 4. KEY METRICS / TRUST SECTION */}
      <section className="w-full py-20 bg-gradient-to-b from-gray-50 to-orange-50/20 flex justify-center relative z-10 border-t border-gray-100">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600"><Star className="w-6 h-6 fill-current"/></div>
              <div>
                <h4 className="text-lg font-black text-gray-900">Highly Rated Kitchens</h4>
                <p className="text-gray-500 mt-1">Every home kitchen is thoroughly vetted for standard ratings.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600"><ShieldCheck className="w-6 h-6"/></div>
              <div>
                <h4 className="text-lg font-black text-gray-900">100% Hygienic Food</h4>
                <p className="text-gray-500 mt-1">Verified FSSAI kitchen audits to ensure ultimate hygiene.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600"><Heart className="w-6 h-6 fill-current"/></div>
              <div>
                <h4 className="text-lg font-black text-gray-900">Made With True Love</h4>
                <p className="text-gray-500 mt-1">Real home chefs cooking for you like their own family.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
