
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Film, CheckCircle, AlertCircle } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebase';
import exifr from 'exifr';

export default function UploadMediaTab({ user }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newFiles = await Promise.all(selectedFiles.map(async (file) => {
      let metadata = {
        date: null,
        latitude: null,
        longitude: null
      };

      if (file.type.startsWith('image/')) {
        try {
          const exifData = await exifr.parse(file);
          if (exifData) {
            if (exifData.DateTimeOriginal) {
              metadata.date = new Date(exifData.DateTimeOriginal).toISOString();
            }
            if (exifData.latitude && exifData.longitude) {
              metadata.latitude = exifData.latitude;
              metadata.longitude = exifData.longitude;
            }
          }
        } catch (err) {
          console.warn('Could not extract EXIF data', err);
        }
      }

      return {
        file,
        id: Math.random().toString(36).substring(7),
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        metadata
      };
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !user) return;
    
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      for (const item of files) {
        const file = item.file;
        const storageRef = ref(storage, `media/${user.uid}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(prev => ({ ...prev, [item.id]: p }));
            },
            (error) => reject(error),
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Save to Firestore
                await addDoc(collection(db, 'media'), {
                  url: downloadURL,
                  type: item.type,
                  uploaderId: user.uid,
                  uploaderName: user.displayName || 'Unknown',
                  uploaderPhoto: user.photoURL || null,
                  uploadedAt: serverTimestamp(),
                  originalDate: item.metadata.date || null,
                  location: (item.metadata.latitude && item.metadata.longitude) ? {
                    lat: item.metadata.latitude,
                    lng: item.metadata.longitude
                  } : null,
                  likes: [],
                  isTopImage: false,
                  day: null // Can be assigned later based on date or manually
                });
                resolve();
              } catch (err) {
                reject(err);
              }
            }
          );
        });
      }
      
      setSuccess(true);
      setFiles([]);
      setProgress({});
    } catch (err) {
      console.error('Upload error:', err);
      setError('אירעה שגיאה בהעלאת הקבצים. אנא נסה שוב.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500">יש להתחבר כדי להעלות תמונות</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <h2 className="text-2xl font-medium text-gray-800 mb-6 px-2">העלאת מדיה 📸</h2>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-6 mb-6">
        <div 
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-1">לחץ לבחירת תמונות או סרטונים</p>
          <p className="text-sm text-gray-400">ניתן לבחור מספר קבצים יחד</p>
          <input 
            type="file" 
            multiple 
            accept="image/*,video/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6 flex items-center gap-2">
          <CheckCircle size={20} />
          <p>הקבצים הועלו בהצלחה!</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-4 mb-6">
          <h3 className="font-medium text-gray-700 mb-4">קבצים נבחרים ({files.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {files.map(item => (
              <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                {item.type === 'image' ? (
                  <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Film size={24} className="text-white" />
                  </div>
                )}
                
                {!uploading && (
                  <button 
                    onClick={() => removeFile(item.id)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                )}

                {uploading && progress[item.id] !== undefined && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-3/4 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300" 
                        style={{ width: `${progress[item.id]}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>מעלה...</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>העלה {files.length} קבצים</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
