import React, { useState } from 'react';
import { IconButton, CircularProgress } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const CloudinaryUpload = ({ setNewImage, banner = false }) => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const [loading, setLoading] = useState(false);
  const auth = getAuth(); 
  const db = getFirestore();  

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      const file = e.target.files[0];
      const options = {
        maxSizeMB: banner ? 2 : 1,
        maxWidthOrHeight: banner ? 3840 : 1920,
        useWebWorker: true
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('upload_preset', 'socialjobs');
        formData.append('folder', banner ? 'Banner images' : 'Profile pictures');

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        const optimizedImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${data.public_id}`;
        setNewImage(optimizedImageUrl);

        // Update the user's Firestore document with the new image URL
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const imageField = banner ? { bannerURL: optimizedImageUrl } : { photoURL: optimizedImageUrl };
          await updateDoc(docRef, imageField);
          console.log('Updated Firestore with image URL:', optimizedImageUrl);
        }
      } catch (error) {
        console.error('Error during image upload or compression:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id={banner ? 'banner-upload' : 'profile-upload'}
        type="file"
        onChange={handleImageChange}
      />
      <label htmlFor={banner ? 'banner-upload' : 'profile-upload'}>
        <IconButton
          color="primary"
          aria-label={banner ? "upload banner" : "upload profile picture"}
          component="span"
          sx={{
            position: 'absolute',
            bottom: banner ? '10px' : '-30px',
            right: banner ? '10px' : '50%',
            transform: banner ? 'none' : 'translateX(60px)',
            bgcolor: 'white',
            '&:hover': { bgcolor: '#f0f0f0' },
          }}
        >
          {loading ? <CircularProgress size={24} /> : <PhotoCameraIcon />}
        </IconButton>
      </label>
    </>
  );
};

export default CloudinaryUpload;
