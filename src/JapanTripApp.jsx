// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Home, Map, Compass, Calendar, Menu,
  Plane, Phone, Volume2, ChevronRight, ChevronLeft,
  Coffee, ShoppingBag, MapPin, Camera, Utensils, Star
} from 'lucide-react';
import { PLACE_CATEGORIES } from './places-data.js';
import { ITINERARY } from './itinerary-data.js';
import { auth, googleProvider } from './firebase.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import DailyReviewTab from './components/DailyReviewTab.jsx';
import ReviewSummaryTab from './components/ReviewSummaryTab.jsx';

// Your live Google My Maps (740 places, colored by category)
const MY_MAPS_ID = '1I0o12hoecmBorcEsinQqw4nhTDG7adU';
const MY_MAPS_EMBED = `https://www.google.com/maps/d/embed?mid=${MY_MAPS_ID}&z=11`;
const MY_MAPS_VIEW = `https://www.google.com/maps/d/u/0/viewer?mid=${MY_MAPS_ID}`;

// Maps a string icon key (from itinerary-data.js) to a lucide icon element.
const ICONS = {
  plane: <Plane size={16} />,
  pin: <MapPin size={16} />,
  food: <Utensils size={16} />,
  camera: <Camera size={16} />,
  compass: <Compass size={16} />,
  coffee: <Coffee size={16} />,
  shop: <ShoppingBag size={16} />,
};

const TRIP_DATA = {
  // Flight departs TLV on 25.7 (overnight), lands Tokyo 26.7. Itinerary day 1 = 26.7.
  startDate: new Date('2026-07-25T19:45:00'),
  landingDate: new Date('2026-07-26T15:35:00'),
  travelers: 7,
  contacts: [
    { name: "שירות מארץ (יפן טורס)", phone: "+972-54-507-8438" },
    { name: "מוקד בתוך יפן", phone: "+81-80-3148-1437" },
    { name: "מוקד הזמנות", phone: "*3195" }
  ],
  destinations: [
    { id: 'tokyo1', name: 'טוקיו', nights: 4, color: 'bg-pink-400' },
    { id: 'hakone', name: 'האקונה', nights: 1, color: 'bg-green-400' },
    { id: 'kyoto', name: 'קיוטו', nights: 4, color: 'bg-purple-400' },
    { id: 'osaka', name: 'אוסקה', nights: 3, color: 'bg-orange-400' },
    { id: 'tokyo2', name: 'טוקיו', nights: 5, color: 'bg-pink-400' }
  ],
  dictionary: [
    { he: 'שלום / צהריים טובים', ja: 'Konnichiwa', kana: 'こんにちは' },
    { he: 'בוקר טוב', ja: 'Ohayō gozaimasu', kana: 'おはようございます' },
    { he: 'תודה רבה', ja: 'Arigatō gozaimasu', kana: 'ありがとうございます' },
    { he: 'סליחה / תסלח לי', ja: 'Sumimasen', kana: 'すみません' },
    { he: 'בבקשה', ja: 'Onegaishimasu', kana: 'お願いします' },
    { he: 'נעים להכיר', ja: 'Hajimemashite', kana: 'はじめまして' },
    { he: 'אני לא מבין', ja: 'Wakarimasen', kana: 'わかりません' },
    { he: 'אתה מדבר אנגלית?', ja: 'Eigo o hanasemasu ka?', kana: '英語を話せますか' },
    { he: 'כמה זה עולה?', ja: 'Ikura desu ka?', kana: 'いくらですか' },
    { he: 'טעים מאוד', ja: 'Oishii desu', kana: '美味しいです' }
  ]
};

