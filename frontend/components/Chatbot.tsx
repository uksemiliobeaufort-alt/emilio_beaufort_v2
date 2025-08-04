"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles, ChevronUp } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGreetingNotification, setShowGreetingNotification] = useState(false);
  const [isChatbotEnabled, setIsChatbotEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for cookie consent and enable chatbot
  useEffect(() => {
    const checkCookieConsent = () => {
      const hasConsented = localStorage.getItem("emilio-beaufort-cookies-consent");
      // Enable chatbot if user has made any choice (accept or decline)
      if (hasConsented === 'accepted' || hasConsented === 'declined') {
        setIsChatbotEnabled(true);
      }
    };

    // Check immediately
    checkCookieConsent();

    // Listen for storage changes (when cookie consent is given)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "emilio-beaufort-cookies-consent" && (e.newValue === 'accepted' || e.newValue === 'declined')) {
        setIsChatbotEnabled(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCookieConsent = () => {
      setIsChatbotEnabled(true);
    };

    window.addEventListener('cookieConsentAccepted', handleCookieConsent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cookieConsentAccepted', handleCookieConsent);
    };
  }, []);

  // Show greeting notification on first load (only after cookie consent)
  useEffect(() => {
    const checkAndShowGreeting = () => {
      const hasSeenGreeting = sessionStorage.getItem('chatbot-greeting-shown');
      const hasConsented = localStorage.getItem("emilio-beaufort-cookies-consent");
      
      // Only show if user has made any choice (accept or decline) and greeting hasn't been shown
      if (!hasSeenGreeting && (hasConsented === 'accepted' || hasConsented === 'declined')) {
        setTimeout(() => {
          setShowGreetingNotification(true);
          sessionStorage.setItem('chatbot-greeting-shown', 'true');
          
          // Auto hide after 8 seconds
          setTimeout(() => {
            setShowGreetingNotification(false);
          }, 8000);
        }, 3000); // Show after 3 seconds
      }
    };

    // Check immediately
    checkAndShowGreeting();

    // Also listen for cookie consent events
    const handleCookieConsent = () => {
      // Wait a bit for localStorage to update, then check again
      setTimeout(checkAndShowGreeting, 100);
    };

    window.addEventListener('cookieConsentAccepted', handleCookieConsent);

    return () => {
      window.removeEventListener('cookieConsentAccepted', handleCookieConsent);
    };
  }, []);

  // Initialize with greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingMessage: Message = {
        id: '1',
        text: "👋 Hello Welcome to Emilio Beaufort\n💬 How can I assist you?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    return "CONTACT_BUTTONS:💼 For product related queries or any inquiries, you can contact our sales team! 📞📧";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render anything if chatbot is not enabled
  if (!isChatbotEnabled) {
    return null;
  }

  return (
    <>
             {/* Greeting Notification */}
       <AnimatePresence>
         {showGreetingNotification && (
           <motion.div
             initial={{ opacity: 0, y: 20, scale: 0.8 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: 20, scale: 0.8 }}
             transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
             className="fixed bottom-16 right-4 left-4 sm:bottom-20 sm:right-6 sm:left-auto z-50 max-w-sm"
           >
             <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-100 p-4 sm:p-6 relative">
              
                             {/* Header */}
               <div className="flex items-center space-x-3 mb-3">
                 <div className="bg-gradient-to-r from-gray-800 to-black p-2 rounded-full">
                   <Bot className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <h3 className="font-serif font-bold text-gray-900">Emilio Beaufort AI</h3>
                   <p className="text-xs body-premium text-gray-500">Online • Ready to help</p>
                 </div>
               </div>
              
                             {/* Message */}
               <p className="text-sm body-premium text-gray-700 mb-4">
                 👋 Hi there! Need help with our premium hair extensions? I'm here to assist you 24/7!
               </p>
              
                             {/* Action button */}
               <button
                 onClick={() => {
                   setShowGreetingNotification(false);
                   setIsOpen(true);
                 }}
                 className="w-full bg-gradient-to-r from-gray-800 to-black text-white py-2 px-4 rounded-xl text-sm font-sans-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
               >
                 Start Chat
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

             {/* Modern Chatbot Toggle Button */}
       <motion.button
         onClick={() => setIsOpen(!isOpen)}
         className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-gray-800 to-black text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl hover:shadow-xl sm:hover:shadow-3xl transition-all duration-300 hover:scale-110 border border-white/20 backdrop-blur-sm"
         whileHover={{ scale: 1.1, y: -2 }}
         whileTap={{ scale: 0.95 }}
                    style={{
             boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0,0,0,0.1)'
           }}
       >
         {isOpen ? (
           <X className="w-5 h-5 sm:w-6 sm:h-6" />
         ) : (
           <div className="relative">
             <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
             <motion.div
               className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full"
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
             />
           </div>
         )}
       </motion.button>

             {/* Modern Chatbot Window */}
       <AnimatePresence>
         {isOpen && (
           <motion.div
             initial={{ opacity: 0, scale: 0.8, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.8, y: 20 }}
             transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
             className="fixed bottom-20 right-4 left-4 sm:bottom-24 sm:right-6 sm:left-auto z-40 w-auto sm:w-80 h-80 sm:h-96 bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100 flex flex-col overflow-hidden backdrop-blur-sm"
             style={{
               boxShadow: '0 15px 45px rgba(0,0,0,0.15), 0 6px 20px rgba(0, 0, 0, 0.1)'
             }}
           >
                         {/* Modern Header */}
             <div className="bg-gradient-to-r from-gray-800 to-black text-white p-3 sm:p-4 flex items-center justify-between relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
               <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10"></div>
               
                               <div className="flex items-center space-x-2 sm:space-x-3 relative z-10">
                  <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-base sm:text-lg">Emilio Beaufort AI</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs body-premium text-white/80">Online</span>
                    </div>
                  </div>
                </div>
             </div>

                         {/* Messages Container with Modern Scrollbar */}
             <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
                             {messages.map((message) => (
                 <motion.div
                   key={message.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.3 }}
                   className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                                       <div
                      className={`max-w-[280px] sm:max-w-xs px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-gray-800 to-black text-white shadow-lg'
                          : 'bg-gray-50 text-gray-800 border border-gray-100 shadow-sm'
                      }`}
                    >
                                           {message.text.startsWith('CONTACT_BUTTONS:') ? (
                        <div>
                                                                             <p className="text-xs sm:text-sm body-premium leading-relaxed mb-2 sm:mb-3 text-gray-800">
                          {message.text.replace('CONTACT_BUTTONS:', '')}
                        </p>
                           <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                             <button
                               onClick={() => {
                                 window.open('mailto:hello@emiliobeaufort.com', '_blank');
                               }}
                                                               className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-gray-800 to-black text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg text-xs font-sans-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                             >
                               <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                               </svg>
                               Email
                             </button>
                             <button
                               onClick={() => {
                                 window.open('tel:+918962648358', '_blank');
                               }}
                                                               className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg text-xs font-sans-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                             >
                               <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                               </svg>
                               Call
                             </button>
                           </div>
                        </div>
                                             ) : (
                                                   <p className={`text-xs sm:text-sm body-premium leading-relaxed ${message.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>{message.text}</p>
                       )}
                     
                                           <span className={`text-xs body-premium mt-1 block ${message.sender === 'user' ? 'text-white/80' : 'text-gray-600'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                 </motion.div>
               ))}
              
                             {/* Modern Typing Indicator */}
               {isTyping && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex justify-start"
                 >
                   <div className="bg-gray-50 text-gray-800 px-4 py-3 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="flex items-center space-x-2">
                       <div className="flex space-x-1">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                       </div>
                                               <span className="text-xs body-premium text-gray-700">AI is typing...</span>
                     </div>
                   </div>
                 </motion.div>
                              )}
               
               {/* Auto-scroll anchor */}
               <div ref={messagesEndRef} />
              </div>

             

                           {/* Modern Input Area */}
             <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50">
               <div className="flex space-x-2 sm:space-x-3">
                 <div className="flex-1 relative">
                                       <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-xs sm:text-sm bg-white shadow-sm text-gray-900 placeholder-gray-500"
                    />
                   <Sparkles className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                 </div>
                 <button
                   onClick={handleSendMessage}
                   disabled={!inputValue.trim()}
                   className="bg-gradient-to-r from-gray-800 to-black text-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                 >
                   <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 