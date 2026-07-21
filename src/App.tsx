// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Home, Map, Compass, Calendar, Menu, 
  Plane, Phone, Volume2, ChevronRight, ChevronLeft,
  Coffee, ShoppingBag, MapPin, Camera, Utensils
} from 'lucide-react';

// --- DATA FROM PDF & IMAGES ---
const TRIP_DATA = {
  startDate: new Date('2026-07-26T00:00:00'),
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
  itinerary: [
    {
      day: 1, date: '26.7', city: 'טוקיו', hotel: 'Richmond Hotel Asakusa', color: 'bg-pink-400',
      events: [
        { time: '15:35', title: 'נחיתה בטוקיו', desc: 'נחיתה בשדה התעופה Narita, רכבת Skyliner לתחנת Ueno ומונית למלון.', icon: <Plane size={16}/> },
        { time: '18:00', title: 'צ\'ק אין למלון', desc: 'Richmond Hotel Asakusa', icon: <MapPin size={16}/> },
        { time: '19:30', title: 'ערב באזור Asakusa', desc: 'טיול ברחוב Kannon ורחוב Orange. ארוחת ערב באחת הסמטאות הציוריות.', icon: <Utensils size={16}/> }
      ]
    },
    {
      day: 2, date: '27.7', city: 'טוקיו', hotel: 'Richmond Hotel Asakusa', color: 'bg-pink-400',
      events: [
        { time: '10:00', title: 'Tokyo Skytree', desc: 'המגדל הגבוה ביפן, תצפית ומתחם קניות (אופציה לאקווריום ופלנטריום).', icon: <Camera size={16}/> },
        { time: '13:00', title: 'אזור Asakusa ומקדש Senso-ji', desc: 'שער Kaminari-mon, רחוב הקניות Nakamise (ממתקי Wagashi) ומקדש Senso-ji.', icon: <MapPin size={16}/> },
        { time: '15:30', title: 'שייט מאודאיבה', desc: 'מעבורת Tokyo Cruise Ship לאי המלאכותי Odaiba.', icon: <Compass size={16}/> },
        { time: '16:30', title: 'Odaiba', desc: 'טיילת, פסל החירות, ורובוט Unicorn Gundam. אופציה למוזיאון Miraikan או Joypolis.', icon: <Camera size={16}/> },
        { time: '19:00', title: 'teamLab Planets', desc: 'חוויה וירטואלית עוצרת נשימה של אור ומגע (יש להזמין כרטיסים).', icon: <Camera size={16}/> }
      ]
    },
    {
      day: 3, date: '28.7', city: 'טוקיו', hotel: 'Richmond Hotel Asakusa', color: 'bg-pink-400',
      events: [
        { time: '08:00', title: 'שוק הדגים Tsukiji', desc: 'ארוחת בוקר של סושי וסשימי, דוכני וואגיו ועוד. (פתוח 5:00-14:00)', icon: <Utensils size={16}/> },
        { time: '11:00', title: 'קניות באזור Ginza', desc: 'רחוב Chuo-dori. קניונים: GINZA SIX, Tokyu Plaza, Mitsukoshi, יוניקלו 12 קומות.', icon: <ShoppingBag size={16}/> },
        { time: '15:00', title: 'Art Aquarium', desc: 'תערוכת אקווריומים אומנותית (הפסקה מהקניות).', icon: <Camera size={16}/> },
        { time: '18:00', title: 'ערב ב-Yurakucho Gado-shita', desc: 'איזאקיות ומסעדות יפניות אותנטיות מתחת לפסי הרכבת.', icon: <Utensils size={16}/> }
      ]
    },
    {
      day: 4, date: '29.7', city: 'טוקיו', hotel: 'Richmond Hotel Asakusa', color: 'bg-pink-400',
      events: [
        { time: '10:00', title: 'פארק Ueno', desc: 'אגם Shinobazu, מוזיאונים (טבע, אומנות), ופסל הסמוראי האחרון.', icon: <MapPin size={16}/> },
        { time: '13:00', title: 'שוק Ameyoko', desc: 'שוק תוסס עם בגדים, אוכל רחוב ומזכרות.', icon: <ShoppingBag size={16}/> },
        { time: '15:30', title: 'Akihabara', desc: 'עיר החשמל! משחקיות, חנויות אנימה. אופציה לבתי קפה של חיות (Owl Cafe, Cat Cafe) או Maidcafe.', icon: <Coffee size={16}/> }
      ]
    },
    {
      day: 5, date: '30.7', city: 'האקונה', hotel: 'Hakone Ashinoko Hanaori', color: 'bg-green-400',
      events: [
        { time: '08:30', title: 'נסיעה להאקונה', desc: 'שליחת מזוודות קדימה. מונית לתחנת טוקיו -> שינקנסן ל-Odawara.', icon: <Plane size={16}/> },
        { time: '10:30', title: 'Hakone-Yumoto', desc: 'העיירה הדרומית. משם רכבת נופית Tozan לתחנת Gora.', icon: <MapPin size={16}/> },
        { time: '12:30', title: 'עמק Owakudani', desc: 'רכבל ללוע הר הגעש. טעימת ביצים שחורות.', icon: <Utensils size={16}/> },
        { time: '14:30', title: 'אגם אשי ושייט', desc: 'רכבל לאגם אשי ושייט בספינת פיראטים.', icon: <Compass size={16}/> },
        { time: '16:00', title: 'מקדש Hakone', desc: 'שער הטורי הצף על המים.', icon: <Camera size={16}/> },
        { time: '18:00', title: 'הגעה למלון', desc: 'מלון Hakone Ashinoko Hanaori על שפת האגם. ארוחת ערב ואונסן.', icon: <MapPin size={16}/> }
      ]
    },
    {
      day: 6, date: '31.7', city: 'קיוטו', hotel: 'Cross Hotel Kyoto', color: 'bg-purple-400',
      events: [
        { time: '09:30', title: 'המוזיאון הפתוח (Hakone)', desc: 'פיסול וטבע, כולל מתחם פיקאסו.', icon: <Camera size={16}/> },
        { time: '13:00', title: 'נסיעה לקיוטו', desc: 'רכבת ל-Odawara ומשם שינקנסן לקיוטו. צ\'ק אין ב-Cross Hotel.', icon: <Plane size={16}/> },
        { time: '16:00', title: 'שוק האוכל Nishiki', desc: 'דאונטאון קיוטו (Kawaramachi). שוק אוכל עתיק, מאות דוכנים.', icon: <Utensils size={16}/> },
        { time: '19:00', title: 'רחוב Kiyamachi-dori', desc: 'סמטה לאורך תעלה עם מסעדות ובארים לארוחת ערב.', icon: <Utensils size={16}/> }
      ]
    },
    {
      day: 7, date: '1.8', city: 'קיוטו', hotel: 'Cross Hotel Kyoto', color: 'bg-purple-400',
      events: [
        { time: '09:00', title: 'מקדש הזהב Kinkaku-ji', desc: 'אחד המקדשים היפים ביפן המצופה זהב.', icon: <Camera size={16}/> },
        { time: '11:00', title: 'נסיעה ל-Arashiyama', desc: 'רכבת רטרו לתחנת אראשייאמה.', icon: <MapPin size={16}/> },
        { time: '12:00', title: 'פארק הקופים', desc: 'מעבר גשר Togetsukyo ועלייה לפארק הקופים איוואטאיאמה.', icon: <Camera size={16}/> },
        { time: '14:30', title: 'רכבת נוף Sagano', desc: 'נסיעה איטית על צד הנהר (אופציה לשייט חזרה).', icon: <Compass size={16}/> },
        { time: '16:30', title: 'יער הבמבוק', desc: 'שעות אחה"צ הן הטובות ביותר לתאורה ביער.', icon: <Camera size={16}/> },
        { time: '19:30', title: 'סמטת Pontocho', desc: 'ארוחת ערב בסמטה צרה ומסורתית.', icon: <Utensils size={16}/> }
      ]
    },
    {
      day: 8, date: '2.8', city: 'קיוטו', hotel: 'Cross Hotel Kyoto', color: 'bg-purple-400',
      events: [
        { time: '10:00', title: 'רובע Gion וטקס תה', desc: 'לבישת קימונו וטקס תה מסורתי. סיור ברחוב Hanamikoji.', icon: <Coffee size={16}/> },
        { time: '13:00', title: 'מקדש Kodaiji', desc: 'גנים מרשימים ויער במבוק קטן.', icon: <MapPin size={16}/> },
        { time: '14:30', title: 'רחוב Ninenzaka ומקדש Kiyomizu-dera', desc: 'עלייה דרך רחובות עתיקים. המקדש משקיף על כל קיוטו.', icon: <Camera size={16}/> },
        { time: '18:00', title: 'מקדש Yasaka / Maruyama', desc: 'לקראת שקיעה, הפארק מואר באלפי עששיות.', icon: <Camera size={16}/> }
      ]
    },
    {
       day: 9, date: '3.8', city: 'קיוטו', hotel: 'Cross Hotel Kyoto', color: 'bg-purple-400',
       events: [
        { time: '09:00', title: 'יציאה ל-Kurama', desc: 'רכבת ל-Kurama וקרונית הר לראש המסלול.', icon: <Compass size={16}/> },
        { time: '10:30', title: 'מסלול הליכה ביער', desc: 'מסלול של שעה וחצי דרך מקדשים עתיקים (Teimei, Tsuzura-ori).', icon: <MapPin size={16}/> },
        { time: '13:00', title: 'עיירת Kibune', desc: 'עיירה על הנהר. ארוחת צהריים - "אטריות מתגלשות" בבמבוק.', icon: <Utensils size={16}/> },
        { time: '18:00', title: 'מקדש Kifune', desc: 'מואר בעששיות בשעות הדמדומים.', icon: <Camera size={16}/> }
       ]
    },
    {
      day: 10, date: '4.8', city: 'אוסקה', hotel: 'Cross Hotel Osaka', color: 'bg-orange-400',
      events: [
       { time: '07:30', title: 'Fushimi Inari (קיוטו)', desc: 'הגעה מוקדמת כדי להימנע מעומס. מנהרת שערי הטורי המפורסמת.', icon: <Camera size={16}/> },
       { time: '11:00', title: 'Nara', desc: 'נסיעה לנארה. ביקור בפארק האיילים והמקדשים. מופע הכנת מוצ\'י בחנות Nakatanidou.', icon: <MapPin size={16}/> },
       { time: '15:00', title: 'הגעה לאוסקה', desc: 'נסיעה ל-Namba, צ\'ק אין ב-Cross Hotel Osaka.', icon: <Plane size={16}/> },
       { time: '17:00', title: 'Shinsaibashi & Dotonbori', desc: 'רחובות קניות תוססים. תמונה עם איש הגליקו.', icon: <ShoppingBag size={16}/> }
      ]
   },
   {
    day: 11, date: '5.8', city: 'אוסקה', hotel: 'Cross Hotel Osaka', color: 'bg-orange-400',
    events: [
     { time: '09:30', title: 'שוק האוכל Kuromon', desc: 'ארוחת בוקר וטעימות מהמטבח האוסקאי.', icon: <Utensils size={16}/> },
     { time: '12:00', title: 'Shinsaibashi', desc: 'זמן חופשי לשופינג במדרחוב המרכזי.', icon: <ShoppingBag size={16}/> },
     { time: '17:00', title: 'Shinsekai district', desc: 'רובע רטרו (שנות ה-50). שיפודי Kushikatsu לארוחת ערב.', icon: <Utensils size={16}/> }
    ]
   },
   {
    day: 12, date: '6.8', city: 'אוסקה', hotel: 'Cross Hotel Osaka', color: 'bg-orange-400',
    events: [
     { time: '10:00', title: 'מגדל Umeda', desc: 'תצפית מרהיבה על העיר.', icon: <Camera size={16}/> },
     { time: '12:30', title: 'Den-Den Town', desc: 'עיר האנימה של אוסקה (דומה לאקיהברה).', icon: <ShoppingBag size={16}/> },
     { time: '15:00', title: 'Namba Parks', desc: 'קניון ייחודי המשולב עם טבע וצמחייה.', icon: <ShoppingBag size={16}/> },
     { time: '17:00', title: 'מופע Sumo', desc: 'Hirakuza Osaka - מופע סומו חוויתי קרוב לטבעת.', icon: <MapPin size={16}/> },
     { time: '20:30', title: 'Amerikamura', desc: 'מרכז צעירים אופנתי לארוחת ערב.', icon: <Utensils size={16}/> }
    ]
   },
   {
    day: 13, date: '7.8', city: 'טוקיו', hotel: 'Shibuya Stream Hotel', color: 'bg-pink-400',
    events: [
     { time: '09:00', title: 'חזרה לטוקיו', desc: 'שליחת מזוודות יום לפני. שינקנסן מאוסקה לטוקיו.', icon: <Plane size={16}/> },
     { time: '13:00', title: 'צ\'ק אין', desc: 'הגעה ל-Shibuya Stream Hotel.', icon: <MapPin size={16}/> },
     { time: '15:00', title: 'מגדל טוקיו', desc: 'סיור באזור המגדל (דמוי מגדל אייפל).', icon: <Camera size={16}/> },
     { time: '16:30', title: 'Azabu-Juban & Roppongi', desc: 'שכונות יוקרתיות. Roppongi Hills תצפית ומוזיאון Mori.', icon: <MapPin size={16}/> },
     { time: '19:30', title: 'ארוחת ערב Gonpachi', desc: 'המסעדה האייקונית מהסרט "קיל ביל" ב-Nishi-Azabu.', icon: <Utensils size={16}/> }
    ]
   },
   {
    day: 14, date: '8.8', city: 'טוקיו', hotel: 'Shibuya Stream Hotel', color: 'bg-pink-400',
    events: [
     { time: '10:00', title: 'מעבר החציה של שיבויה', desc: 'מעבר החציה העמוס בעולם ופסל הכלב האצ\'יקו.', icon: <Camera size={16}/> },
     { time: '11:00', title: 'Shibuya Center-Gai', desc: 'רחובות קניות, חנות הדגל של Don Quijote, ZARA ועוד.', icon: <ShoppingBag size={16}/> },
     { time: '14:00', title: 'Miyashita Park', desc: 'פארק תלוי על גג קניון.', icon: <MapPin size={16}/> },
     { time: '15:30', title: 'שכונת Daikanyama', desc: 'שכונה שיקית וסטייליסטית, מתחם T-SITE ו-Log Road.', icon: <Coffee size={16}/> },
     { time: '19:00', title: 'ערב בשיבויה', desc: 'בילוי באיזאקיות ומסעדות בקומות העליונות של שיבויה.', icon: <Utensils size={16}/> }
    ]
   },
   {
    day: 15, date: '9.8', city: 'טוקיו (טיול יום)', hotel: 'Shibuya Stream Hotel', color: 'bg-pink-400',
    events: [
     { time: '08:00', title: 'נסיעה לקמקורה', desc: 'רכבת ל-Hase Station.', icon: <Plane size={16}/> },
     { time: '10:00', title: 'הבודהה הגדול', desc: 'פסל ברונזה ענק משנת 1252 במקדש Kotoku-in.', icon: <Camera size={16}/> },
     { time: '11:30', title: 'מקדש Hasedera', desc: 'גנים יפים, פסלים מחייכים ונוף למפרץ.', icon: <MapPin size={16}/> },
     { time: '13:00', title: 'רחוב Komachidori', desc: 'ארוחת צהריים ומזכרות. משם למקדש Tsurugaoka.', icon: <Utensils size={16}/> },
     { time: '15:30', title: 'Enoshima', desc: 'נסיעה בחשמלית Enoden לאי אנושימה. מקדשים ונוף מרהיב.', icon: <Compass size={16}/> },
     { time: '18:00', title: 'Enoshima Sea Candle', desc: 'תצפית שקיעה מגובה המגדל.', icon: <Camera size={16}/> }
    ]
   },
   {
    day: 16, date: '10.8', city: 'טוקיו', hotel: 'Shibuya Stream Hotel', color: 'bg-pink-400',
    events: [
     { time: '09:30', title: 'מקדש Meiji ופארק Yoyogi', desc: 'ריאה ירוקה ענקית. הליכה ביער למקדש הקיסר.', icon: <MapPin size={16}/> },
     { time: '12:00', title: 'Harajuku', desc: 'רחוב Takeshita הצבעוני. ממתקים, אופנה ובתי קפה של חיות.', icon: <ShoppingBag size={16}/> },
     { time: '14:30', title: 'Omotesando', desc: 'השאנז אליזה של טוקיו. מותגי יוקרה וקניונים מעוצבים.', icon: <ShoppingBag size={16}/> },
     { time: '16:00', title: 'Cat Street', desc: 'מדרחוב מלא סטייל שמוביל עד לשיבויה.', icon: <Coffee size={16}/> }
    ]
   },
   {
    day: 17, date: '11.8', city: 'טוקיו', hotel: 'Shibuya Stream Hotel', color: 'bg-pink-400',
    events: [
     { time: '10:00', title: 'Shinjuku', desc: 'התחנה העמוסה בעולם. תצפית חינמית מ-Metropolitan building.', icon: <Camera size={16}/> },
     { time: '12:30', title: 'פארק Shinjuku Gyoen', desc: 'הגן הלאומי המרהיב של טוקיו.', icon: <MapPin size={16}/> },
     { time: '15:00', title: 'Yoyogi Broadway', desc: 'מתחם ניו יורקי עם גלריות ומסעדות.', icon: <Utensils size={16}/> },
     { time: '17:00', title: 'שלט החתול ו-Omoide Yokocho', desc: 'תל מימד של חתול וסמטת שיפודי יאקיטורי.', icon: <Utensils size={16}/> },
     { time: '19:30', title: 'Kabukicho', desc: 'רובע הבילויים, שלטי ניאון ופסל הגוזילה.', icon: <MapPin size={16}/> }
    ]
   },
   {
    day: 18, date: '12.8', city: 'טוקיו', hotel: 'Shibuya Stream Hotel', color: 'bg-pink-400',
    events: [
     { time: '10:00', title: 'השלמת קניות', desc: 'זמן חופשי בשיבויה, האראג\'וקו או גינזה.', icon: <ShoppingBag size={16}/> },
     { time: '14:00', title: 'יציאה לשדה', desc: 'איסוף מזוודות ורכבת Narita Express לשדה התעופה.', icon: <Plane size={16}/> }
    ]
   }
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
  ],
  categories: [
    { title: 'בתי קפה', color: 'bg-green-100', icon: '🍵', count: 29 },
    { title: 'מסעדות', color: 'bg-pink-100', icon: '🍜', count: 62 },
    { title: 'שופינג', color: 'bg-blue-100', icon: '🛍️', count: 19 },
    { title: 'מאפיות ומתוקים', color: 'bg-orange-100', icon: '🥐', count: 12 },
    { title: 'אונסן ורוגע', color: 'bg-green-50', icon: '♨️', count: 2 },
    { title: 'מקדשים ואתרים', color: 'bg-purple-100', icon: '⛩️', count: 32 },
    { title: 'תרבות ואומנות', color: 'bg-yellow-100', icon: '🎨', count: 15 }
  ]
};