// --- MAIN APP COMPONENT ---
export default function JapanTripApp() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const [loginError, setLoginError] = useState(null);

  const handleLogin = async () => {
    try {
      setLoginError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      setLoginError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const getInitialDayIndex = () => {
    const today = new Date();
    let idx = 0;
    ITINERARY.forEach((d, i) => {
      const [dd, mm] = d.date.split('.').map(Number);
      const dDate = new Date(2026, mm - 1, dd);
      if (today >= dDate) idx = i;
    });
    return idx;
  };

  const [activeTab, setActiveTab] = useState('home');
  const [selectedDay, setSelectedDay] = useState(getInitialDayIndex());

  const speakJapanese = (text = '') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("הדפדפן שלך לא תומך בהקראת טקסט.");
    }
  };

  return (
    <div dir="rtl" className="w-full max-w-md mx-auto bg-[#FDF8EE] min-h-screen relative font-sans text-gray-800 shadow-xl overflow-hidden flex flex-col">

      {/* Header */}
      <header className="pt-10 pb-4 px-6 z-10 bg-[#FDF8EE]/90 backdrop-blur-sm sticky top-0 flex justify-between items-center">
        <h1 className="text-xl font-light tracking-wide text-gray-600 flex items-center gap-2">
          <span className="text-[#D34A3E]">⛩️</span> יפן 2026
        </h1>
        <div>
          {user ? (
            <div className="flex items-center gap-2">
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-gray-800">התנתק</button>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <button onClick={handleLogin} className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50">
                התחבר
              </button>
              {loginError && <span className="text-xs text-red-500 mt-1">{loginError}</span>}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 custom-scrollbar">
        {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} setSelectedDay={setSelectedDay} selectedDay={selectedDay} />}
        {activeTab === 'map' && <MapTab />}
        {activeTab === 'places' && <PlacesTab />}
        {activeTab === 'itinerary' && <ItineraryTab selectedDay={selectedDay} setSelectedDay={setSelectedDay} />}
        {activeTab === 'review' && <DailyReviewTab user={user} handleLogin={handleLogin} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />}
        {activeTab === 'summary' && <ReviewSummaryTab user={user} handleLogin={handleLogin} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />}
        {activeTab === 'more' && <MoreTab speakJapanese={speakJapanese} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-between px-2 py-3 pb-6 z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] overflow-x-auto">
        <NavButton id="more" icon={<Menu size={22} />} label="עוד" active={activeTab} set={setActiveTab} />
        <NavButton id="summary" icon={<span className="text-xl leading-none">📊</span>} label="סיכומים" active={activeTab} set={setActiveTab} />
        <NavButton id="review" icon={<Star size={22} />} label="סיכום" active={activeTab} set={setActiveTab} />
        <NavButton id="places" icon={<Compass size={22} />} label="מה עושים?" active={activeTab} set={setActiveTab} />
        <NavButton id="itinerary" icon={<Calendar size={22} />} label="ימים" active={activeTab} set={setActiveTab} />
        <NavButton id="home" icon={<span className="text-2xl leading-none">⛩️</span>} label="היום" active={activeTab} set={setActiveTab} isRed />
      </nav>
    </div>
  );
}

// --- TAB COMPONENTS ---

