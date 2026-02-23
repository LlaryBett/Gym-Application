import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaXmark, FaWhatsapp, FaEnvelope, FaComments, FaUserCheck } from 'react-icons/fa6';
import LogoImage from '../../public/PowerGym-Logo (1).svg';
import chatService from '../services/chatService';
import { useAuth } from '../hooks/authHooks';

const FloatingHelpline = () => {
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Get authenticated user
  const { user, isAuthenticated } = useAuth();

  // Initialize chat service with authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      chatService.initUser(user);
      setUserName(user.name || 'Member');
    }
  }, [isAuthenticated, user]);

  // Load chat history when component mounts
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Load chat history from Redis
  const loadChatHistory = async () => {
    console.log('🔄 Loading chat history...');
    const history = await chatService.getHistory();
    console.log('📚 History received in component:', history);
    
    if (history && history.length > 0) {
      console.log(`✅ Setting ${history.length} messages to state`);
      setMessages(history);
    } else {
      console.log('⚠️ No history found');
      setMessages([]);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debug: Log when messages change
  useEffect(() => {
    console.log('💬 Current messages in state:', messages);
  }, [messages]);

  // Add message to chat
  const addMessage = (text, sender) => {
    const newMessage = { 
      id: `msg-${Date.now()}-${Math.random()}`,
      text, 
      sender,
      timestamp: new Date().toISOString()
    };
    console.log('📝 Adding message:', newMessage);
    setMessages(prev => [...prev, newMessage]);
  };

  // Handle user message
  const handleUserMessage = async (userMsg) => {
    // Add user message to UI
    addMessage(userMsg, 'user');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Send to backend via chat service
      const senderName = isAuthenticated && user?.name 
        ? `${user.name} (Member)` 
        : (userName || 'Guest');
      
      const response = await chatService.sendMessage(userMsg, senderName);
      
      // Hide typing indicator
      setIsTyping(false);
      
      // Update session ID if provided
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      
      // Add bot responses to UI
      if (response.responses && response.responses.length > 0) {
        response.responses.forEach(botMessage => {
          addMessage(botMessage, 'bot');
        });
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      addMessage("Sorry, I'm having trouble connecting. Please try again.", 'bot');
    }
  };

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // If not authenticated and no user name yet, treat first message as name
    if (!isAuthenticated && !userName) {
      setUserName(message);
      handleUserMessage(message);
    } else {
      handleUserMessage(message);
    }
    
    setMessage('');
  };

  const resetChat = async () => {
    await chatService.clearSession();
    setMessages([]);
    setUserName('');
    setMessage('');
    setSessionId(null);
  };

  const handleClose = () => {
    setShowChat(false);
  };

  const handleCall = () => {
    window.location.href = 'tel:+254712345678';
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/254712345678', '_blank');
  };

  // Initialize chat with personalized greeting
  useEffect(() => {
    if (showChat && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        if (isAuthenticated && user) {
          addMessage(`Welcome back, ${user.name}! How can I help you today?`, 'bot');
        } else {
          addMessage("Hi! Welcome to PowerGym. What's your name?", 'bot');
        }
        setIsTyping(false);
      }, 1000);
    }
  }, [showChat, isAuthenticated, user]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (isAuthenticated && user?.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    if (userName) {
      const nameParts = userName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  // Get a consistent color based on user name
  const getUserAvatarColor = () => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    
    const name = isAuthenticated && user?.name ? user.name : (userName || 'User');
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <>
      {/* Chat Background Overlay */}
      {showChat && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={handleClose}
        />
      )}

      {/* Chat Window */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
          {/* Chat Header */}
          <div className="bg-orange-500 text-white p-3 flex items-center gap-2">
            <img src={LogoImage} alt="PowerGym" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">PowerGym Support</h3>
              <div className="flex items-center gap-1">
                <p className="text-xs text-orange-100">Online • AI Powered</p>
                {isAuthenticated && (
                  <span className="bg-green-400 text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <FaUserCheck size={6} /> Member
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition"
            >
              <FaXmark className="text-sm" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3 min-h-[300px] max-h-[300px]">
            {/* Display all messages */}
            {messages.map((msg) => {
              console.log('🎨 Rendering message:', msg);
              return (
                <div key={msg.id}>
                  {msg.sender === 'bot' ? (
                    <div className="flex items-start gap-2">
                      <img src={LogoImage} alt="PowerGym" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      <div className="bg-white rounded-2xl rounded-tl-none p-2 max-w-[80%] shadow-sm">
                        <p className="text-xs text-gray-800">{msg.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 justify-end">
                      <div className="bg-orange-500 rounded-2xl rounded-tr-none p-2 max-w-[80%] shadow-sm">
                        <p className="text-xs text-white">{msg.text}</p>
                      </div>
                      <div className={`w-7 h-7 rounded-full ${getUserAvatarColor()} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                        {getUserInitials()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <img src={LogoImage} alt="PowerGym" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={!isAuthenticated && !userName ? "Your name..." : "Type a message..."}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-orange-500 text-xs"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition text-xs font-medium"
              >
                Send
              </button>
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="p-3 bg-white border-t flex justify-around">
            <button
              onClick={handleCall}
              className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-700 transition"
              title="Call us"
            >
              <FaPhone className="text-sm" />
              <span className="text-[10px]">Call</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-1 text-green-600 hover:text-green-700 transition"
              title="WhatsApp"
            >
              <FaWhatsapp className="text-sm" />
              <span className="text-[10px]">WhatsApp</span>
            </button>
            <button
              onClick={() => window.location.href = 'mailto:support@powergym.com'}
              className="flex flex-col items-center gap-1 text-purple-600 hover:text-purple-700 transition"
              title="Email"
            >
              <FaEnvelope className="text-sm" />
              <span className="text-[10px]">Email</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div 
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
        onClick={() => setShowChat(!showChat)}
      >
        <div className="flex items-center justify-center w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
          {showChat ? (
            <FaXmark className="text-xl" />
          ) : (
            <div className="relative">
              <FaComments className="text-2xl" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FloatingHelpline;