// --- MAIN APP COMPONENT ---
export default function JapanTripApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDay, setSelectedDay] = useState(0);

  // Helper to handle TTS for Japanese Dictionary
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
      <header className="pt-10 pb-4 px-6 text-center z-10 bg-[#FDF8EE]/90 backdrop-blur-sm sticky top-0">
        <h1 className="text-xl font-light tracking-wide text-gray-600 flex items-center justify-center gap-2">
          <span className="text-[#D34A3E]">⛩️</span> יפן 2026
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 custom-scrollbar">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'map' && <MapTab />}
        {activeTab === 'places' && <PlacesTab />}
        {activeTab === 'itinerary' && <ItineraryTab selectedDay={selectedDay} setSelectedDay={setSelectedDay} />}
        {activeTab === 'more' && <MoreTab speakJapanese={speakJapanese} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-between px-6 py-3 pb-6 z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavButton id="more" icon={<Menu size={22} />} label="עוד" active={activeTab} set={setActiveTab} />
        <NavButton id="map" icon={<Map size={22} />} label="מפה" active={activeTab} set={setActiveTab} />
        <NavButton id="places" icon={<Compass size={22} />} label="מה עושים?" active={activeTab} set={setActiveTab} />
        <NavButton id="itinerary" icon={<Calendar size={22} />} label="ימים" active={activeTab} set={setActiveTab} />
        <NavButton id="home" icon={<span className="text-2xl leading-none">⛩️</span>} label="היום" active={activeTab} set={setActiveTab} isRed />
      </nav>
    </div>
  );
}

