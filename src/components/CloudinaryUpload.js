

import React, { useState, useEffect } from 'react';
import { IconButton, CircularProgress, Menu, MenuItem } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Delete as DeleteIcon } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

export default function CloudinaryUpload({ setNewImage, banner = false }) {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const checkExistingImage = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHasExistingImage(banner ? !!data.bannerURL : !!data.profileURL);
        }
      }
    };
    checkExistingImage();
  }, [auth.currentUser, banner]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      const file = e.target.files[0];
      const options = {
        maxSizeMB: banner ? 2 : 1,
        maxWidthOrHeight: banner ? 3840 : 1920,
        useWebWorker: true,
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

        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const imageField = banner ? { bannerURL: optimizedImageUrl } : { profileURL: optimizedImageUrl };
          await updateDoc(docRef, imageField);
          console.log(`${banner ? 'Banner' : 'Profile'} image uploaded successfully:`, optimizedImageUrl);
        }
      } catch (error) {
        console.error('Error during image upload or compression:', error);
      } finally {
        setLoading(false);
        handleClose();
      }
    }
  };

  const handleDeleteImage = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const imageField = banner ? 'bannerURL' : 'profileURL';
        
        // Get the current image URL
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentImageUrl = data[imageField];
          
          // Delete image from Cloudinary
          if (currentImageUrl) {
            const publicId = currentImageUrl.split('/').pop().split('.')[0]; // Extract public_id from URL
            await fetch(`/cloudinary/delete-image`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_id: publicId }),
            });
          }
        }
        
        // Update Firestore document
        await updateDoc(docRef, { [imageField]: null });
        setNewImage(null);
        setHasExistingImage(false);
        console.log(`${banner ? 'Banner' : 'Profile'} image deleted successfully`);
      }
    } catch (error) {
      console.error('Error during image deletion:', error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <>
      <IconButton
        color="primary"
        aria-label={banner ? "manage banner" : "manage profile picture"}
        onClick={handleClick}
        sx={{
          position: 'absolute',
          bottom: banner ? '10px' : '-20px',
          right: banner ? '10px' : '49%',
          transform: banner ? 'none' : 'translateX(60px)',
          bgcolor: 'white',
          '&:hover': { bgcolor: '#f0f0f0' },
        }}
      >
        {loading ? <CircularProgress size={24} /> : <PhotoCameraIcon />}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem>
          <label htmlFor={banner ? 'banner-upload' : 'profile-upload'}>
            {hasExistingImage ? 'Change Photo' : 'Upload Photo'}
          </label>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id={banner ? 'banner-upload' : 'profile-upload'}
            type="file"
            onChange={handleImageChange}
          />
        </MenuItem>
        {hasExistingImage && (
          <MenuItem onClick={handleDeleteImage}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Photo
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

