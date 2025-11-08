import React, { useCallback } from 'react';
// FIX: Import UploadCloud and PlusSquare from the central Icons component.
import { UploadCloud, PlusSquare } from './icons/Icons';

// TODO (T1 - Sachi): Implement image cropping and reordering.

interface ImageUploaderProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, setFiles }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 4));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const newFiles = Array.from(event.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 4));
    }
  }, [setFiles]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full max-w-md">
      {files.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {files.map((file, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview ${index}`}
                className="h-full w-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs"
              >
                &times;
              </button>
            </div>
          ))}
          {files.length < 4 && (
            <label className="flex items-center justify-center aspect-square border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-green-400">
              <div className="text-center">
                <PlusSquare className="mx-auto h-8 w-8 text-gray-500" />
                <span className="mt-2 block text-sm text-gray-400">Add more</span>
              </div>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>
      ) : (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="flex justify-center items-center w-full"
        >
            <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-gray-800 rounded-lg w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-green-400 transition-colors"
            >
                <UploadCloud className="w-12 h-12 text-gray-500" />
                <span className="mt-2 block text-sm font-medium text-gray-400">
                    Click to upload or drag and drop
                </span>
                <span className="block text-xs text-gray-500">PNG, JPG up to 10MB</span>
                <input id="file-upload" name="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange}/>
            </label>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
