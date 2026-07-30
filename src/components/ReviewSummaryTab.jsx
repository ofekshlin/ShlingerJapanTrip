
import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { ITINERARY } from '../itinerary-data.js';

export default function ReviewSummaryTab({ user, handleLogin, selectedDay }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchYesterdayReviews = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const dayData = ITINERARY[selectedDay];
        if (!dayData) {
          setIsLoading(false);
          return;
        }

        const [day, month] = dayData.date.split('.');
        const year = new Date().getFullYear();
        const reviewDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        const q = query(
          collection(db, 'daily_reviews'),
          where('date', '==', reviewDate)
        );

        const querySnapshot = await getDocs(q);
        const fetchedReviews = [];
        querySnapshot.forEach((doc) => {
          fetchedReviews.push({ id: doc.id, ...doc.data() });
        });

        setReviews(fetchedReviews);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("אירעה שגיאה בטעינת הסיכומים.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchYesterdayReviews();
  }, [user, selectedDay]);

  if (isLoading) {
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
        <h2 className="text-2xl font-light text-gray-800 mb-4">יש להתחבר כדי לראות סיכומים</h2>
        <p className="text-gray-500 mb-8">התחבר עם חשבון גוגל כדי לראות את הסיכומים</p>
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">📊</div>
        <div>
          <h2 className="text-3xl font-light text-gray-800">סיכומים - יום {selectedDay + 1}</h2>
          <p className="text-gray-500 text-sm">מה כולם חשבו על היום שהיה</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center border border-red-100 mb-6">
          {error}
        </div>
      )}

      {reviews.length === 0 && !error ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-50">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">אין סיכומים ליום זה</h3>
          <p className="text-gray-500">אף אחד לא הגיש סיכום ליום זה.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                {review.userPhoto ? (
                  <img src={review.userPhoto} alt={review.userName} className="w-10 h-10 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    {review.userName ? review.userName.charAt(0) : '?'}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-800">{review.userName || 'משתמש אנונימי'}</div>
                  <div className="text-xs text-gray-400">ציון יומי: <span className="font-bold text-[#D34A3E]">{review.score}/10</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">ההפתעה הכי גדולה 😲</h4>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-xl">{review.surprise || 'לא צוין'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">הכי טעים 🍜</h4>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-xl">{review.tastiestFood || 'לא צוין'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">אטרקציות נבחרות 🏆</h4>
                  {review.topAttractions && review.topAttractions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {review.topAttractions.map((attr, idx) => (
                        <span key={idx} className="bg-[#FAF3E0] text-gray-800 px-3 py-1 rounded-full text-sm border border-[#EADDC2]">
                          {attr}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">לא נבחרו אטרקציות</p>
                  )}
                  {review.additionalAttractions && (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium text-gray-400 mb-1">אטרקציות נוספות:</h5>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded-lg text-sm">{review.additionalAttractions}</p>
                    </div>
                  )}
                </div>

                {review.freeText && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">עוד משהו 💭</h4>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-xl">{review.freeText}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
