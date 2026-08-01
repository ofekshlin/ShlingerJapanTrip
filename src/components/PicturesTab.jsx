
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { Heart, Map as MapIcon, Grid, Share2, Maximize2, X, ChevronRight, ChevronLeft, Play, Download } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PicturesTab({ user, handleLogin }) {
  const [view, setView] = useState('daily'); // 'daily' or 'gallery'
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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

  const toggleSelection = (item) => {
    if (selectedItems.includes(item.id)) {
      setSelectedItems(prev => prev.filter(id => id !== item.id));
      if (selectedItems.length === 1) setIsSelectionMode(false);
    } else {
      setSelectedItems(prev => [...prev, item.id]);
    }
  };

  const handleLongPress = (item) => {
    setIsSelectionMode(true);
    toggleSelection(item);
  };

  const handleShare = async (itemsToShare) => {
    if (!navigator.share) {
      alert('שיתוף לא נתמך בדפדפן זה');
      return;
    }

    try {
      const files = [];
      for (const item of itemsToShare) {
        if (item.type === 'image') {
          const response = await fetch(item.url);
          const blob = await response.blob();
          const file = new File([blob], `image_${item.id}.jpg`, { type: blob.type });
          files.push(file);
        }
      }

      if (files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          title: 'תמונות מיפן',
          text: 'תראו את התמונות האלה מיפן!',
          files: files
        });
      } else {
        const urls = itemsToShare.map(item => item.url).join('\n');
        await navigator.share({
          title: 'תמונות מיפן',
          text: 'תראו את התמונות האלה מיפן!\n' + urls
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  const handleDownload = async (item) => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `image_${item.id}.${item.type === 'image' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };


  const renderMediaItem = (item, isGallery = false) => {
    const isSelected = selectedItems.includes(item.id);
    const hasLiked = user && item.likes?.includes(user.uid);
    const likeCount = item.likes?.length || 0;

    return (
      <div 
        key={item.id} 
        className={`relative rounded-2xl overflow-hidden bg-gray-100 ${isGallery ? 'aspect-square' : 'mb-4'}`}
        onClick={() => {
          if (isSelectionMode) {
            toggleSelection(item);
          } else {
            setLightboxItem(item);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress(item);
        }}
      >
        {item.type === 'image' ? (
          <img src={item.url} alt="Trip media" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="relative w-full h-full">
            <video src={item.url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="text-white w-12 h-12 opacity-80" />
            </div>
          </div>
        )}

        {/* Overlay for selection */}
        {isSelectionMode && (
          <div className={`absolute inset-0 border-4 ${isSelected ? 'border-blue-500 bg-blue-500/20' : 'border-transparent bg-black/10'}`}>
            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-white'}`}>
              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </div>
        )}

        {/* Like button (only in daily view or if not in selection mode) */}
        {!isSelectionMode && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(item);
              }}
              className="p-1 rounded-full transition-colors text-white ml-1"
            >
              <Download size={16} />
            </button>
          </div>
        )}

        {/* Uploader info */}
        {!isGallery && !isSelectionMode && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
            {item.uploaderPhoto && (
              <img src={item.uploaderPhoto} alt={item.uploaderName} className="w-5 h-5 rounded-full" />
            )}
            <span className="text-white text-xs">{item.uploaderName}</span>
          </div>
        )}
      </div>
    );
  };

  const renderDailyView = () => {
    // Filter media for the selected day (for now, just mock it or use all if day is not set)
    // In a real app, we'd filter by item.day === selectedDay or by date range
    const dailyMedia = media.filter(m => m.day === selectedDay || !m.day); // Fallback for unassigned
    
    // Sort by likes for "Top Images"
    const topMedia = [...dailyMedia].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

    const mediaWithLocation = dailyMedia.filter(m => m.location);
    const mapCenter = mediaWithLocation.length > 0 
      ? [mediaWithLocation[0].location.lat, mediaWithLocation[0].location.lng]
      : [35.6762, 139.6503]; // Default to Tokyo

    return (
      <div className="space-y-6">
        {/* Day Navigation */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-2 shadow-sm border border-gray-50">
          <button 
            onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl"
          >
            <ChevronRight size={20} />
          </button>
          <span className="font-medium text-gray-700">יום {selectedDay}</span>
          <button 
            onClick={() => setSelectedDay(selectedDay + 1)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl"
          >
            <ChevronLeft size={20} />
          </button>
        </div>


        {/* Top Images */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-medium text-gray-700 flex items-center gap-2">
              <Heart size={18} className="text-red-500" />
              התמונות המובילות
            </h3>
            {user && (
              <button 
                onClick={() => handleShare(topMedia)}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium"
              >
                שתף סיכום יומי
              </button>
            )}
          </div>

          {topMedia.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {topMedia.map(item => renderMediaItem(item, true))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-50">
              <p className="text-gray-500">אין תמונות ליום זה עדיין</p>
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden mt-6">
          <div className="p-4 border-b border-gray-50 flex items-center gap-2">
            <MapIcon size={18} className="text-blue-500" />
            <h3 className="font-medium text-gray-700">מפת תמונות</h3>
          </div>
          <div className="h-48 w-full z-0 relative">
            <MapContainer
              center={mapCenter}
              zoom={mediaWithLocation.length > 0 ? 13 : 5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {mediaWithLocation.map(item => (
                  <Marker key={item.id} position={[item.location.lat, item.location.lng]}>
                    <Popup>
                      <div className="w-24 h-24">
                        {item.type === 'image' ? (
                          <img src={item.url} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover rounded-lg" />
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
          </div>
        </div>

      </div>
    );
  };

  const renderGalleryView = () => {
    return (
      <div>
        {isSelectionMode && (
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-gray-100 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => {
                setIsSelectionMode(false);
                setSelectedItems([]);
              }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
              <span className="font-medium text-gray-700">{selectedItems.length} נבחרו</span>
            </div>
            <button 
              onClick={() => handleShare(media.filter(m => selectedItems.includes(m.id)))}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            >
              <Share2 size={18} />
              <span>שתף</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1">
          {media.map(item => renderMediaItem(item, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* View Toggle */}
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
        <button
          onClick={() => setView('daily')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            view === 'daily' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapIcon size={16} />
          סיכום יומי
        </button>
        <button
          onClick={() => setView('gallery')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            view === 'gallery' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Grid size={16} />
          גלריה מלאה
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        view === 'daily' ? renderDailyView() : renderGalleryView()
      )}

      {/* Lightbox */}
      {lightboxItem && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent absolute top-0 w-full z-10">
            <button 
              onClick={() => setLightboxItem(null)}
              className="p-2 text-white/80 hover:text-white bg-black/20 rounded-full backdrop-blur-sm"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleShare([lightboxItem])}
                className="p-2 text-white/80 hover:text-white bg-black/20 rounded-full backdrop-blur-sm"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-4">
            {lightboxItem.type === 'image' ? (
              <img 
                src={lightboxItem.url} 
                alt="Full size" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video 
                src={lightboxItem.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {lightboxItem.uploaderPhoto && (
                  <img src={lightboxItem.uploaderPhoto} alt={lightboxItem.uploaderName} className="w-8 h-8 rounded-full border border-white/20" />
                )}
                <div className="text-white">
                  <p className="text-sm font-medium">{lightboxItem.uploaderName}</p>
                  {lightboxItem.originalDate && (
                    <p className="text-xs text-white/60">
                      {new Date(lightboxItem.originalDate).toLocaleDateString('he-IL')}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleLike(lightboxItem)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-colors"
              >
                <Heart 
                  size={20} 
                  className={user && lightboxItem.likes?.includes(user.uid) ? 'text-red-500' : 'text-white'} 
                  fill={user && lightboxItem.likes?.includes(user.uid) ? "currentColor" : "none"} 
                />
                <span className="text-white font-medium">{lightboxItem.likes?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
