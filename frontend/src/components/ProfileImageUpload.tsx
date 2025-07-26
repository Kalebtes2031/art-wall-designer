import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiUser } from 'react-icons/fi';

interface ProfileImageUploadProps {
  onUploadSuccess?: (imageUrl: string) => void;
  className?: string;
}

export default function ProfileImageUpload({ onUploadSuccess, className = '' }: ProfileImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { user, updateUser } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.post('/auth/profile-image', formData);
      console.log('Profile image uploaded:', response.data);
      
      // Update user context with new profile image
      if (user) {
        updateUser({
          ...user,
          profileImage: response.data.profileImage
        });
      }
      
      onUploadSuccess?.(response.data.profileImage);
      
      // Reset form
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Failed to upload profile image:', err);
      alert('Failed to upload profile image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Current profile image */}
        <div className="relative">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
              <FiUser className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>
        
        {/* Upload section */}
        <div className="flex-1">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:border-blue-400 transition-colors group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                    {file.name}
                  </span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-2 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-sm text-gray-500 group-hover:text-gray-700">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="flex items-center space-x-4">
          <img
            src={preview}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload Profile Image'}
          </button>
        </div>
      )}
    </div>
  );
} 