import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { getAuth } from "firebase/auth";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { reload } from "firebase/auth"; 

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  featured_image_url?: string;
}

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";
import { useAuth } from '../contexts/AuthContext';
import { useBag } from '@/components/BagContext';
import confetti from 'canvas-confetti'; 

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

// Map Firebase Auth error codes to user-friendly messages
const getAuthErrorMessage = (code: string): string => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please log in.";
    case "auth/invalid-email":
      return "The email address is not valid.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before finishing.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/unauthorized-domain":
      return "Authentication is not allowed from this domain. Please contact the administrator to add this domain to the authorized list.";
    default:
      return "Something went wrong. Please try again.";
  }
};

interface AuthPagesProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const AuthPages = ({ isOpen = false, onClose, onSuccess }: AuthPagesProps = {}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromPath = searchParams?.get('from') || '/';
  const { updateUser } = useAuth();
  
  // Get bag context for automatic product addition
  let bagContext;
  try {
    bagContext = useBag();
  } catch {
    bagContext = null;
  } 

  const [currentPage, setCurrentPage] = useState('login');
  const [loginInput, setLoginInput] = useState('');
  const [signupInput, setSignupInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const loginInputRef = useRef<HTMLInputElement>(null);
  const signupInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const signupPasswordRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Handle exit button click
  const handleExit = () => {
    if (onClose) {
      onClose();
    } else {
      router.push(fromPath);
    }
  };

  // Handle automatic product addition after login
  const handleAutomaticProductAddition = () => {
    if (typeof window !== 'undefined' && bagContext) {
      const pendingProduct = localStorage.getItem('pendingProduct');
      if (pendingProduct) {
        try {
          const productData = JSON.parse(pendingProduct);
          const { quantity, ...productInfo } = productData;
          
          // Add product to bag with confetti effect
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          
          for (let i = 0; i < quantity; i++) {
            bagContext.addToBag(productInfo);
          }
          
          // Clear the pending product
          localStorage.removeItem('pendingProduct');
          
          // Show success message
          toast.success(`Added ${quantity} item(s) to your bag!`);
          
        } catch (error) {
          console.error('Error adding pending product to bag:', error);
          localStorage.removeItem('pendingProduct');
        }
      }
    }
  };

  // Handle checkout form opening after login
  const handleCheckoutFormOpen = () => {
    // Set flag to open checkout form when user returns to products page
    if (typeof window !== 'undefined') {
      localStorage.setItem('openCheckoutAfterAuth', 'true');
    }
    router.push('/products'); // Redirect to products page where checkout modal can be opened
  };

  // Save minimal user data to localStorage
  const saveUser = (user: any) => {
    if (!user) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authUser");
      }
      updateUser(null as any);
      return;
    }

    const minimal = {
      uid: user.uid,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("authUser", JSON.stringify(minimal));
    }
    //  Now passes full object so Navbar/Profile update instantly
    updateUser(minimal);
    // NEW: broadcast immediately
    try { window.dispatchEvent(new Event("auth-updated")); } catch {}
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setConfirmPassword(value);
    setTimeout(() => {
      if (confirmPasswordRef.current) {
        confirmPasswordRef.current.focus();
        confirmPasswordRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  // Check if passwords match
  const passwordsMatch = useMemo(() => {
    return signupPassword.length > 0 && confirmPassword.length > 0 && signupPassword === confirmPassword;
  }, [signupPassword, confirmPassword]);

  const passwordsDontMatch = useMemo(() => {
    return signupPassword.length > 0 && confirmPassword.length > 0 && signupPassword !== confirmPassword;
  }, [signupPassword, confirmPassword]);

  //  Email Login
  const handleEmailLogin = async () => {
    if (!loginInput || !loginPassword) {
      toast.error("Please enter both email and password.");
      return;
    }
    try {
      await setPersistence(auth, browserLocalPersistence);
      const cred = await signInWithEmailAndPassword(
        auth,
        loginInput,
        loginPassword
      );

      //  Update AuthContext + storage via saveUser
      saveUser(cred.user);

      //  Broadcast to update UI instantly
      try { window.dispatchEvent(new Event("auth-updated")); } catch {}

      // Handle different actions based on where user came from
      if (fromPath === 'products') {
        handleAutomaticProductAddition();
      } else if (fromPath === 'bag') {
        handleCheckoutFormOpen();
      }

      toast.success("Login successful!");
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to products page for bag users, otherwise use fromPath
        if (fromPath === 'bag') {
          router.replace('/products');
        } else {
          router.replace(fromPath);
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(getAuthErrorMessage(err.code));
    }
  };

  //  Email Signup
  const handleEmailSignup = async () => {
    if (signupPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const cred = await createUserWithEmailAndPassword(
        auth,
        signupInput,
        signupPassword
      );

      const finalName = name.trim();
      if (finalName) {
        await updateProfile(cred.user, { displayName: finalName });
      }

      // Send verification email after signup
      await sendEmailVerification(cred.user);
      toast.success("Account created! Please check your email for verification.");

      //  Save to AuthContext + storage via saveUser
      saveUser({
        ...cred.user,
        displayName: finalName || cred.user.displayName || "",
      });

      //  Broadcast to update UI instantly
      try { window.dispatchEvent(new Event("auth-updated")); } catch {}

      // Handle different actions based on where user came from
      if (fromPath === 'products') {
        handleAutomaticProductAddition();
      } else if (fromPath === 'bag') {
        handleCheckoutFormOpen();
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.replace(fromPath);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(getAuthErrorMessage(err.code));
    }
  };

  useEffect(() => {
    // Make sure persistence is always set to local storage
    setPersistence(auth, browserLocalPersistence)
      .then(() => console.log("Auth persistence set to local"))
      .catch((err) => console.error("Error setting persistence:", err));

    // Mark that the app is running on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      saveUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const q = query(
          collection(firestore, "blog_posts"),
          orderBy("created_at", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          setLatestPost({
            id: doc.id,
            title: data.title || "",
            slug: data.slug || "",
            content: data.content || "",
            featured_image_url: data.featured_image_url || "",
          });
        }
      } catch (err) {
        console.error("Error fetching latest blog post:", err);
      }
    };

    fetchLatestPost();
  }, []);

  //  Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await setPersistence(auth, browserLocalPersistence);
      const cred = await signInWithPopup(auth, provider);

      //  Save to AuthContext + storage via saveUser
      saveUser(cred.user);

      //  Broadcast to update UI instantly
      try { window.dispatchEvent(new Event("auth-updated")); } catch {}

      // Handle different actions based on where user came from
      if (fromPath === 'products') {
        handleAutomaticProductAddition();
      } else if (fromPath === 'bag') {
        handleCheckoutFormOpen();
      }

      toast.success("Google login successful!");
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to products page for bag users, otherwise use fromPath
        if (fromPath === 'bag') {
          router.replace('/products');
        } else {
          router.replace(fromPath);
        }
      }
    } catch (err: any) {
      console.error("Google login failed", err);
      toast.error(getAuthErrorMessage(err.code));
    }
  };

  const handlePasswordReset = async () => {
    try {
      if (!resetEmail) {
        toast.error("Please enter your email.");
        return;
      }

      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent.");
      setShowResetForm(false); // hide the form after success
      setResetEmail('');
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email.");
    }
  };

  const isEmail = useCallback((input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  }, []);

  const isPhone = useCallback((input: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(input.replace(/\s/g, ''));
  }, []);

  const getInputType = useCallback((input: string): 'email' | 'phone' | 'unknown' => {
    if (!input || input.length === 0) return 'unknown';
    if (input.includes('@') || isEmail(input)) return 'email';
    if (/^\d/.test(input) || isPhone(input)) return 'phone';
    return 'unknown';
  }, [isEmail, isPhone]);

  const loginInputType = useMemo(() => getInputType(loginInput), [loginInput, getInputType]);
  const signupInputType = useMemo(() => getInputType(signupInput), [signupInput, getInputType]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setName(value);
    setTimeout(() => {
      if (nameRef.current) {
        nameRef.current.focus();
        nameRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const handleLoginPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setLoginPassword(value);
    setTimeout(() => {
      if (loginPasswordRef.current) {
        loginPasswordRef.current.focus();
        loginPasswordRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const handleSignupPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setSignupPassword(value);
    setTimeout(() => {
      if (signupPasswordRef.current) {
        signupPasswordRef.current.focus();
        signupPasswordRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setLoginInput(value);
    setTimeout(() => {
      if (loginInputRef.current) {
        loginInputRef.current.focus();
        loginInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    setSignupInput(value);
    setTimeout(() => {
      if (signupInputRef.current) {
        signupInputRef.current.focus();
        signupInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {isVisible ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      )}
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

                                       const LoginPage = () => (
       <div className="min-h-screen relative overflow-hidden" style={{
         background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 8%, #3a3020 18%, #4a4028 28%, #5a5030 40%, #6a6038 55%, #7a7040 70%, #8a8048 80%, #2a2a2a 90%, #000000 100%)',
         marginTop: '0',
         paddingTop: '60px' // Reduced top padding for closer spacing
       }}>
         {/* Main content container */}
         <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8" style={{ marginTop: '0' }}>
          <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[calc(100vh-80px)] flex items-center">
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl overflow-hidden relative w-full max-h-[calc(90vh-80px)] flex flex-col">
            {/* Close button - positioned inside the white modal */}
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-black z-50 hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center"
              onClick={handleExit}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
            <div className="flex flex-col lg:flex-row h-full">
              
              {/* Left Side - Auth Form */}
              <div className="w-full lg:w-1/2 p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center flex-1 min-h-0">
                <div className="w-full max-w-sm space-y-4">
                  <div className="text-center">
                    <div className="mb-2 sm:mb-4">
                      <img src="https://mzvuuvtckcimzemivltz.supabase.co/storage/v1/object/public/the-house/EM.jpgp" alt="Logo" className="mx-auto h-6 sm:h-8 md:h-10 lg:h-12 w-auto" />
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2" style={{ fontFamily: 'serif' }}>LOGIN</h2>
                    <p className="text-xs sm:text-sm md:text-base text-black mb-3 sm:mb-4 px-1 sm:px-2">
                      If you have an account with us, please log in.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      ref={loginInputRef}
                      type="text"
                      value={loginInput}
                      onChange={handleLoginInputChange}
                      placeholder="Email address (abc@gmail.com)"
                      className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />

                    <div className="relative">
                      {loginInput.length > 0 && (
                        <div className="relative space-y-2">
                          {/* Password input (shown only for email or unknown) */}
                          {(loginInputType === 'email' || loginInputType === 'unknown') && (
                            <div className="relative">
                              <input
                                ref={loginPasswordRef}
                                type={showLoginPassword ? "text" : "password"}
                                value={loginPassword}
                                onChange={handleLoginPasswordChange}
                                placeholder="Password"
                                className="w-full px-3 py-2 sm:py-2.5 pr-10 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                              >
                                <EyeIcon isVisible={showLoginPassword} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (loginInputType === 'email') {
                          await handleEmailLogin();
                        } 
                      }}
                      className="w-full bg-black text-white py-2 sm:py-2.5 px-4 text-sm sm:text-base rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-200 font-medium"
                    >
                      SIGN IN
                    </button>

                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full bg-white border border-gray-300 text-gray-700 py-2 sm:py-2.5 px-4 text-sm sm:text-base rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-200 font-medium flex items-center justify-center"
                    >
                      <GoogleIcon />
                      <span className="ml-2">Continue with Google</span>
                    </button>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-xs sm:text-sm text-gray-600">
                       Don't have an account?{' '}
                       <button
                         onClick={(e) => {
                           e.preventDefault();
                           setCurrentPage('signup');
                         }}
                         className="text-black hover:text-gray-700 font-medium"
                        >
                        Create an account
                     </button>
                    </p>

                    <button
                      onClick={() => setShowResetForm(true)}
                      className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Illustration - Hidden on small screens */}
              <div className="hidden lg:block lg:w-1/2 relative bg-white flex items-center justify-center p-4 lg:p-8 flex-1 min-h-0">
                <img
                  src={latestPost?.featured_image_url || "/blog.png"}
                  alt={latestPost?.title || "Illustration"}
                  className="w-full h-full object-cover rounded-lg lg:rounded-xl"
                  style={{ 
                    maxHeight: '100%',
                    maxWidth: '100%'
                  }}
                />

                {/* Info box with close button - responsive positioning */}
                <div className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 bg-white rounded-lg lg:rounded-xl p-2 lg:p-4 shadow-lg max-w-40 lg:max-w-52">
                  {latestPost ? (
                    <>
                      <div className="flex justify-between items-start mb-1 lg:mb-2">
                        <h3 className="font-bold text-gray-900 text-xs lg:text-sm line-clamp-2">
                          {latestPost.title}
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600 ml-1">
                          <CloseIcon />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-1 lg:mb-2 line-clamp-3">
                        {latestPost.content?.replace(/<[^>]+>/g, "").slice(0, 60)}...
                      </p>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-blue-400"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-purple-400"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-green-400"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-1 lg:mb-2">
                        <h3 className="font-bold text-gray-900 text-xs lg:text-sm">
                          Find Your Inner Balance
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600 ml-1">
                          <CloseIcon />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-1 lg:mb-2">
                        Helping you achieve clarity, harmony, and personal growth.
                      </p>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-blue-400"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-purple-400"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-green-400"></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

                       const SignupPage = () => (
       <div className="min-h-screen relative overflow-hidden" style={{
         background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 8%, #3a3020 18%, #4a4028 28%, #5a5030 40%, #6a6038 55%, #7a7040 70%, #8a8048 80%, #2a2a2a 90%, #000000 100%)',
         marginTop: '0',
         paddingTop: '60px' // Reduced top padding for closer spacing
       }}>
         {/* Main content container */}
         <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8" style={{ marginTop: '0' }}>
          <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[calc(100vh-80px)] flex items-center">
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl overflow-hidden relative w-full max-h-[calc(90vh-80px)] flex flex-col">
            {/* Close button - positioned inside the white modal */}
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-black z-50 hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center"
              onClick={handleExit}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
            <div className="flex flex-col lg:flex-row h-full">
              
              {/* Left Side - Signup Form */}
              <div className="w-full lg:w-1/2 p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center flex-1 min-h-0">
                <div className="w-full max-w-sm space-y-4">
                  <div className="text-center">
                    <div className="mb-2 sm:mb-4">
                      <img src="https://mzvuuvtckcimzemivltz.supabase.co/storage/v1/object/public/the-house/EM.jpgp" alt="Logo" className="mx-auto h-6 sm:h-8 md:h-10 lg:h-12 w-auto" />
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2" style={{ fontFamily: 'serif' }}>CREATE AN ACCOUNT</h2>
                    <p className="text-xs sm:text-sm md:text-base text-black mb-3 sm:mb-4 px-1 sm:px-2">
                      Enter your information below to proceed. If you already have an account, please log in instead.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      ref={nameRef}
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Name"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />

                    <input
                      ref={signupInputRef}
                      type="text"
                      value={signupInput}
                      onChange={handleSignupInputChange}
                      placeholder="Email address (abc@gmail.com)"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />

                    {signupInput.length > 0 && (
                      <div className="space-y-3 relative">
                        {/* Password input (shown only for email or unknown) */}
                        {(signupInputType === 'email' || signupInputType === 'unknown') && (
                          <>
                            <div className="relative">
                              <input
                                ref={signupPasswordRef}
                                type={showSignupPassword ? "text" : "password"}
                                value={signupPassword}
                                onChange={handleSignupPasswordChange}
                                placeholder="Password"
                                className="w-full px-3 py-2 pr-10 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowSignupPassword(!showSignupPassword)}
                              >
                                <EyeIcon isVisible={showSignupPassword} />
                              </button>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="relative">
                              <input
                                ref={confirmPasswordRef}
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                placeholder="Confirm Password"
                                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                  passwordsMatch ? 'border-green-500' : 
                                  passwordsDontMatch ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                                {passwordsMatch && <CheckIcon />}
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  <EyeIcon isVisible={showConfirmPassword} />
                                </button>
                              </div>
                            </div>

                            {/* Password match status message */}
                            {passwordsDontMatch && (
                              <p className="text-red-500 text-sm">Passwords do not match. Please enter again.</p>
                            )}
                            {passwordsMatch && (
                              <p className="text-green-500 text-sm">Passwords match!</p>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (signupInputType === 'email') {
                          handleEmailSignup();
                        } 
                      }}
                      className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-200 font-medium"
                    >
                      CREATE AN ACCOUNT
                    </button>

                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-200 font-medium flex items-center justify-center"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        onClick={() => setCurrentPage('login')}
                        className="text-black hover:text-gray-700 font-medium"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Illustration - Hidden on small screens */}
              <div className="hidden lg:block lg:w-1/2 relative bg-white flex items-center justify-center p-4 lg:p-8 flex-1 min-h-0">
                <img
                  src={latestPost?.featured_image_url || "/blog.png"}
                  alt={latestPost?.title || "Illustration"}
                  className="w-full h-full object-cover rounded-lg lg:rounded-xl"
                  style={{ 
                    maxHeight: '100%',
                    maxWidth: '100%'
                  }}
                />

                {/* Info box with close button */}
                <div className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 bg-white rounded-lg lg:rounded-xl p-2 lg:p-4 shadow-lg max-w-40 lg:max-w-52">
                  {latestPost ? (
                    <>
                      <div className="flex justify-between items-start mb-1 lg:mb-2">
                        <h3 className="font-bold text-gray-900 text-xs lg:text-sm line-clamp-2">
                          {latestPost.title}
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600 ml-1">
                          <CloseIcon />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-1 lg:mb-2 line-clamp-3">
                        {latestPost.content?.replace(/<[^>]+>/g, "").slice(0, 80)}...
                      </p>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-blue-400"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-purple-400"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-green-400"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-1 lg:mb-2">
                        <h3 className="font-bold text-gray-900 text-xs lg:text-sm">
                          Find Your Inner Balance
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600 ml-1">
                          <CloseIcon />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-1 lg:mb-2">
                        Helping you achieve clarity, harmony, and personal growth. Together, we create lasting change.
                      </p>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-blue-400"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-purple-400"></div>
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-green-400"></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // If used as modal, show conditional rendering
  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ 
        marginTop: '0',
        paddingTop: '60px' // Reduced top padding for closer spacing
      }}>
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[calc(100vh-80px)] flex items-center">
          <div className="w-full h-full max-h-[calc(90vh-80px)] flex flex-col">
            {/* Close button for modal */}
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-black z-50 hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
            {currentPage === 'login' ? <LoginPage /> : <SignupPage />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentPage === 'login' ? <LoginPage /> : <SignupPage />}
      
      {/*  Forgot Password Modal */}
      {showResetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowResetForm(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Reset Your Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={handlePasswordReset}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition"
            >
              Send Reset Email
            </button>
          </div>
        </div>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default AuthPages;