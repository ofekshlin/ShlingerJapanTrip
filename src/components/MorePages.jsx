
import React from 'react';
import { Volume2, Phone } from 'lucide-react';
import { TRIP_DATA } from '../JapanTripApp'; // We need to export TRIP_DATA from JapanTripApp or move it

export function DictionaryTab({ speakJapanese, dictionary }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8">
        <h3 className="text-xl font-medium text-gray-700 mb-2 px-2 flex items-center justify-between">
          <span>שיחון 🗣️</span>
          <span className="text-xs text-gray-400 font-normal">מילים שיצילו את היום</span>
        </h3>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
          {dictionary.map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-4 ${i !== dictionary.length - 1 ? 'border-b border-gray-100' : ''} ${i % 2 === 0 ? 'bg-[#F4F8FA]' : 'bg-white'}`}>
              <button
                onClick={() => speakJapanese(item.ja)}
                className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Volume2 size={18} />
              </button>
              <div className="text-right flex-1 pr-4">
                <p className="font-medium text-gray-800">{item.he}</p>
                <p className="text-sm text-gray-500" dir="ltr">{item.ja}</p>
                <p className="text-xs text-gray-400">{item.kana}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactsTab({ contacts }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h3 className="text-xl font-medium text-gray-700 mb-2 px-2">אנשי קשר חשובים 📞</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden p-2">
          {contacts.map((contact, i) => (
            <div key={i} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0">
              <a href={`tel:${contact.phone}`} className="bg-green-50 text-green-600 p-2 rounded-xl">
                <Phone size={18} />
              </a>
              <div className="text-right">
                <p className="font-medium text-gray-800">{contact.name}</p>
                <p className="text-sm text-gray-500" dir="ltr">{contact.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
