import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { Heart, Map as MapIcon, Grid, Share2, Maximize2, X, ChevronRight, ChevronLeft, Play, Download, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to auto-fit map bounds
function MapBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.location.lat, m.location.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, map]);
  return null;
}

export default function PicturesTab({ user, handleLogin }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(null);
    const [notification, setNotification] = useState(null);

  
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMedia(mediaData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async (item) => {
    if (!user) {
      handleLogin();
      return;
    }

    const itemRef = doc(db, 'media', item.id);
    const hasLiked = item.likes?.includes(user.uid);

    try {
      if (hasLiked) {
        await updateDoc(itemRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(itemRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const fetchImageBlob = async (url) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.blob();
    } catch (e) {
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Proxy fetch failed');
        return await response.blob();
      } catch (e2) {
        const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl2);
        if (!response.ok) throw new Error('Second proxy fetch failed');
        return await response.blob();
      }
    }
  };

  const handleShare = async (itemsToShare) => {
    if (!navigator.share) {
      showNotification('שיתוף לא נתמך בדפדפן זה', 'error');
      return;
    }

    showNotification('מכין תמונות לשיתוף...', 'info');
    try {
      const files = [];
      let fetchFailed = false;
      for (const item of itemsToShare) {
        if (item.type === 'image') {
          try {
            const blob = await fetchImageBlob(item.url);
            const file = new File([blob], `image_${item.id}.jpg`, { type: blob.type || 'image/jpeg' });
            files.push(file);
          } catch (e) {
            console.error('Error fetching image for share:', e);
            fetchFailed = true;
          }
        }
      }

      if (!fetchFailed && files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          title: 'תמונות מיפן',
          text: 'תראו את התמונות האלה מיפן!',
          files: files
        });
        showNotification('שותף בהצלחה!', 'success');
      } else {
        const urls = itemsToShare.map(item => item.url).join('\n');
        await navigator.share({
          title: 'תמונות מיפן',
          text: 'תראו את התמונות האלה מיפן!\n' + urls
        });
        showNotification('שותף בהצלחה (קישורים)!', 'success');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if (error.name !== 'AbortError') {
        showNotification('שגיאה בשיתוף', 'error');
      }
    }
  };

  const handleDownload = async (item) => {
    showNotification('מוריד תמונה...', 'info');
    try {
      const blob = await fetchImageBlob(item.url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `image_${item.id}.${item.type === 'image' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification('הורד בהצלחה!', 'success');
    } catch (error) {
      console.error('Error downloading, falling back to open in new tab:', error);
      showNotification('פותח תמונה בכרטיסייה חדשה...', 'info');
      const a = document.createElement('a');
      a.href = item.url;
      a.download = `image_${item.id}.${item.type === 'image' ? 'jpg' : 'mp4'}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Derived state
  // If a media item doesn't have a day, we'll assign it to day 1 for display purposes
  const mediaWithDays = media.map(m => ({ ...m, day: m.day ? Number(m.day) : 1 }));
  const availableDays = [...new Set(mediaWithDays.map(m => m.day))].sort((a, b) => a - b);
  const displayDays = availableDays.length > 0 ? availableDays : [1];

  // Ensure selectedDay is valid
  useEffect(() => {
    if (availableDays.length > 0 && !availableDays.includes(selectedDay)) {
      setSelectedDay(availableDays[0]);
    }
  }, [availableDays, selectedDay]);

  const dailyMedia = mediaWithDays.filter(m => m.day === selectedDay);

  // Best photos: top 4 by likes
  const bestPhotos = [...dailyMedia].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 4);

  // Map markers
  const mediaWithLocation = dailyMedia.filter(m => m.location && m.location.lat && m.location.lng);
  const mapCenter = mediaWithLocation.length > 0
    ? [mediaWithLocation[0].location.lat, mediaWithLocation[0].location.lng]
    : [35.6762, 139.6503]; // Default to Tokyo

  // Gallery filtering
  // Since we don't have real categories in the data yet, we'll just mock it or show all
  const galleryMedia = dailyMedia;

  // Lightbox navigation
  const lightboxItem = lightboxIndex !== null ? galleryMedia[lightboxIndex] : null;

  const handlePrevLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex(prev => (prev > 0 ? prev - 1 : galleryMedia.length - 1));
  };

  const handleNextLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex(prev => (prev < galleryMedia.length - 1 ? prev + 1 : 0));
  };

  const handleShowOnMap = (item) => {
    setLightboxIndex(null);
    const mapElement = document.getElementById('photo-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') handleNextLightbox(e); // RTL
      if (e.key === 'ArrowRight') handlePrevLightbox(e); // RTL
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, galleryMedia.length]);

  const renderMediaItem = (item, index, isFeatured = false) => {
    const hasLiked = user && item.likes?.includes(user.uid);
    const likeCount = item.likes?.length || 0;

    return (
      <div
        key={item.id}
        className={`relative rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group ${isFeatured ? 'aspect-[4/3]' : 'aspect-square'}`}
        onClick={() => setLightboxIndex(index)}
      >
        {item.type === 'image' ? (
          <img src={item.url} alt="Trip media" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="relative w-full h-full">
            <video src={item.url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="text-white w-12 h-12 opacity-80" />
            </div>
          </div>
        )}

        {/* Like button */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike(item);
            }}
            className={`p-1 rounded-full transition-colors ${hasLiked ? 'text-red-500' : 'text-white'}`}
          >
            <Heart size={16} fill={hasLiked ? "currentColor" : "none"} />
          </button>
          {likeCount > 0 && <span className="text-white text-xs font-medium">{likeCount}</span>}
        </div>

        {/* Uploader info */}
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 z-10">
          {item.uploaderPhoto && (
            <img src={item.uploaderPhoto} alt={item.uploaderName} className="w-5 h-5 rounded-full" />
          )}
          <span className="text-white text-xs">{item.uploaderName}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-8">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[200] px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-all duration-300 ${
          notification.type === 'error' ? 'bg-red-500 text-white' :
          notification.type === 'success' ? 'bg-green-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* A. Days Navigation Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-2 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 min-w-max px-2">
          {displayDays.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedDay === day 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              יום {day}
            </button>
          ))}
        </div>
      </div>

      {/* B. Top Highlights (Best Photos) */}
      {bestPhotos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Heart size={20} className="text-red-500" fill="currentColor" />
              התמונות המובילות
            </h3>
            {user && (
              <button
                onClick={() => handleShare(bestPhotos)}
                className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-blue-100 transition-colors"
              >
                שתף סיכום יומי
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bestPhotos.map((item) => {
              // Find index in galleryMedia for lightbox
              const index = galleryMedia.findIndex(m => m.id === item.id);
              return renderMediaItem(item, index !== -1 ? index : 0, true);
            })}
          </div>
        </section>
      )}

      {/* C. Interactive Map Component */}
      <section id="photo-map" className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-2">
          <MapIcon size={20} className="text-blue-500" />
          <h3 className="font-bold text-lg text-gray-800">מפת תמונות</h3>
        </div>
        <div className="h-64 sm:h-96 w-full z-0 relative">
          <MapContainer
            center={mapCenter}
            zoom={mediaWithLocation.length > 0 ? 13 : 5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapBounds markers={mediaWithLocation} />
            {mediaWithLocation.map(item => {
              const index = galleryMedia.findIndex(m => m.id === item.id);
              return (
                <Marker key={item.id} position={[item.location.lat, item.location.lng]}>
                  <Popup>
                    <div className="w-32 flex flex-col gap-2">
                      <div className="w-full aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => setLightboxIndex(index !== -1 ? index : 0)}>
                        {item.type === 'image' ? (
                          <img src={item.url} className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <button 
                        onClick={() => setLightboxIndex(index !== -1 ? index : 0)}
                        className="w-full bg-blue-500 text-white text-xs py-1.5 rounded-md font-medium"
                      >
                        הגדל תמונה
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </section>

      {/* D. Full Gallery & Category Filtering */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Grid size={20} className="text-blue-500" />
            גלריה מלאה
          </h3>
        </div>

        

        {galleryMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {galleryMedia.map((item, index) => renderMediaItem(item, index))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-50">
            <p className="text-gray-500">אין תמונות ליום זה</p>
          </div>
        )}
      </section>

      {/* E. Lightbox / Modal Overlay */}
      {lightboxItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 absolute top-0 w-full z-10">
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full backdrop-blur-sm transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-3">
              {lightboxItem.location && (
                <button
                  onClick={() => handleShowOnMap(lightboxItem)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full backdrop-blur-sm transition-colors text-sm font-medium"
                >
                  <MapPin size={16} />
                  הצג במפה
                </button>
              )}
              <button
                onClick={() => handleDownload(lightboxItem)}
                className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full backdrop-blur-sm transition-colors"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => handleShare([lightboxItem])}
                className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full backdrop-blur-sm transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Prev/Next Buttons */}
            {galleryMedia.length > 1 && (
              <>
                <button 
                  onClick={handleNextLightbox}
                  className="absolute left-4 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all z-10"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={handlePrevLightbox}
                  className="absolute right-4 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all z-10"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <div className="w-full h-full p-4 md:p-12 flex items-center justify-center">
              {lightboxItem.type === 'image' ? (
                <img
                  src={lightboxItem.url}
                  alt="Full size"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <video
                  src={lightboxItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Bottom Bar / Metadata */}
          <div className="p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent absolute bottom-0 w-full">
            <div className="flex items-end justify-between max-w-4xl mx-auto">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {lightboxItem.uploaderPhoto && (
                    <img src={lightboxItem.uploaderPhoto} alt={lightboxItem.uploaderName} className="w-10 h-10 rounded-full border-2 border-white/20" />
                  )}
                  <div className="text-white">
                    <p className="font-medium text-lg">{lightboxItem.uploaderName}</p>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      {lightboxItem.originalDate && (
                        <span>{new Date(lightboxItem.originalDate).toLocaleDateString('he-IL')}</span>
                      )}
                      {lightboxItem.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            מיקום מצורף
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLike(lightboxItem)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full transition-colors"
              >
                <Heart
                  size={24}
                  className={user && lightboxItem.likes?.includes(user.uid) ? 'text-red-500' : 'text-white'}
                  fill={user && lightboxItem.likes?.includes(user.uid) ? "currentColor" : "none"}
                />
                <span className="text-white font-medium text-lg">{lightboxItem.likes?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
