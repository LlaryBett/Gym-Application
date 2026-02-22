import React, { useState, useEffect } from 'react';
import { FaPhone, FaXmark, FaWhatsapp, FaEnvelope, FaComments } from 'react-icons/fa6';
import LogoImage from '../../public/PowerGym-Logo (1).svg';

const FloatingHelpline = () => {
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState('');
  const [step, setStep] = useState('welcome');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Pre-defined conversation flows
  const conversationFlows = {
    greeting: "Hi! Welcome to PowerGym. How can we help you?",
    askName: "Your name?",
    welcome: (name) => `Hi ${name}! How can we help?`,
    options: [
      { id: 'call', text: 'Call us', action: 'call' },
      { id: 'whatsapp', text: 'WhatsApp', action: 'whatsapp' },
      { id: 'email', text: 'Email', action: 'email' }
    ]
  };

  // Simulate typing effect
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  // Add message to chat
  const addMessage = (text, sender, isOption = false) => {
    setMessages(prev => [...prev, { text, sender, isOption }]);
  };

  // Handle user message
  const handleUserMessage = (userMsg) => {
    // Add user message
    addMessage(userMsg, 'user');
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate bot response
    setTimeout(() => {
      if (!userName) {
        addMessage(conversationFlows.askName, 'bot');
        setStep('askName');
      } else if (step === 'askName') {
        setUserName(userMsg);
        addMessage(conversationFlows.welcome(userMsg), 'bot');
        setStep('menu');
      } else if (step === 'menu') {
        // Handle menu responses
        if (userMsg.toLowerCase().includes('call')) {
          handleCall();
        } else if (userMsg.toLowerCase().includes('whatsapp')) {
          handleWhatsApp();
        } else if (userMsg.toLowerCase().includes('email')) {
          window.location.href = 'mailto:support@powergym.com';
        } else {
          addMessage("Please choose an option above", 'bot');
        }
      }
      setIsTyping(false);
    }, 1000);
  };

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    handleUserMessage(message);
    setMessage('');
  };

  const resetChat = () => {
    setMessages([]);
    setUserName('');
    setStep('welcome');
    setMessage('');
  };

  const handleClose = () => {
    setShowChat(false);
    setTimeout(resetChat, 300);
  };

  const handleCall = () => {
    window.location.href = 'tel:+254712345678';
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/254712345678', '_blank');
  };

  // Initialize chat with greeting
  useEffect(() => {
    if (showChat && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        addMessage(conversationFlows.greeting, 'bot');
        setIsTyping(false);
      }, 1000);
    }
  }, [showChat]);

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
        <div className="fixed bottom-24 right-6 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[420px]">
          {/* Chat Header */}
          <div className="bg-orange-500 text-white p-3 flex items-center gap-2">
            <img src={LogoImage} alt="PowerGym" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">PowerGym Support</h3>
              <p className="text-xs text-orange-100">Online • Instant reply</p>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition"
            >
              <FaXmark className="text-sm" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3 min-h-[240px] max-h-[240px]">
            {/* Display all messages */}
            {messages.map((msg, index) => (
              <div key={index}>
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
                    <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">
                      U
                    </div>
                  </div>
                )}
              </div>
            ))}
            
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
          </div>

          {/* Chat Input */}
          {step !== 'menu' && (
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your name..."
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
          )}

          {/* Menu Options */}
          {step === 'menu' && (
            <div className="p-3 bg-white border-t">
              <div className="space-y-2">
                <button
                  onClick={handleCall}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition text-left"
                >
                  <FaPhone className="text-xs" />
                  <span className="text-xs font-medium">Call us</span>
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition text-left"
                >
                  <FaWhatsapp className="text-xs" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={() => window.location.href = 'mailto:support@powergym.com'}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition text-left"
                >
                  <FaEnvelope className="text-xs" />
                  <span className="text-xs font-medium">Email</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <div 
        className="d-hotline h-btn animated zoomIn faster eager-load fixed bottom-6 right-6 z-50 cursor-pointer"
        tabIndex="0"
        role="button"
        aria-label={showChat ? "Close chat" : "Open chat"}
        onClick={() => setShowChat(!showChat)}
      >
        <div id="chat-icon" aria-hidden="true" className="flex items-center justify-center w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
          {showChat ? (
            <FaXmark className="text-xl" />
          ) : (
            <div className="relative">
              <FaComments className="text-2xl" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </div>
          )}
        </div>
        <div className="hidden" aria-hidden="true">
          <span aria-hidden="true"></span>
        </div>
      </div>
    </>
  );
};

export default FloatingHelpline;