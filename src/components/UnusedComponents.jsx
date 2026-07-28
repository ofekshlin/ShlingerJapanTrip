
import React from 'react';

export function UpcomingCard({ title, date, note }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shadow-inner">
        🗓️
      </div>
      <div className="text-right flex-1 pr-4">
        <h4 className="font-bold text-gray-800 text-lg">{title}</h4>
        <p className="text-gray-500 text-xs">{date}</p>
      </div>
      <div className="bg-[#FAF3E0] text-[#8C7A58] text-xs px-3 py-1.5 rounded-full font-medium max-w-[90px] text-center leading-tight">
        {note}
      </div>
    </div>
  );
}