// --- TAB COMPONENTS ---

function HomeTab() {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const today = new Date();
    const diffTime = Math.abs(TRIP_DATA.startDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#FAF3E0] rounded-3xl p-8 text-center shadow-sm mb-8">
        <h2 className="text-3xl font-bold mb-4 text-[#5D554D]">יפן מחכה לנו!</h2>
        
        {/* Mock Avatar Illustration */}
        <div className="flex justify-center items-end gap-2 mb-6 h-32">
          <div className="w-24 h-32 bg-[#EADDC2] rounded-full overflow-hidden relative">
            <div className="absolute bottom-0 w-full h-24 bg-[#5D554D] rounded-t-full opacity-20"></div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-5xl">👨🏻</div>
          </div>
          <div className="w-24 h-28 bg-[#EADDC2] rounded-full overflow-hidden relative">
             <div className="absolute bottom-0 w-full h-20 bg-[#5D554D] rounded-t-full opacity-20"></div>
             <div className="absolute top-4 left-1/2 -translate-x-1/2 text-5xl">👱🏻‍♂️</div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-1">עד ההמראה • {TRIP_DATA.startDate.toLocaleDateString('he-IL', {day: 'numeric', month: 'numeric'})}</p>
        <div className="text-7xl font-light text-[#4A423A] mb-6">{daysLeft} <span className="text-3xl">ימים</span></div>
        
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

      <h3 className="text-xl font-medium text-gray-700 mb-4 px-2">בקרוב נפתח להזמנה</h3>
      <div className="space-y-3">
        <UpcomingCard title="Tokyo DisneySea" date="תזכורת ב-27.7" days="עוד 8 ימים" />
        <UpcomingCard title="teamLab Planets" date="תזכורת ב-1.8" days="עוד 13 ימים" />
        <UpcomingCard title="Universal Studios Japan" date="תזכורת ב-9.8" days="עוד 21 ימים" />
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
          <h2 className="text-3xl font-light text-gray-800">מפה</h2>
          <p className="text-gray-500 text-sm">כל המסע במבט אחד 🗾</p>
        </div>
      </div>

      {/* Decorative Map Box */}
      <div className="w-full h-48 bg-[#E6EBE0] rounded-3xl mb-8 relative overflow-hidden shadow-inner flex items-center justify-center border-4 border-white">
         <span className="text-6xl opacity-20">🗻</span>
         <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
            18 ימים
         </div>
      </div>

      <h3 className="text-xl font-medium text-gray-700 mb-4 px-2 flex items-center gap-2">
        <span className="text-[#D34A3E]">📍</span> התחנות שלנו
      </h3>

      <div className="space-y-3">
        {TRIP_DATA.destinations.map((dest, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50">
            <ChevronLeft size={20} className="text-gray-300" />
            <div className="text-right">
              <h4 className="text-xl font-medium text-gray-800">{dest.name} {dest.id === 'tokyo2' && <span className="text-xs text-pink-400 ml-1">חזרה</span>}</h4>
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
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">🧭</div>
        <div>
          <h2 className="text-3xl font-light text-gray-800 text-right">לאן עכשיו?</h2>
          <p className="text-gray-500 text-sm">מתוכנן, אופציונלי, וכל מה ששמרנו</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TRIP_DATA.categories.map((cat, i) => (
          <div key={i} className={`${cat.color} rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-sm h-40 relative overflow-hidden`}>
            <div className="text-5xl mb-3 drop-shadow-sm">{cat.icon}</div>
            <h4 className="font-medium text-gray-800">{cat.title}</h4>
            <p className="text-gray-500 text-xs">{cat.count} מקומות</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItineraryTab({ selectedDay, setSelectedDay }) {
  const dayData = TRIP_DATA.itinerary[selectedDay];

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      {/* Day Selector (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar px-2" dir="ltr">
        {TRIP_DATA.itinerary.map((day, i) => (
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
          <p className="text-white/80 text-sm">יום {dayData.day} מתוך {TRIP_DATA.itinerary.length} • {dayData.hotel}</p>
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-700 mb-4 px-2 flex items-center gap-2">
        🗓️ מסלול היום
      </h3>

      {/* Timeline */}
      <div className="relative border-r-2 border-dashed border-gray-300 pr-6 mr-2 pb-10">
        {dayData.events.map((ev, i) => (
          <div key={i} className="mb-6 relative animate-in slide-in-from-right-4 duration-300" style={{animationDelay: `${i * 100}ms`}}>
            {/* Timeline Dot */}
            <div className={`absolute -right-[31px] top-4 w-4 h-4 rounded-full ${dayData.color} border-4 border-[#FDF8EE]`}></div>
            
            <div className="flex gap-4">
               <div className="w-14 pt-3 text-left">
                  <span className="text-gray-500 text-sm font-medium">{ev.time}</span>
               </div>
               
               <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-50 relative">
                  <div className={`absolute top-0 right-0 w-1 h-full ${dayData.color} rounded-r-2xl`}></div>
                  <h4 className="font-bold text-gray-800 text-base mb-1">{ev.title}</h4>
                  <p className="text-sm text-gray-600 leading-snug">{ev.desc}</p>
                  
                  <div className="mt-3 flex items-center gap-2">
                     <button className="text-xs text-blue-500 font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                        <MapPin size={12}/> נווט במפה
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
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
            <Plane className="text-blue-500 transform -rotate-45" size={20}/>
          </div>
          <div className="flex justify-between items-center text-center relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 border-b-2 border-dashed border-gray-300"></div>
             <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 bg-white px-1" size={16}/>
             
             <div>
               <h4 className="text-3xl font-light text-gray-800">TLV</h4>
               <p className="text-gray-500 text-xs">Tel Aviv</p>
             </div>
             <div>
               <h4 className="text-3xl font-light text-gray-800">NRT</h4>
               <p className="text-gray-500 text-xs">Tokyo</p>
             </div>
          </div>
          <div className="mt-4 text-center">
             <span className="text-gray-600 text-sm">המראה: 26.07.26 • 19:45</span>
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
               <div key={i} className={`flex items-center justify-between p-4 ${i !== TRIP_DATA.dictionary.length - 1 ? 'border-b border-gray-100' : ''} ${i%2===0 ? 'bg-[#F4F8FA]' : 'bg-white'}`}>
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
                     <Phone size={18}/>
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

function UpcomingCard({ title, date, days }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shadow-inner">
        🗓️
      </div>
      <div className="text-right flex-1 pr-4">
        <h4 className="font-bold text-gray-800 text-lg">{title}</h4>
        <p className="text-gray-500 text-xs">{date}</p>
      </div>
      <div className="bg-[#FAF3E0] text-[#8C7A58] text-xs px-3 py-1.5 rounded-full font-medium">
        {days}
      </div>
    </div>
  );
}
