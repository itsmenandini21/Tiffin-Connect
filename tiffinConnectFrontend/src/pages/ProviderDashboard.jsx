import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  ChefHat,
  Star,
  ShieldCheck,
  MessageSquare,
  UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import modular sub-components
import OverviewTab from './provider/OverviewTab';
import AddMenuTab from './provider/AddMenuTab';
import ActiveOrdersTab from './provider/ActiveOrdersTab';
import ReviewsTab from './provider/ReviewsTab';
import EditMenuModal from './provider/EditMenuModal';
import DeleteMenuModal from './provider/DeleteMenuModal';
import SettingsTab from './provider/SettingsTab';
import AccountSettingsTab from './provider/AccountSettingsTab';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.role === 'provider') {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });
  const [menus, setMenus] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuToDelete, setMenuToDelete] = useState(null);

  const fetchMenus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tiffin/getMenu`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMenus(data);
      }
    } catch (err) {
      console.error("Error fetching menus", err);
    }
  };

  useEffect(() => {
    if (user && ['overview', 'orders', 'reviews', 'settings'].includes(activeTab)) {
      fetchMenus();
    }
  }, [user, activeTab]);
  
  const [isVerified, setIsVerified] = useState(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.isVerified !== false;
      } catch (e) {}
    }
    return null;
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is a provider
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'provider') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) return;
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          if (data.profile) {
            const apiVerified = data.profile.isVerified;
            setIsVerified(apiVerified);
            
            // Sync with local storage
            const userData = localStorage.getItem('user');
            if (userData) {
              const parsed = JSON.parse(userData);
              if (parsed.isVerified !== apiVerified) {
                parsed.isVerified = apiVerified;
                localStorage.setItem('user', JSON.stringify(parsed));
              }
            }
          } else {
            setIsVerified(false);
          }
        } else {
          setIsVerified(false);
        }
      } catch (err) {
        console.error("Error checking profile status:", err);
        setIsVerified(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    checkVerificationStatus();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const uploadToCloudinary = async (file) => {
    const CLOUD_NAME = "ds94mrgkb";
    const UPLOAD_PRESET = "tiffinConnect";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Failed to upload image");
    return data.secure_url;
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const weeklyMenu = {
      monday: formData.get('monday'),
      tuesday: formData.get('tuesday'),
      wednesday: formData.get('wednesday'),
      thursday: formData.get('thursday'),
      friday: formData.get('friday'),
      saturday: formData.get('saturday'),
      sunday: formData.get('sunday'),
    };
    
    let coverImage = "";
    let menuImages = [];
    
    const coverFile = formData.get('coverImage');
    const menuFiles = formData.getAll('menuImages');

    try {
      if ((coverFile && coverFile.size > 0) || (menuFiles && menuFiles.length > 0 && menuFiles[0].size > 0)) {
        const toastId = toast.loading("Uploading images to Cloudinary...");
        if (coverFile && coverFile.size > 0) {
           coverImage = await uploadToCloudinary(coverFile);
        }
        for (const file of menuFiles) {
          if (file.size > 0) {
             const url = await uploadToCloudinary(file);
             menuImages.push(url);
          }
        }
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Image upload failed: " + err.message);
      return;
    }

    const payload = {
      title: formData.get('title'),
      foodType: formData.get('foodType'),
      shift: formData.get('shift'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      pricePerMeal: Number(formData.get('pricePerMeal')),
      description: formData.get('description'),
      coverImage,
      menuImages,
      weeklyMenu
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tiffin/addMenu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Menu published successfully!");
        e.target.reset();
        setActiveTab('overview');
        fetchMenus();
      } else {
        toast.error(data.message || "Failed to publish menu");
      }
    } catch (err) {
      toast.error("Could not connect to the server");
    }
  };

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const weeklyMenu = {
      monday: formData.get('monday'),
      tuesday: formData.get('tuesday'),
      wednesday: formData.get('wednesday'),
      thursday: formData.get('thursday'),
      friday: formData.get('friday'),
      saturday: formData.get('saturday'),
      sunday: formData.get('sunday'),
    };
    
    let coverImage = null;
    let menuImages = null;
    
    const coverFile = formData.get('coverImage');
    const menuFiles = formData.getAll('menuImages');

    try {
      if ((coverFile && coverFile.size > 0) || (menuFiles && menuFiles.length > 0 && menuFiles[0].size > 0)) {
        const toastId = toast.loading("Uploading new images to Cloudinary...");
        if (coverFile && coverFile.size > 0) {
           coverImage = await uploadToCloudinary(coverFile);
        }
        
        if (menuFiles && menuFiles.length > 0 && menuFiles[0].size > 0) {
          menuImages = [];
          for (const file of menuFiles) {
            if (file.size > 0) {
               const url = await uploadToCloudinary(file);
               menuImages.push(url);
            }
          }
        }
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Image upload failed: " + err.message);
      return;
    }

    const payload = {
      title: formData.get('title'),
      foodType: formData.get('foodType'),
      shift: formData.get('shift'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      pricePerMeal: Number(formData.get('pricePerMeal')),
      description: formData.get('description'),
      weeklyMenu
    };

    if (coverImage !== null) payload.coverImage = coverImage;
    if (menuImages !== null) payload.menuImages = menuImages;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tiffin/update/${editingMenu._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Menu updated successfully!");
        setEditingMenu(null);
        fetchMenus();
      } else {
        toast.error(data.message || "Failed to update menu");
      }
    } catch (err) {
      toast.error("Could not connect to the server");
    }
  };

  const handleDeleteMenu = async () => {
    if (!menuToDelete) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tiffin/delete/${menuToDelete}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Menu deleted successfully!");
        setMenuToDelete(null);
        fetchMenus();
      } else {
        toast.error(data.message || "Failed to delete menu");
        setMenuToDelete(null);
      }
    } catch (err) {
      toast.error("Could not connect to the server");
      setMenuToDelete(null);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'add-menu', label: 'Add Menu', icon: PlusCircle },
    { id: 'orders', label: 'Active Orders', icon: ShoppingBag },
    { id: 'reviews', label: 'Ratings & Reviews', icon: Star },
    { id: 'settings', label: 'Feedback Manager', icon: MessageSquare },
    { id: 'account-settings', label: 'Account Settings', icon: UserCog },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isVerified === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 border border-amber-100 shadow-inner">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Verification Pending</h2>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            Thank you for registering on <strong>Tiffin Connect</strong>! Your provider profile is currently under review by our administration team.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-6 text-xs text-left space-y-2 text-gray-600 w-full">
            <p className="font-bold text-gray-800">What we are verifying:</p>
            <p>• Official FSSAI Registration Certificate details.</p>
            <p>• Registered Business Name & kitchen address guidelines.</p>
            <p className="text-[10px] text-gray-400 font-semibold pt-1 border-t border-slate-205">Verification usually takes less than 24 hours.</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-lg transition-all"
          >
            Sign Out & Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-tr from-[#faf6f0] via-[#ffffff] to-[#fffbf7] flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white/90 backdrop-blur-md border-r border-orange-100/50 hidden md:flex flex-col shadow-sm relative z-10"
      >
        <div className="p-6 border-b border-orange-50/50 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-orange-100/70 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
            <ChefHat className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="font-bold text-gray-900 text-lg">{user.name}'s Kitchen</h2>
          <p className="text-xs text-green-500 font-medium px-2 py-1 bg-green-50 rounded-full mt-2">Verified Provider</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25' 
                    : 'text-gray-500 hover:bg-orange-50/60 hover:text-orange-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto relative h-full">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-30 pointer-events-none z-0">
          <div className="w-[600px] h-[600px] bg-gradient-to-br from-orange-200 to-amber-200 rounded-full blur-[100px]"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-1/3 opacity-20 pointer-events-none z-0">
          <div className="w-[500px] h-[500px] bg-gradient-to-tr from-rose-200 to-orange-200 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 font-sans tracking-tight">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-gray-505 mt-1 font-medium">Manage your kitchen operations and menus.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLogout} 
                className="bg-white border border-gray-200 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-gray-600 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview-wrapper"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <OverviewTab 
                  menus={menus}
                  setEditingMenu={setEditingMenu}
                  setMenuToDelete={setMenuToDelete}
                  setActiveTab={setActiveTab}
                />
              </motion.div>
            )}

            {activeTab === 'add-menu' && (
              <motion.div
                key="add-menu-wrapper"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AddMenuTab 
                  handleAddMenu={handleAddMenu}
                  setActiveTab={setActiveTab}
                />
              </motion.div>
            )}

            {/* Settings Tab (Feedback Manager) */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-wrapper"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SettingsTab 
                  menus={menus}
                  setActiveTab={setActiveTab}
                />
              </motion.div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account-settings' && (
              <motion.div
                key="account-settings-wrapper"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AccountSettingsTab 
                  user={user}
                  onProfileUpdate={fetchMenus}
                />
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
              >
                <ActiveOrdersTab menus={menus} onRefresh={fetchMenus} />
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div 
                key="reviews-wrapper"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
              >
                <ReviewsTab menus={menus} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal overlays */}
        <AnimatePresence>
          {editingMenu && (
            <EditMenuModal 
              editingMenu={editingMenu}
              setEditingMenu={setEditingMenu}
              handleUpdateMenu={handleUpdateMenu}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {menuToDelete && (
            <DeleteMenuModal 
              menuToDelete={menuToDelete}
              setMenuToDelete={setMenuToDelete}
              handleDeleteMenu={handleDeleteMenu}
            />
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
