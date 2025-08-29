"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, X, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { name: "Philosophy", href: "#philosophy" },
  { name: "The House", href: "#house" },
  { name: "Journal", href: "#journal" },
      { name: "Our People ", href: "#team" },
  { name: "Products", href: "/products" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const isAuthPage = pathname === "/auth";

  const { user, updateUser } = useAuth();
  const [instantUser, setInstantUser] = useState(user);

  // 🔹 Load cached user instantly on mount
  useEffect(() => {
    const cached = localStorage.getItem("authUser");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setInstantUser(parsed);
        if (!user) updateUser(parsed); // keep AuthContext synced
      } catch {
        localStorage.removeItem("authUser");
      }
    }
  }, [user, updateUser]);

  // NEW: Sync instantUser immediately when AuthContext user changes
  useEffect(() => {
    if (user) {
      setInstantUser(user);
    }
  }, [user]);
   // 🔹 Listen for 'auth-updated' (same-tab) and 'storage' (cross-tab) events
useEffect(() => {
  const sync = () => {
    const cached = localStorage.getItem("authUser");
    if (cached) {
      try {
        setInstantUser(JSON.parse(cached));
      } catch {
        setInstantUser(null as any);
      }
    } else {
      setInstantUser(null as any);
    }
  };

  window.addEventListener("auth-updated", sync); // same-tab instant update
  window.addEventListener("storage", sync);      // cross-tab update

  return () => {
    window.removeEventListener("auth-updated", sync);
    window.removeEventListener("storage", sync);
  };
}, []);

  // Always prefer live `user`, fallback to instant cached
  const currentUser = user || instantUser;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = async (href: string) => {
    setIsOpen(false);

    if (href.startsWith("#")) {
      if (isHomePage) {
        // On homepage, scroll to section
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          // Update URL hash for better UX
          window.history.pushState(null, '', href);
        }
      } else {
        // Not on homepage, navigate to homepage with section
        await router.push(`/${href}`);
      }
      return;
    }
    
    // Regular navigation
    await router.push(href);
  };

  const handleLogoClick = async () => {
    if (isHomePage) {
      const heroSection = document.querySelector("#hero");
      if (heroSection) heroSection.scrollIntoView({ behavior: "smooth" });
    } else {
      await router.push("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePartnerClick = async () => {
    setIsOpen(false);
    if (isHomePage) {
      // Trigger opening the partnership form via hash change
      if (window.location.hash !== '#partnership-form') {
        window.location.hash = '#partnership-form';
      } else {
        // Force hashchange if already on the same hash
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    } else {
      await router.push("/#partnership-form");
    }
  };

  const handleProfileClick = () => {
    if (currentUser) {
      router.push("/profile");
    } else {
      router.push(`/auth?from=${pathname}`);
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-premium ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-premium shadow-premium"
          : "bg-gradient-to-b from-black/60 via-black/40 to-black/20 backdrop-blur-md border-b border-white/10"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="w-full px-4 xs:px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
          {/* Logo - Left */}
          <motion.div
            className={`heading-premium text-lg xs:text-xl sm:text-2xl lg:text-3xl cursor-pointer transition-colors duration-300 flex-shrink-0 ${
              (isHomePage && !isScrolled) || isAuthPage
                ? "text-white drop-shadow-sm"
                : "text-premium"
            }`}
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Emilio Beaufort
          </motion.div>





          {/* Center Navigation - All Options Horizontally */}
          <div className="hidden xl:flex items-center space-x-2 xs:space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8 xl:space-x-10 2xl:space-x-12">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                className={`font-sans-medium text-xs xs:text-sm sm:text-sm md:text-base lg:text-lg transition-premium relative group whitespace-nowrap ${
                  (isHomePage && !isScrolled) || isAuthPage
                    ? "text-white hover:text-gold drop-shadow-sm"
                    : "text-premium hover:text-gold"
                }`}
                onClick={() => handleNavigation(item.href)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{ y: -2 }}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-premium group-hover:w-full"></span>
              </motion.button>
            ))}
          </div>

          {/* Right Side - Partner Button + Profile Icon + Hamburger */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
            {/* Partner With Us Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="hidden xl:block"
            >
              <Button
                onClick={handlePartnerClick}
                className="btn-primary-black text-xs xs:text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm px-2 xs:px-2.5 sm:px-3 md:px-3 lg:px-4 py-1 xs:py-1.5 sm:py-1.5 md:py-2"
                size="sm"
              >
                Partner With Us
              </Button>
            </motion.div>

            {/* Profile Icon - Extra large screens and up */}
            <div className="hidden xl:block cursor-pointer" onClick={handleProfileClick}>
              <AnimatePresence mode="wait">
                {currentUser?.photoURL ? (
                  // ✅ Show uploaded profile picture
                  <motion.img
                    key="avatar"
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "Profile"}
                    className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full object-cover border border-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : currentUser?.displayName ? (
                  // ✅ No picture → use first letter of displayName
                  <motion.div
                    key="initial-name"
                    className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs xs:text-sm font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {currentUser.displayName[0].toUpperCase()}
                  </motion.div>
                ) : currentUser?.email ? (
                  // ✅ No picture & no name → use first letter of email
                  <motion.div
                    key="initial-email"
                    className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs xs:text-sm font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {currentUser.email[0].toUpperCase()}
                  </motion.div>
                ) : (
                  // ✅ Fallback icon
                  <motion.div
                    key="icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <UserCircle
                      className={`w-5 h-5 xs:w-6 xs:h-6 ${
                        (isHomePage && !isScrolled) || isAuthPage
                          ? "text-white hover:text-gray-200 drop-shadow-sm"
                          : "text-premium hover:text-gold"
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger Menu - Screens smaller than 946x673 */}
            <div className="flex xl:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button
                    className={`transition-premium p-1 ${
                      (isHomePage && !isScrolled) || isAuthPage
                        ? "text-white hover:text-gold drop-shadow-sm"
                        : "text-premium hover:text-gold"
                    }`}
                  >
                    <Menu className="w-5 h-5 xs:w-6 xs:h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[280px] xs:w-[320px] sm:w-[360px] bg-white border-l border-premium p-0"
                  hideCloseButton
                >
                  <SheetHeader className="p-4 xs:p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="font-serif text-lg xs:text-xl">Menu</SheetTitle>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-900 transition-premium rounded-full hover:bg-gray-100 p-1"
                      >
                        <X className="w-4 h-4 xs:w-5 xs:h-5" />
                      </button>
                    </div>
                  </SheetHeader>
                  <nav
                    className="flex flex-col p-4 xs:p-6"
                    aria-label="Mobile Navigation"
                  >
                    {navItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className="font-sans-medium text-base xs:text-lg text-premium hover:text-gold transition-premium text-left py-3 xs:py-4 border-b border-gray-100 last:border-none"
                      >
                        {item.name}
                      </button>
                    ))}
                    
                    {/* Profile Section in Mobile Menu */}
                    <div className="py-3 xs:py-4 border-b border-gray-100">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleProfileClick();
                        }}
                        className="font-sans-medium text-base xs:text-lg text-premium hover:text-gold transition-premium text-left w-full text-left"
                      >
                        {currentUser ? (currentUser.displayName || currentUser.email || "Profile") : "Sign In"}
                      </button>
                      {currentUser && (
                        <p className="text-sm text-gray-500 mt-1">
                          {currentUser.email}
                        </p>
                      )}
                    </div>
                    
                    {/* Partner With Us Button */}
                    <div className="py-3 xs:py-4">
                      <Button
                        onClick={() => {
                          setIsOpen(false);
                          handlePartnerClick();
                        }}
                        className="btn-primary-premium w-full py-3 xs:py-4 text-sm xs:text-base"
                      >
                        Partner With Us
                      </Button>
                    </div>
                    
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
