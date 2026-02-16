'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSchoolSettings } from '@/contexts/school-settings-context';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Settings {
  schoolName: string;
  schoolLogoUrl: string | null;
  primaryColor: string;
}

export function SchoolSettings() {
  const { settings: contextSettings, refreshSettings } = useSchoolSettings();
  const { buttonClasses } = useThemeColor();
  const [settings, setSettings] = useState<Settings>({
    schoolName: 'School',
    schoolLogoUrl: null,
    primaryColor: '#3B82F6'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSettings(contextSettings);
    setLoading(false);
  }, [contextSettings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const { logoUrl } = await response.json();
        setSettings(prev => ({ ...prev, schoolLogoUrl: logoUrl }));
        setMessage('Logo uploaded successfully!');
      } else {
        setMessage('Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        await refreshSettings(); // Refresh the context
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">School Settings</h1>
        <p className="text-gray-600 mb-8">Customize your school's branding and appearance</p>

        <Card className="p-6">
          <div className="space-y-6">
            {/* School Name */}
            <div>
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={settings.schoolName}
                onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="Enter school name"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                This will appear in the navigation bar and throughout the system
              </p>
            </div>

            {/* School Logo */}
            <div>
              <Label htmlFor="schoolLogo">School Logo</Label>
              <div className="mt-2 space-y-4">
                {settings.schoolLogoUrl && (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <Image
                        src={settings.schoolLogoUrl}
                        alt="School Logo"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, schoolLogoUrl: null }))}
                    >
                      Remove Logo
                    </Button>
                  </div>
                )}
                <div>
                  <Input
                    id="schoolLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && (
                    <p className="text-sm text-blue-600 mt-1">Uploading...</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a square image (recommended: 512x512px, PNG or JPG)
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This color will be used for buttons, links, and highlights throughout the system
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, primaryColor: '#3B82F6' }))}
                  className="px-3 py-1 rounded text-sm bg-blue-500 text-white"
                >
                  Blue (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, primaryColor: '#10B981' }))}
                  className="px-3 py-1 rounded text-sm bg-green-500 text-white"
                >
                  Green
                </button>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, primaryColor: '#F59E0B' }))}
                  className="px-3 py-1 rounded text-sm bg-amber-500 text-white"
                >
                  Amber
                </button>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, primaryColor: '#EF4444' }))}
                  className="px-3 py-1 rounded text-sm bg-red-500 text-white"
                >
                  Red
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('success') 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={saving}
                className={buttonClasses}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
