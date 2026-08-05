import React, { useState } from 'react';
import { Menu, X, Book, Phone, Upload, Image as ImageIcon } from 'lucide-react';

export default function TopMenu({ setActiveTab, user, handleLogin }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleMenuClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button onClick={toggleMenu} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={toggleMenu}></div>
          <div className="absolute top-12 right-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-2 flex flex-col gap-1">
              <button onClick={() => handleMenuClick('dictionary')} className="flex items-center gap-3 w-full p-3 text-right hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                <Book size={18} className="text-blue-500" />
                <span className="font-medium">שיחון</span>
              </button>
              <button onClick={() => handleMenuClick('contacts')} className="flex items-center gap-3 w-full p-3 text-right hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                <Phone size={18} className="text-green-500" />
                <span className="font-medium">אנשי קשר</span>
              </button>
              <div className="h-px bg-gray-100 my-1 mx-2"></div>
              <button onClick={() => {
                if (!user) {
                  handleLogin();
                } else {
                  handleMenuClick('upload');
                }
              }} className="flex items-center gap-3 w-full p-3 text-right hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                <Upload size={18} className="text-pink-500" />
                <span className="font-medium">העלאת תמונות</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
