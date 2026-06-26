import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, MapPin, Phone, Save, ArrowLeft, Shield, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConsumerNavbar from '../../components/ConsumerNavbar';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          address: {
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            pincode: user.address?.pincode || ''
          }
        });
      } else {
        toast.error("Failed to load profile data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['street', 'city', 'state', 'pincode'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success("Profile updated successfully!");
        // Update local storage user name if it changed
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.name = formData.name;
        localStorage.setItem("user", JSON.stringify(storedUser));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF4EC] pb-20 relative font-sans">
      
      {/* Background container with overflow-hidden to contain blur shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-multiply" 
          style={{ backgroundImage: "url('/bg-pattern.png')", backgroundSize: 'cover', backgroundAttachment: 'fixed' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4EC]/95 via-[#FFE8D6]/80 to-[#FFF0E6]/95 backdrop-blur-[1px]" />
        
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-gradient-to-tr from-[#FF7A00]/15 to-amber-400/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] left-[-15%] w-[600px] h-[600px] bg-rose-400/10 rounded-full blur-[130px]" />
      </div>

      <ConsumerNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button 
            onClick={() => navigate('/consumer-dashboard')}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-[#FF7A00] hover:border-[#FF7A00]/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-500 font-medium">Update your personal details and delivery address</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A00]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Sidebar Overview */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-1 space-y-4"
            >
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-orange-900/5">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF7A00] to-amber-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30 text-white font-bold text-3xl">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{formData.name}</h2>
                <p className="text-xs text-gray-500 mb-4">{formData.email}</p>
                <div className="h-px w-full bg-gray-100 my-4"></div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
                  <Shield className="w-4 h-4" /> Account Secured
                </div>
              </div>
            </motion.div>

            {/* Right Settings Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2"
            >
              <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl shadow-orange-900/5 space-y-6">
                
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-[#FF7A00]" /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                        <input 
                          type="text" 
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-600 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                        <input 
                          type="email" 
                          disabled
                          value={formData.email}
                          className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 ml-1">Email address cannot be changed</p>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100"></div>

                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#FF7A00]" /> Delivery Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-600 ml-1">Street Address</label>
                      <input 
                        type="text" 
                        name="street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 ml-1">City</label>
                      <input 
                        type="text" 
                        name="city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 ml-1">State</label>
                      <input 
                        type="text" 
                        name="state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600 ml-1">PIN Code</label>
                      <input 
                        type="text" 
                        name="pincode"
                        value={formData.address.pincode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#FF7A00] hover:bg-[#E66A00] text-white px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