function HomeTab({ setActiveTab, setSelectedDay, selectedDay }) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const today = new Date();
    const diffTime = TRIP_DATA.startDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays);
  }, []);

  // Jump to "today's" day in the itinerary if the trip is underway, else day 1.
  const goToItinerary = () => {
    const today = new Date();
    let idx = 0;
    ITINERARY.forEach((d, i) => {
      const [dd, mm] = d.date.split('.').map(Number);
      const dDate = new Date(2026, mm - 1, dd);
      if (today >= dDate) idx = i;
    });
    setSelectedDay(idx);
    setActiveTab('itinerary');
  };

  const dayData = ITINERARY[selectedDay];

  const cityEmojis = {
    'טוקיו': '🗼',
    'האקונה': '♨️',
    'קיוטו': '⛩️',
    'אוסקה': '🏯',
    'קמקורה': '🌊'
  };
  
  const currentCityEmoji = cityEmojis[dayData.city] || '🗾';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#FAF3E0] rounded-3xl p-8 text-center shadow-sm mb-8">
        <h2 className="text-3xl font-bold mb-4 text-[#5D554D]">יפן מחכה לנו!</h2>

        {/* Japan Illustration */}
        <div className="flex justify-center items-center gap-4 mb-6 h-32">
          <div className="text-7xl animate-bounce" style={{ animationDuration: '3s' }}>🗻</div>
          <div className="text-6xl">🌸</div>
          <div className="text-7xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>⛩️</div>
        </div>

        {daysLeft > 0 ? (
          <>
            <p className="text-gray-500 text-sm mb-1">
              ההמראה מתל אביב • {TRIP_DATA.startDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })} בערב
            </p>
            <div className="text-7xl font-light text-[#4A423A] mb-6">
              {daysLeft} <span className="text-3xl">ימים</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-1">
              אנחנו ביפן! 🇯🇵
            </p>
            <div className="text-5xl font-light text-[#4A423A] mb-2">
              יום {selectedDay + 1} <span className="text-2xl">לטיול</span>
            </div>
            <div className="text-2xl font-medium text-[#D34A3E] mb-6 flex items-center justify-center gap-2">
              {currentCityEmoji} עכשיו ב{dayData.city}
            </div>
          </>
        )}

        {/* Mini route dots */}
        <div className="flex justify-center items-center gap-2 text-xs text-gray-500">
          <span>טוקיו</span>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <span className="text-gray-300">←</span>
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-gray-300">←</span>
          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
          <span className="text-gray-300">←</span>
          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
          <span className="text-gray-300">←</span>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <span>טוקיו</span>
        </div>
      </div>

      <button
        onClick={goToItinerary}
        className="w-full bg-[#D34A3E] text-white rounded-2xl py-4 mb-8 font-medium shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <Calendar size={18} /> למסלול המלא של 18 הימים
      </button>

      <h3 className="text-xl font-medium text-gray-700 mb-4 px-2">היום: {dayData.city} (יום {dayData.day})</h3>
      <div className="relative border-r-2 border-dashed border-gray-300 pr-6 mr-2 pb-10">
        {dayData.events.map((ev, i) => {
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.title + ' Japan')}`;
          return (
            <div key={i} className="mb-6 relative animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${i * 80}ms` }}>
              {/* Timeline Dot */}
              <div className={`absolute -right-[31px] top-4 w-4 h-4 rounded-full ${dayData.color} border-4 border-[#FDF8EE]`}></div>

              <div className="flex gap-4">
                <div className="w-14 pt-3 text-left shrink-0">
                  {ev.time && <div className="text-gray-800 font-bold text-sm">{ev.time}</div>}
                    <span className="text-gray-500 text-xs font-medium">{ev.transport}</span>
                </div>

                <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-50 relative">
                  <div className={`absolute top-0 right-0 w-1 h-full ${dayData.color} rounded-r-2xl`}></div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-400">{ICONS[ev.icon] || <MapPin size={16} />}</span>
                    <h4 className="font-bold text-gray-800 text-base">{ev.title}</h4>
                  </div>
                  {ev.desc && <p className="text-sm text-gray-600 mb-2 leading-relaxed">{ev.desc}</p>}
                    {ev.voucher && <p className="text-sm text-green-600 font-bold leading-relaxed">יש וואצ'ר</p>}

                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg"
                    >
                      <MapPin size={12} /> נווט במפה
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MapTab() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">🗺️</div>
        <div>
          <h2 className="text-3xl font-light text-gray-800">המפה שלנו</h2>
          <p className="text-gray-500 text-sm">כל 740 המקומות מסומנים 🗾</p>
        </div>
      </div>

      {/* Live embedded Google My Map with all pins */}
      <div className="w-full h-96 rounded-3xl mb-4 overflow-hidden shadow-sm border-4 border-white bg-[#E6EBE0]">
        <iframe
          title="Japan Trip Map"
          src={MY_MAPS_EMBED}
          className="w-full h-full"
          style={{ border: 0 }}
          loading="lazy"
        ></iframe>
      </div>

      <a
        href={MY_MAPS_VIEW}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-white rounded-2xl py-3 mb-8 font-medium shadow-sm border border-gray-50 flex items-center justify-center gap-2 text-blue-500 active:scale-95 transition-transform"
      >
        <MapPin size={16} /> פתח את המפה המלאה ב-Google Maps
      </a>

      <h3 className="text-xl font-medium text-gray-700 mb-4 px-2 flex items-center gap-2">
        <span className="text-[#D34A3E]">📍</span> התחנות שלנו
      </h3>

      <div className="space-y-3">
        {TRIP_DATA.destinations.map((dest, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50">
            <ChevronLeft size={20} className="text-gray-300" />
            <div className="text-right">
              <h4 className="text-xl font-medium text-gray-800">
                {dest.name} {dest.id === 'tokyo2' && <span className="text-xs text-pink-400 ml-1">חזרה</span>}
              </h4>
              <p className="text-gray-500 text-sm">{dest.nights} לילות</p>
            </div>
            <div className={`w-10 h-10 rounded-full ${dest.color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
              {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlacesTab() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-light text-gray-800 flex items-center gap-2">
              <span>{selectedCategory.icon}</span> {selectedCategory.title}
            </h2>
            <p className="text-gray-500 text-sm">{selectedCategory.places.length} מקומות</p>
          </div>
        </div>

        <div className="space-y-3">
          {selectedCategory.places.map((place, i) => {
            const mapUrl = (place.lat != null && place.lng != null)
              ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' Japan')}`;
            return (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg shrink-0"
                >
                  <MapPin size={12} /> נווט
                </a>
                <div className="text-right flex-1 pr-4">
                  <h4 className="font-bold text-gray-800">{place.name}</h4>
                  {place.desc && <p className="text-gray-500 text-sm mt-1 leading-snug">{place.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">🧭</div>
        <div>
          <h2 className="text-3xl font-light text-gray-800 text-right">לאן עכשיו?</h2>
          <p className="text-gray-500 text-sm">740 מקומות שבחרנו, לפי קטגוריה</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PLACE_CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setSelectedCategory(cat)}
            className={`${cat.color} rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-sm h-40 relative overflow-hidden active:scale-95 transition-transform`}
          >
            <div className="text-5xl mb-3 drop-shadow-sm">{cat.icon}</div>
            <h4 className="font-medium text-gray-800 text-sm px-1">{cat.title}</h4>
            <p className="text-gray-500 text-xs mt-1">{cat.places.length} מקומות</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ItineraryTab({ selectedDay, setSelectedDay }) {
  const dayData = ITINERARY[selectedDay];

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      {/* Day Selector (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar px-2" dir="ltr">
        {ITINERARY.map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all ${
              selectedDay === i ? `${day.color} text-white shadow-md transform scale-105` : 'bg-white text-gray-500 shadow-sm'
            }`}
          >
            <span className="text-xs font-medium mb-1">יום {day.day}</span>
            <span className={`text-lg font-bold ${selectedDay === i ? 'text-white' : 'text-gray-800'}`}>{day.date}</span>
          </button>
        ))}
      </div>

      {/* Day Header */}
      <div className={`rounded-3xl p-6 text-center text-white mb-6 relative overflow-hidden ${dayData.color}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-light mb-1">{dayData.city}</h2>
          <p className="text-white/80 text-sm mb-3">יום {dayData.day} מתוך {ITINERARY.length} • {dayData.hotel}</p>
          {dayData.hotelAddress && <p className="text-white/90 text-sm leading-snug bg-black/10 rounded-xl px-3 py-2">{dayData.hotelAddress}</p>}
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-700 mb-4 px-2 flex items-center gap-2">
        🗓️ מסלול היום
      </h3>

      {/* Timeline */}
      <div className="relative border-r-2 border-dashed border-gray-300 pr-6 mr-2 pb-10">
        {dayData.events.map((ev, i) => {
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.title + ' Japan')}`;
          return (
            <div key={i} className="mb-6 relative animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${i * 80}ms` }}>
              {/* Timeline Dot */}
              <div className={`absolute -right-[31px] top-4 w-4 h-4 rounded-full ${dayData.color} border-4 border-[#FDF8EE]`}></div>

              <div className="flex gap-4">
                <div className="w-14 pt-3 text-left shrink-0">
                  {ev.time && <div className="text-gray-800 font-bold text-sm">{ev.time}</div>}
                    <span className="text-gray-500 text-xs font-medium">{ev.transport}</span>
                </div>

                <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-50 relative">
                  <div className={`absolute top-0 right-0 w-1 h-full ${dayData.color} rounded-r-2xl`}></div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-400">{ICONS[ev.icon] || <MapPin size={16} />}</span>
                    <h4 className="font-bold text-gray-800 text-base">{ev.title}</h4>
                  </div>
                  {ev.desc && <p className="text-sm text-gray-600 mb-2 leading-relaxed">{ev.desc}</p>}
                    {ev.voucher && <p className="text-sm text-green-600 font-bold leading-relaxed">יש וואצ'ר</p>}

                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg"
                    >
                      <MapPin size={12} /> נווט במפה
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MoreTab({ speakJapanese }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* Flights Section */}
      <div className="mb-8">
        <h3 className="text-xl font-medium text-gray-700 mb-4 px-2">טיסות ✈️</h3>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 mb-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-pink-400"></div>
          <div className="flex justify-between items-center mb-4">
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">שולם</span>
            <Plane className="text-blue-500 transform -rotate-45" size={20} />
          </div>
          <div className="flex justify-between items-center text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 border-b-2 border-dashed border-gray-300"></div>
            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 bg-white px-1" size={16} />

            <div>
              <h4 className="text-3xl font-light text-gray-800">TLV</h4>
              <p className="text-gray-500 text-xs">Tel Aviv</p>
            </div>
            <div>
              <h4 className="text-3xl font-light text-gray-800">NRT</h4>
              <p className="text-gray-500 text-xs">Tokyo</p>
            </div>
          </div>
          <div className="mt-4 text-center space-y-1">
            <p className="text-gray-600 text-sm">המראה: 25.07.26 • 19:45</p>
            <p className="text-gray-400 text-xs">נחיתה בטוקיו: 26.07.26 • 15:35</p>
          </div>
        </div>
      </div>

      {/* Dictionary Section */}
      <div className="mb-8">
        <h3 className="text-xl font-medium text-gray-700 mb-2 px-2 flex items-center justify-between">
          <span>שיחון 🗣️</span>
          <span className="text-xs text-gray-400 font-normal">מילים שיצילו את היום</span>
        </h3>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
          {TRIP_DATA.dictionary.map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-4 ${i !== TRIP_DATA.dictionary.length - 1 ? 'border-b border-gray-100' : ''} ${i % 2 === 0 ? 'bg-[#F4F8FA]' : 'bg-white'}`}>
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

      {/* Contacts Section */}
      <div>
        <h3 className="text-xl font-medium text-gray-700 mb-2 px-2">אנשי קשר חשובים 📞</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden p-2">
          {TRIP_DATA.contacts.map((contact, i) => (
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

// --- UTILS ---


function NavButton({ icon, label, id, active, set, isRed }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => set(id)}
      className={`flex flex-col items-center justify-center w-16 transition-colors ${
        isActive ? (isRed ? 'text-[#D34A3E]' : 'text-gray-800') : 'text-gray-400'
      }`}
    >
      <div className={`mb-1 transition-transform ${isActive ? 'transform -translate-y-1 scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
        {label}
      </span>
    </button>
  );
}

