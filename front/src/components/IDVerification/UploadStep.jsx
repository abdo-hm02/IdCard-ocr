import React from 'react';
import { Upload } from 'lucide-react';

const UploadBox = ({ onFileSelect, title, subtitle, image }) => (
  <div className="relative group">
    <div 
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
        ${image ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}
    >
      {image ? (
        <div className="relative">
          <img src={image} alt="Uploaded ID" className="mx-auto rounded-lg max-h-48 object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button className="bg-white text-gray-800 px-4 py-2 rounded-lg">
              Change Image
            </button>
          </div>
        </div>
      ) : (
        <>
          <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <h3 className="mt-2 text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer
          ${image ? 'group-hover:cursor-pointer' : 'cursor-pointer'}`}
      />
    </div>
  </div>
);

export default UploadBox;