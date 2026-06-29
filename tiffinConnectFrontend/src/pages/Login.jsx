import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Utensils, User, Phone, MapPin, Building, Map, Briefcase, FileText, CreditCard, X, ChefHat } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(!location.state?.isRegister);
  
  // Validation state
  const [errors, setErrors] = useState({});

  // Modal states for Multi-step Registration
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);

  // State to hold user data between Step 1 (Base Info) and Step 2 (Role Selection)
  const [baseFormData, setBaseFormData] = useState(null);

  useEffect(() => {
    // If user is already logged in, redirect immediately to dashboard
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (user.role === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/consumer-dashboard");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [navigate]);

  useEffect(() => {
    // If state is explicitly isRegister: true, show signup. Otherwise, show login.
    if (location.state?.isRegister) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.state]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const toastId = toast.loading("Signing in with Google...");
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Logged in successfully via Google!", { id: toastId });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect based on user role
        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/consumer-dashboard");
        }
      } else {
        toast.error(data.message || "Google authentication failed", { id: toastId });
      }
    } catch (error) {
      console.error("Google Login Frontend Error:", error);
      toast.error("Could not connect to the server.", { id: toastId });
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google Sign-In was cancelled or failed.");
  };

  const handleBaseRegistrationSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const email = e.target.email?.value;
    const password = e.target.password?.value;

    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    
    if (!isLogin) {
      if (!e.target.name?.value) newErrors.name = "Name is required";
      if (!e.target.phone?.value) newErrors.phone = "Phone is required";
      if (!e.target.street?.value) newErrors.street = "Street is required";
      if (!e.target.city?.value) newErrors.city = "City is required";
      if (!e.target.state?.value) newErrors.state = "State is required";
      if (!e.target.pincode?.value) newErrors.pincode = "Pincode is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (isLogin) {
        try {
          const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            toast.success("Logged in successfully!");
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            // Redirect based on user role
            if (data.user.role === "admin") {
              navigate("/admin-dashboard");
            } else if (data.user.role === "provider") {
              navigate("/provider-dashboard");
            } else {
              navigate("/consumer-dashboard");
            }
          } else {
            toast.error(data.message || "Login failed");
            if (data.message?.toLowerCase().includes("password")) {
              setErrors({ password: data.message });
            } else if (data.message?.toLowerCase().includes("email") || data.message?.toLowerCase().includes("user")) {
              setErrors({ email: data.message });
            } else {
              setErrors({}); // For generic server errors, rely on the toast, don't highlight email.
            }
          }
        } catch (error) {
          console.error("Login Error:", error);
          toast.error("Could not connect to the server. Please make sure the backend is running.");
        }
      } else {
        // Step 1 of registration complete. Save data to state and open the role modal.
        setBaseFormData({
          name: e.target.name.value,
          email: email,
          password: password,
          phoneNumber: e.target.phone.value,
          address: {
            street: e.target.street.value,
            city: e.target.city.value,
            state: e.target.state.value,
            pincode: e.target.pincode.value
          }
        });
        setShowRoleModal(true);
      }
    }
  };

  const registerUser = async (role, additionalData = {}) => {
    try {
      const payload = {
        ...baseFormData,
        role,
        ...additionalData
      };

      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/auth/signUp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Registration complete! Welcome to Tiffin Connect.`);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setShowProviderForm(false);
        setShowRoleModal(false);

        // Redirect based on user role
        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/consumer-dashboard");
        }
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error("Could not connect to the server.");
    }
  };

  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    const file = e.target.fssaiFile.files[0];
    
    if (!file) {
      toast.error("Please upload your FSSAI certificate document.");
      return;
    }

    const toastId = toast.loading("Securely uploading your certificate...");
    
    try {
      const CLOUD_NAME = "ds94mrgkb";
      const UPLOAD_PRESET = "tiffinConnect";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });

      const fileData = await res.json();
      if (!res.ok) {
        throw new Error(fileData.error?.message || "Failed to upload the document. Please try again.");
      }

      toast.success("Document uploaded successfully!", { id: toastId });

      const additionalData = {
        businessName: e.target.businessName.value,
        fssaiCertificate: fileData.secure_url,
        bankAccount: e.target.bankAccount.value,
        ifscCode: e.target.ifscCode.value,
        kitchenPhotos: [] // Send empty array for now until file upload is implemented
      };
      
      registerUser("provider", additionalData);
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      toast.error(err.message || "Failed to upload FSSAI certificate", { id: toastId });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50">
      
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
        <div className="w-[500px] h-[500px] bg-orange-400 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none">
        <div className="w-[500px] h-[500px] bg-amber-400 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`w-full ${isLogin ? 'max-w-md' : 'max-w-2xl'} relative z-10 transition-all duration-500`}
      >
        <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/20">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-orange-50 rounded-2xl mb-4 shadow-inner">
              <Utensils className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Welcome back' : 'Create an Account'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Please enter your details to sign in.' : 'Join Tiffin Connect today!'}
            </p>
          </div>

          <form onSubmit={handleBaseRegistrationSubmit} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                      <input name="name" type="text" required className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-transparent'}`} placeholder="John Doe" />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className={`h-5 w-5 ${errors.phone ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                      <input name="phone" type="tel" required className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-transparent'}`} placeholder="+91 9876543210" />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className={`h-5 w-5 ${errors.street ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                      <input name="street" type="text" required className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.street ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-transparent'}`} placeholder="123 Main St, Apt 4B" />
                    </div>
                    {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className={`h-5 w-5 ${errors.city ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                      <input name="city" type="text" required className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-transparent'}`} placeholder="Mumbai" />
                    </div>
                    {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Map className={`h-5 w-5 ${errors.state ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <input name="state" type="text" required className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.state ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-transparent'}`} placeholder="MH" />
                      </div>
                      {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input name="pincode" type="text" required className={`block w-full px-4 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.pincode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-transparent'}`} placeholder="400001" />
                      {errors.pincode && <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`grid grid-cols-1 ${!isLogin ? 'md:grid-cols-2 gap-6' : 'gap-6'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input name="email" type="email" className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-transparent'}`} placeholder="you@example.com" />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input name="password" type="password" className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-transparent'}`} placeholder="••••••••" />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
            >
              {isLogin ? 'Sign In' : 'Continue'} <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          {isLogin && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-semibold">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  theme="outline"
                  size="large"
                  width="384"
                />
              </div>
            </>
          )}

          <p className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setErrors({}); }} 
              className="font-bold text-orange-600 hover:text-orange-500 transition-colors"
            >
              {isLogin ? 'Sign up for free' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showRoleModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-lg w-full relative"
            >
              <button 
                onClick={() => {setShowRoleModal(false); setShowProviderForm(false);}}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!showProviderForm ? (
                <div className="text-center">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">How are you joining us?</h3>
                  <p className="text-gray-500 mb-8">Please select what you want to do on Tiffin Connect.</p>
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => registerUser("user")}
                      className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
                    >
                      <Utensils className="w-10 h-10 text-gray-400 group-hover:text-orange-500 mb-3 transition-colors" />
                      <h4 className="font-bold text-gray-900 group-hover:text-orange-600">Order Food</h4>
                      <p className="text-sm text-gray-500 mt-1">I want to subscribe to delicious home meals.</p>
                    </button>
                    <button 
                      onClick={() => setShowProviderForm(true)}
                      className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-2xl hover:border-amber-500 hover:bg-amber-50 transition-all group"
                    >
                      <ChefHat className="w-10 h-10 text-gray-400 group-hover:text-amber-500 mb-3 transition-colors" />
                      <h4 className="font-bold text-gray-900 group-hover:text-amber-600">Provide Food</h4>
                      <p className="text-sm text-gray-500 mt-1">I want to sell my home cooked meals.</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-900">Business Details</h3>
                    <p className="text-gray-500 mt-1">Almost there! We need a few more details to verify your kitchen.</p>
                  </div>
                  <form onSubmit={handleProviderSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-5 w-5 text-gray-400" /></div>
                        <input name="businessName" required type="text" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-amber-500 outline-none transition-all" placeholder="Maa Ka Pyaar Tiffins" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">FSSAI Certificate Document (Image/PDF)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FileText className="h-5 w-5 text-gray-400" /></div>
                        <input name="fssaiFile" required type="file" accept="image/*,application/pdf" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CreditCard className="h-5 w-5 text-gray-400" /></div>
                          <input name="bankAccount" required type="text" className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-amber-500 outline-none transition-all" placeholder="0000000000" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                        <input name="ifscCode" required type="text" className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-amber-500 outline-none transition-all" placeholder="SBIN0001234" />
                      </div>
                    </div>
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all mt-4">Complete Registration</motion.button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
