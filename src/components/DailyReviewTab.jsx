import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { PLACE_CATEGORIES } from '../places-data.js';

export default function DailyReviewTab({ user, handleLogin }) {
  const [score, setScore] = useState(5);
  const [surprise, setSurprise] = useState('');
  const [tastiestFood, setTastiestFood] = useState('');
  const [topAttractions, setTopAttractions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);

  useEffect(() => {
    const checkTodaySubmission = async () => {
      if (!user) {
        setIsLoadingCheck(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const q = query(
          collection(db, 'daily_reviews'),
          where('userId', '==', user.uid),
          where('date', '==', today)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setHasSubmittedToday(true);
        }
      } catch (err) {
        console.error("Error checking submissions:", err);
      } finally {
        setIsLoadingCheck(false);
      }
    };

    checkTodaySubmission();
  }, [user]);

  // Flatten all places from categories for the search
  const allPlaces = React.useMemo(() => {
    return PLACE_CATEGORIES.flatMap(cat =>
      cat.places.map(place => ({ ...place, categoryIcon: cat.icon, categoryTitle: cat.title }))
    );
  }, []);

  const filteredPlaces = searchQuery.trim() === ''
    ? []
    : allPlaces.filter(place => place.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  const handleAddAttraction = (place) => {
    if (topAttractions.length < 3 && !topAttractions.find(p => p.name === place.name)) {
      setTopAttractions([...topAttractions, place]);
      setSearchQuery('');
    }
  };

  const handleRemoveAttraction = (placeName) => {
    setTopAttractions(topAttractions.filter(p => p.name !== placeName));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'daily_reviews'), {
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        score,
        surprise,
        tastiestFood,
        topAttractions: topAttractions.map(p => p.name),
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      });

      setSubmitted(true);
      setHasSubmittedToday(true);
      setTimeout(() => {
        setSubmitted(false);
        setScore(5);
        setSurprise('');
        setTastiestFood('');
        setTopAttractions([]);
      }, 3000);
    } catch (err) {
      console.error("Error adding document: ", err);
      setError("אירעה שגיאה בשמירת הסיכום. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCheck) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#D34A3E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 text-center mt-10">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-light text-gray-800 mb-4">יש להתחבר כדי לכתוב סיכום</h2>
        <p className="text-gray-500 mb-8">התחבר עם חשבון גוגל כדי לשמור את החוויות שלך</p>
        <button
          onClick={handleLogin}
          className="bg-white border border-gray-200 text-gray-700 font-medium py-3 px-8 rounded-full shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-3 mx-auto"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          התחבר עם גוגל
        </button>
      </div>
    );
  }

  if (hasSubmittedToday && !submitted) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 text-center mt-10">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-light text-gray-800 mb-4">כבר הגשת סיכום היום!</h2>
        <p className="text-gray-500">תודה ששיתפת. נתראה מחר! 🌙</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">📝</div>
        <div>
          <h2 className="text-3xl font-light text-gray-800">סיכום יומי</h2>
          <p className="text-gray-500 text-sm">5 דקות של רפלקציה על היום שהיה</p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">הסיכום נשמר בהצלחה!</h3>
          <p className="text-green-600">תודה ששיתפת. לילה טוב! 🌙</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Daily Score */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
            <label className="block text-lg font-medium text-gray-800 mb-4 text-center">
              איך היה היום מ-1 עד 10?
            </label>
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl font-bold text-[#D34A3E]">{score}</div>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D34A3E]"
              />
              <div className="flex justify-between w-full text-xs text-gray-400 px-1">
                <span>1 (גרוע)</span>
                <span>10 (מושלם)</span>
              </div>
            </div>
          </div>

          {/* Biggest Surprise */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              מה הייתה ההפתעה הכי גדולה היום? 😲
            </label>
            <textarea
              value={surprise}
              onChange={(e) => setSurprise(e.target.value)}
              placeholder="משהו שלא ציפיתי לו..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D34A3E]/50 focus:border-transparent resize-none h-24"
              required
            />
          </div>

          {/* Tastiest Food */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              איזה חטיף/מאכל היה הכי טעים? 🍜
            </label>
            <input
              type="text"
              value={tastiestFood}
              onChange={(e) => setTastiestFood(e.target.value)}
              placeholder="ראמן, מוצ'י, או אולי משהו מהקומביני?"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D34A3E]/50 focus:border-transparent"
              required
            />
          </div>

          {/* Top 3 Attractions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
            <label className="block text-lg font-medium text-gray-800 mb-3">
              מה היו 3 האטרקציות הכי טובות היום? 🏆
            </label>

            {/* Selected Attractions */}
            <div className="space-y-2 mb-4">
              {topAttractions.map((place, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#FAF3E0] p-3 rounded-xl border border-[#EADDC2]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{place.categoryIcon}</span>
                    <span className="font-medium text-gray-800">{place.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttraction(place.name)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {topAttractions.length === 0 && (
                <div className="text-center p-4 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                  עדיין לא נבחרו אטרקציות
                </div>
              )}
            </div>

            {/* Search Input */}
            {topAttractions.length < 3 && (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש אטרקציה..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D34A3E]/50 focus:border-transparent"
                />

                {/* Search Results Dropdown */}
                {filteredPlaces.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
                    {filteredPlaces.map((place, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddAttraction(place)}
                        className="w-full text-right px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-xl">{place.categoryIcon}</span>
                        <div>
                          <div className="font-medium text-gray-800">{place.name}</div>
                          <div className="text-xs text-gray-400">{place.categoryTitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="text-left mt-2 text-xs text-gray-400">
              נבחרו {topAttractions.length} מתוך 3
            </div>
          </div>


          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-bold text-lg py-4 rounded-2xl shadow-md transition-colors active:scale-95 flex justify-center items-center gap-2 ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D34A3E] hover:bg-[#b83d33]'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                שומר...
              </>
            ) : (
              'שמור סיכום יומי'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
