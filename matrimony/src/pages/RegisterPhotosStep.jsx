import React, { useState } from 'react';
import PhotoManager from '../components/PhotoManager';

export default function RegisterPhotosStep({ onCompleteRegistration }) {
  const [photos, setPhotos] = useState([]);
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  const handleSubmit = () => {
    if (photos.length === 0) {
      alert("Please upload at least one photo to continue.");
      return;
    }
    
    // Pass the arrays to your final registration function
    // Payload should look like: { photos: [...], profile_pic: "url" }
    onCompleteRegistration({
      photos: photos,
      profile_pic: profilePicUrl
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-surface dark:bg-[#1f1b18] rounded-lg shadow-card">
      <h2 className="text-2xl font-serif font-bold mb-6">Let's add some photos</h2>
      
      <PhotoManager 
        photos={photos} 
        setPhotos={setPhotos} 
        profilePicUrl={profilePicUrl} 
        setProfilePicUrl={setProfilePicUrl} 
        // No onDeletePhoto passed, so it just removes from local state
      />

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSubmit}
          className="px-6 py-2 bg-primary text-white rounded-md font-medium"
        >
          Complete Registration
        </button>
      </div>
    </div>
  );
}