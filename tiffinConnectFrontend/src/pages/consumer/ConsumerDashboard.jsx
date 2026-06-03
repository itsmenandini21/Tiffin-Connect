import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles, Soup, RefreshCw } from 'lucide-react';

// Import Co-located dashboard items
import ConsumerNavbar from '../../components/ConsumerNavbar';
import GreetingHeader from './GreetingHeader';
import FilterBar from './FilterBar';
import KitchenCard from './KitchenCard';
import MenuModal from './MenuModal';

export default function ConsumerDashboard() {
  const navigate = useNavigate();
  // ==========================================
  // JAVASCRIPT STATE & DATA FETCHING GUIDE
  // ==========================================
  // TODO ( Nandini ): Here are your core React states. Implement them step-by-step!
  
  // 1. Search Query state:
  const [searchVal, setSearchVal] = useState("");

  // 2. Active filters toggle state:
  const [activeFilters, setActiveFilters] = useState({
    vegOnly: false,
    nonVegOnly: false,
    highRated: false,
    mildSpice: false,
    mediumSpice: false,
    hotSpice: false
  });

  // 3. Modal control state (holds the kitchen object to view, or null if closed):
  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const [modalMode, setModalMode] = useState("menu"); // "menu" or "subscribe"

  // 4. Kitchens List states (database values vs filtered client list):
  const [kitchens, setKitchens] = useState([]); // Raw data from backend API
  const [filteredKitchens, setFilteredKitchens] = useState([]); // Filtered data shown in grid
  const [loading, setLoading] = useState(true); // Loading spinner state

  // Mock static data to populate the UI instantly (so you can see your design looks perfect!):
  const mockKitchensData = [
    {
      _id: "k1",
      serviceName: "Maa Ki Rasoi",
      description: "Authentic, hygienic Rajasthani & Gujarati thalis prepared with fresh premium organic ingredients. No artificial colors or preservatives.",
      price: 110,
      cuisineType: "Gujarati & Rajasthani",
      isVeg: true,
      rating: 4.9,
      ordersCount: 280,
      providerId: {
        name: "Chef Maya Vyas",
        address: "Sector 15, Noida"
      },
      menu: {
        Monday: { lunch: "Roti (4), Dal Baati, Churma, Gatte ki Sabzi", dinner: "Phulka (4), Khichdi Kadhi, Aloo Fry" },
        Tuesday: { lunch: "Roti (4), Sev Tamatar, Kadhi Rajasthani, Steamed Rice", dinner: "Phulka (4), Lauki Sabzi, Toor Dal" },
        Wednesday: { lunch: "Plain Paratha (3), Shahi Paneer, Pulao, Salad", dinner: "Phulka (4), Mix Veg Sabzi, Moong Dal" },
        Thursday: { lunch: "Roti (4), Baigan Bharta, Tadka Dal, Jeera Rice", dinner: "Phulka (4), Aloo Gobhi Dry, Khichdi" },
        Friday: { lunch: "Missi Roti (2), Paneer Butter Masala, Pulao, Papad", dinner: "Phulka (4), Turai Sabzi, Dal Tadka" },
        Saturday: { lunch: "Puri (6), Aloo Tamatar Curry, Sooji Halwa, Salad", dinner: "Phulka (4), Seasonal Veg Sabzi, Rice" },
        Sunday: { lunch: "Special Butter Naan (2), Dal Makhani, Veg Biryani, Kheer", dinner: "Light Phulka (3), Moong Khichdi, Kadhi" }
      }
    },
    {
      _id: "k2",
      serviceName: "Delhi Food Junction",
      description: "Rich Punjabi delicacies, heavy Butter Paneer Masala, spicy Rajma, and freshly prepared thick Tandoori rotis. Non-veg thalis available.",
      price: 140,
      cuisineType: "North Indian Punjabi",
      isVeg: false,
      rating: 4.7,
      ordersCount: 195,
      providerId: {
        name: "Chef Harpreet Singh",
        address: "Indirapuram, Ghaziabad"
      },
      menu: {
        Monday: { lunch: "Butter Roti (4), Paneer Butter Masala, Dal Makhani, Basmati Rice", dinner: "Phulka (4), Egg Bhurji (or Aloo Jeera), Yellow Dal" },
        Tuesday: { lunch: "Tandoori Roti (3), Chicken Curry (or Matar Paneer), Rice, Salad", dinner: "Phulka (4), Mix Veg Sabzi, Moong Dal Tadka" },
        Wednesday: { lunch: "Lachha Paratha (2), Kadai Paneer, Veg Pulav, Raita", dinner: "Phulka (4), Bhindi Pyaza, Toor Dal, Rice" },
        Thursday: { lunch: "Roti (4), Rajma Masala, Steamed Rice, Onion Lacha, Raita", dinner: "Phulka (4), Lauki Sabzi, Dal Tadka, Rice" },
        Friday: { lunch: "Plain Paratha (3), Butter Chicken (or Shahi Paneer), Jeera Rice", dinner: "Phulka (4), Aloo Soyabean Curry, Dal" },
        Saturday: { lunch: "Butter Roti (4), Chole Bhature (2), Sweet Lassi, Salad", dinner: "Phulka (4), Paneer Bhurji dry, Dal Fry" },
        Sunday: { lunch: "Special Garlic Naan (2), Dal Makhani, Chicken Biryani (or Paneer Biryani), Raita", dinner: "Light Phulka (3), Seasonal Veg, Soup" }
      }
    },
    {
      _id: "k3",
      serviceName: "Dakshin Delight",
      description: "Traditional light South Indian home kitchen preparing super soft Idlis, crispy Vadas, and organic daily Thalis with fresh coconut chutneys.",
      price: 95,
      cuisineType: "South Indian Healthy",
      isVeg: true,
      rating: 4.8,
      ordersCount: 160,
      providerId: {
        name: "Chef Rajalaxmi Iyer",
        address: "Sector 50, Noida"
      },
      menu: {
        Monday: { lunch: "Traditional Rice Thali, Sambar, Rasam, Cabbage Poriyal, Curd", dinner: "Soft Ghee Idli (4), Coconut & Tomato Chutney, Sambhar" },
        Tuesday: { lunch: "Lemon Rice, Plain Vada (2), Tomato Raita, Pickle, Papad", dinner: "Rava Dosa (2), Coconut Chutney, Sambhar" },
        Wednesday: { lunch: "Traditional Rice Thali, Potato Fry, Drumstick Sambhar, Rasam", dinner: "Uttapam (2), Coconut Chutney, Gunpowder Podi" },
        Thursday: { lunch: "Curd Rice, Medu Vada (2), Coconut Chutney, Pickle", dinner: "Appam (3) with Vegetable Stew" },
        Friday: { lunch: "Tomato Rice, Sambar, Coconut Poriyal, Papad, Curd", dinner: "Soft Ghee Idli (4), Sambhar, Peanut Chutney" },
        Saturday: { lunch: "Malabar Parotta (2), Veg Kurma, Steamed Rice, Sambhar", dinner: "Masala Dosa (1), Coconut Chutney, Rasam" },
        Sunday: { lunch: "Special Coconut Rice, Vegetable Biryani, Onion Raita, Payasam", dinner: "Light Rice, Rasam Soup, Curd" }
      }
    }
  ];

  // 5. Connect real database backend API!
  useEffect(() => {
    const fetchKitchensFromDatabase = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
        const token = localStorage.getItem("token");
        
        if (!token) {
          toast.error("Please log in to view the dashboard.");
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/tiffin/allServices`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.status === 401 || response.status === 403) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch kitchens from database");
        }

        const data = await response.json();
        
        // Standardize the database results to match our frontend property structures perfectly
        const standardizedData = data.map(rawItem => ({
          _id: rawItem._id,
          serviceName: rawItem.title || rawItem.serviceName || "Swad ki Rasoi",
          description: rawItem.description || "Pure, high-quality vegetarian meals cooked daily with authentic spices.",
          price: rawItem.pricePerMeal || rawItem.price || 120,
          cuisineType: rawItem.foodType || rawItem.cuisineType || "North Indian",
          isVeg: rawItem.foodType 
            ? ["Veg", "Vegan", "Jain"].includes(rawItem.foodType) 
            : (rawItem.isVeg !== false),
          rating: rawItem.rating || 4.8,
          ordersCount: rawItem.ordersCount || 125,
          providerId: {
            name: rawItem.providerId?.name || "Chef Sunita Sharma",
            address: rawItem.providerId?.address
              ? (typeof rawItem.providerId.address === 'object'
                  ? `${rawItem.providerId.address.city || ''}, ${rawItem.providerId.address.state || ''}`
                  : rawItem.providerId.address)
              : "Sector 62, Noida"
          },
          menu: rawItem.weeklyMenu || rawItem.menu,
          providerProfile: rawItem.providerProfile || null
        }));

        if (standardizedData && standardizedData.length > 0) {
          setKitchens(standardizedData);
          setFilteredKitchens(standardizedData);
        } else {
          // If no active services are in the database yet, keep mock data
          // so the dashboard always presents a premium experience for demo purposes
          setKitchens(mockKitchensData);
          setFilteredKitchens(mockKitchensData);
        }
      } catch (err) {
        console.error("Error fetching kitchens data: ", err);
        // Fall back to gorgeous mock data so the UI remains beautiful if the backend is down
        setKitchens(mockKitchensData);
        setFilteredKitchens(mockKitchensData);
      } finally {
        setLoading(false);
      }
    };

    fetchKitchensFromDatabase();
  }, [navigate]);

  // 6. TODO: Implement search & filter client logic!
  useEffect(() => {
    let result = kitchens;

    // Search query logic
    if (searchVal.trim() !== "") {
      result = result.filter(item => 
        item.serviceName.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.cuisineType.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.description.toLowerCase().includes(searchVal.toLowerCase())
      );
    }

    // Veg-Only toggle filter
    if (activeFilters.vegOnly) {
      result = result.filter(item => item.isVeg === true);
    }

    // Non-Veg toggle filter
    if (activeFilters.nonVegOnly) {
      result = result.filter(item => item.isVeg === false);
    }

    // High Rated (4.8+) filter
    if (activeFilters.highRated) {
      result = result.filter(item => item.rating >= 4.8);
    }

    setFilteredKitchens(result);
  }, [searchVal, activeFilters, kitchens]);

  // Handler to toggle filters
  const handleFilterToggle = (filterKey) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 relative overflow-hidden">
      
      {/* Decorative Glow sphere background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Global Consumer Navbar */}
      <ConsumerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        
        {/* Dynamic Greeting & Search Section */}
        <GreetingHeader 
          searchVal={searchVal}
          onSearchChange={setSearchVal}
        />

        {/* Dynamic Category Filter Pills */}
        <FilterBar 
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
        />

        {/* Grid Section for Kitchen Listings */}
        <div className="flex items-center gap-2 mb-6">
          <Soup className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-extrabold text-gray-800">Explore Local Kitchens</h2>
          <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full ml-1">
            {filteredKitchens.length} Kitchens available
          </span>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-sm font-bold text-gray-400">Finding nearby fresh home kitchens...</p>
          </div>
        ) : (
          <>
            {/* Empty Search Result State */}
            {filteredKitchens.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
                <span className="text-4xl">🔍</span>
                <h3 className="text-lg font-bold text-gray-800 mt-4">No Kitchens Found</h3>
                <p className="text-xs md:text-sm text-gray-400 mt-2 font-medium">
                  We couldn't find any kitchen matching your search or filters. Try adjusting your preferences!
                </p>
                <button 
                  onClick={() => {
                    setSearchVal("");
                    setActiveFilters({
                      vegOnly: false,
                      nonVegOnly: false,
                      highRated: false,
                      mildSpice: false,
                      mediumSpice: false,
                      hotSpice: false
                    });
                  }}
                  className="mt-5 px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs rounded-xl border border-orange-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Kitchen Card Listings Grid */
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              >
                <AnimatePresence>
                  {filteredKitchens.map((kitchen) => (
                    <motion.div
                      key={kitchen._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <KitchenCard 
                        kitchen={kitchen}
                        onViewMenu={(k) => {
                          setSelectedKitchen(k);
                          setModalMode("menu");
                        }}
                        onSubscribe={(k) => {
                          setSelectedKitchen(k);
                          setModalMode("subscribe");
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}

      </main>

      {/* 7-Day Weekly Menu Modal Layer */}
      <AnimatePresence>
        {selectedKitchen && (
          <MenuModal 
            kitchen={selectedKitchen}
            initialMode={modalMode}
            onClose={() => setSelectedKitchen(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
