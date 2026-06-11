import React, { useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

export default function PhotoManager({ 
  photos, 
  setPhotos, 
  profilePicUrl, 
  setProfilePicUrl, 
  onDeletePhoto 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const token = localStorage.getItem('token');
    const newUploadedUrls = [];

    try {
      // Loop through and upload each selected file
      for (const file of files) {
        // 1. Get Signature
        const sigResponse = await axios.get(`${API_URL}/get-signature/`, {
          headers: { Authorization: `Token ${token}` }
        });
        const { signature, timestamp, api_key, cloud_name, folder } = sigResponse.data;

        // 2. Prepare FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', api_key);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);
        // 3. Upload to Cloudinary
        const cloudinaryRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          formData
        );

        newUploadedUrls.push(cloudinaryRes.data.secure_url);
      }

      // 4. Update Parent State
      const updatedPhotos = [...photos, ...newUploadedUrls];
      setPhotos(updatedPhotos);

      // 5. Auto-select profile pic if it's the first/only photo uploaded
      if (!profilePicUrl && updatedPhotos.length > 0) {
        setProfilePicUrl(updatedPhotos[0]);
      } else if (photos.length === 0 && newUploadedUrls.length === 1) {
        setProfilePicUrl(newUploadedUrls[0]);
      }

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectProfilePic = (url) => {
    setProfilePicUrl(url);
  };

  const handleDelete = (url) => {
    // Call the parent delete handler (useful for API calls in Edit mode)
    if (onDeletePhoto) {
      onDeletePhoto(url);
    } else {
      // Just remove from local state (useful for Registration mode)
      const updatedPhotos = photos.filter(p => p !== url);
      setPhotos(updatedPhotos);
      
      // If we deleted the profile pic, reset it
      if (profilePicUrl === url) {
        setProfilePicUrl(updatedPhotos.length > 0 ? updatedPhotos[0] : null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Photos</h3>
          <p className="text-sm text-gray-500">Upload at least one photo. Select your favorite as your profile picture.</p>
        </div>
        
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Add Photos'}
        </button>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((url, idx) => {
            const isProfile = url === profilePicUrl;
            return (
              <div 
                key={idx} 
                className={`relative group rounded-md overflow-hidden border-2 transition-all ${
                  isProfile ? 'border-primary' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={url} alt={`Upload ${idx}`} className="w-full h-32 object-cover" />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleDelete(url)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      title="Delete Photo"
                    >
                      ✕
                    </button>
                  </div>
                  {!isProfile && (
                    <button 
                      onClick={() => handleSelectProfilePic(url)}
                      className="w-full py-1 text-xs bg-white text-gray-900 font-semibold rounded"
                    >
                      Set as Profile
                    </button>
                  )}
                </div>

                {isProfile && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-xs font-bold text-center py-1">
                    Profile Picture
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500">
          No photos uploaded yet.
        </div>
      )}
    </div>
  );
}