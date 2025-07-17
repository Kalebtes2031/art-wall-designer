// components/WallUploader.tsx
import { useState } from 'react';
import api from '../utils/api';

export default function WallUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handle = async () => {
    console.log('📤 Starting wall upload…');
    if (!file) return;
    
    setIsUploading(true);
    
    const fd = new FormData();
    fd.append('wallImage', file);

    try {
      const res = await api.post<{ url: string }>('/wall/upload', fd);
      console.log('✅ Upload response:', res.data);
      onUpload(res.data.url);
    } catch (err) {
      console.error('❌ Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Upload Your Wall</h3>
      
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:border-blue-400 transition-colors group">
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
          onChange={e => setFile(e.target.files?.[0] || null)} 
        />
      </label>
      
      <button 
        onClick={handle} 
        disabled={!file || isUploading}
        className="w-full mt-3 py-2 px-4 bg-blue-600 hover:bg-blue-600 text-black font-medium rounded-lg transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          'Upload Wall'
        )}
      </button>
    </div>
  );
}