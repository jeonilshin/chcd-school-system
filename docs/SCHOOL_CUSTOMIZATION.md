# School Customization Guide

## Overview
The admin panel now supports full school branding customization, allowing you to personalize the appearance of your school management system.

## Features

### 1. School Name
- Customize the school name displayed in the navigation bar
- Default: "School"
- Appears in the top-left corner of the admin panel

### 2. School Logo
- Upload a custom logo to replace the default letter icon
- Recommended size: 512x512px (square)
- Supported formats: PNG, JPG
- The logo will be displayed in the navigation bar

### 3. Primary Color
- Customize the primary color used throughout the system
- Default: Blue (#3B82F6)
- Quick presets available:
  - Blue (Default)
  - Green
  - Amber
  - Red
- Custom hex color input supported

## How to Access Settings

1. Log in as an ADMIN or PRINCIPAL
2. Navigate to the admin panel
3. Click on "Settings" in the sidebar navigation
4. Update your preferences
5. Click "Save Settings"

## Technical Details

### Database
- Settings are stored in the `SchoolSettings` table
- Single record with ID "default"
- Fields:
  - `schoolName`: String
  - `schoolLogoUrl`: String (nullable)
  - `primaryColor`: String (hex color)

### API Endpoints
- `GET /api/settings` - Fetch current settings
- `PUT /api/settings` - Update settings (requires ADMIN/PRINCIPAL role)
- `POST /api/settings/logo` - Upload school logo (requires ADMIN/PRINCIPAL role)

### File Storage
- Logos are stored in `public/uploads/school/`
- Accessible via `/uploads/school/[filename]`

## Color Customization
The primary color affects:
- Navigation active states
- Button backgrounds
- Link colors
- Highlight colors
- User profile badge

## Default Values
- School Name: "School"
- Logo: None (displays first letter of school name)
- Primary Color: #3B82F6 (Blue)

## Notes
- Changes take effect immediately after saving
- Page refresh required to see updated branding
- Only ADMIN and PRINCIPAL roles can modify settings
- All users see the customized branding
