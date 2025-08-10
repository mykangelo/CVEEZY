import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, RotateCw, Crop, ZoomIn, ZoomOut, Save, ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (photoData: string) => void;
  currentPhoto?: string;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ isOpen, onClose, onSave, currentPhoto }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(currentPhoto || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cropData, setCropData] = useState<CropData>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    scale: 1,
    rotation: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file (JPEG, PNG, or GIF)');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRotate = () => {
    setCropData(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const handleScaleChange = (delta: number) => {
    setCropData(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale + delta))
    }));
  };

  const handleCropChange = (axis: 'x' | 'y', value: number) => {
    setCropData(prev => ({
      ...prev,
      [axis]: value
    }));
  };

  const generateCroppedImage = useCallback(() => {
    if (!uploadedImage || !canvasRef.current || !imageRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const img = imageRef.current;
    
    // Set canvas size
    canvas.width = 300;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Move to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate((cropData.rotation * Math.PI) / 180);

    // Apply scale
    ctx.scale(cropData.scale, cropData.scale);

    // Draw image centered
    const drawWidth = img.naturalWidth;
    const drawHeight = img.naturalHeight;
    
    ctx.drawImage(
      img,
      -drawWidth / 2 + cropData.x,
      -drawHeight / 2 + cropData.y,
      drawWidth,
      drawHeight
    );

    // Restore context state
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.9);
  }, [uploadedImage, cropData]);

  const handleSave = () => {
    const croppedImage = generateCroppedImage();
    if (croppedImage) {
      onSave(croppedImage);
      onClose();
    }
  };

  const handleChangePhoto = () => {
    setIsEditing(false);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Photo Upload</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {uploadedImage && (
            <div className="mb-4 flex items-center text-green-600">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm font-medium">
                Uploaded: {uploadedImage ? 'photo.jpg' : 'No file selected'}
              </span>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-blue-500 mb-3">How to add your photo:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2">✨</span>
                Use a recent color photo in JPEG, PNG, or GIF format and up to 10 MB.
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2">✨</span>
                Crop your photo so it only shows your head and shoulders.
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2">✨</span>
                If you already uploaded a photo, uploading another will replace it.
              </div>
            </div>
          </div>

          {!uploadedImage || !isEditing ? (
            /* Upload Area */
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your resume here
                </h3>
                <p className="text-gray-500 mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Upload from device
                </button>
              </div>
            </div>
          ) : (
            /* Photo Editor */
            <div className="space-y-6">
              {/* Photo Preview and Controls */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Photo Preview */}
                <div className="flex-1">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="relative border-2 border-white shadow-lg"
                        style={{
                          width: '300px',
                          height: '300px',
                          overflow: 'hidden',
                          borderRadius: '8px'
                        }}
                      >
                        <img
                          ref={imageRef}
                          src={uploadedImage}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-contain"
                          style={{
                            transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
                            transformOrigin: 'center'
                          }}
                          onLoad={() => {
                            // Initialize crop data when image loads
                            if (imageRef.current) {
                              setCropData(prev => ({
                                ...prev,
                                width: imageRef.current!.naturalWidth,
                                height: imageRef.current!.naturalHeight
                              }));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="w-full lg:w-80 space-y-4">
                  {/* Rotation */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Rotate</label>
                      <button
                        onClick={handleRotate}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                      >
                        <RotateCw className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Scale */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Scale</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleScaleChange(-0.1)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </button>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={cropData.scale}
                        onChange={(e) => setCropData(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                        className="flex-1"
                      />
                      <button
                        onClick={() => handleScaleChange(0.1)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {Math.round(cropData.scale * 100)}%
                    </div>
                  </div>

                  {/* Position */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Position</label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600">Horizontal</label>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={cropData.x}
                          onChange={(e) => handleCropChange('x', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Vertical</label>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={cropData.y}
                          onChange={(e) => handleCropChange('y', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Photo Button */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleChangePhoto}
                  className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Change photo
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Some employers won't consider resumes with photos. Check the job application requirements before you add a photo.
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {uploadedImage && isEditing && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default PhotoUpload;
