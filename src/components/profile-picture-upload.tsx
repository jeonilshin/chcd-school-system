'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ProfilePictureUploadProps {
  onFileSelect: (file: File | null) => void;
  initialPreview?: string;
}

export function ProfilePictureUpload({ onFileSelect, initialPreview }: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      return 'File size must not exceed 100MB';
    }

    // Validate file format (JPEG, PNG)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return 'File must be JPEG or PNG format';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      return;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onFileSelect(null);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Upload a 2x2 student photograph</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>White background</li>
            <li>Taken within the last 3 months</li>
            <li>Decent attire</li>
            <li>No eyeglasses</li>
            <li>2x2 size</li>
            <li>Maximum file size: 100MB</li>
            <li>Format: JPEG or PNG</li>
          </ul>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Preview or Upload Button */}
        {preview ? (
          <div className="space-y-4">
            <div className="relative w-48 h-48 mx-auto border-2 border-gray-300 rounded-md overflow-hidden">
              <img
                src={preview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center">
              <Button type="button" variant="outline" onClick={handleClick}>
                Change Photo
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">Click to upload profile picture</p>
            <p className="text-xs text-gray-500">JPEG or PNG (max 100MB)</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Upload Progress (if needed) */}
        {isUploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-600">Uploading...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
