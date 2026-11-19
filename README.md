# Gallery App

A React Native app for managing and enhancing your photos and videos. Includes a built-in gallery, private hidden vault, noise removal, background remover, and a generative AI tab — all in one place.

## Features

- **Media Browsing**: Browse photos and videos from your device with customizable 2/3/4-column grids.
- **Video Support**: Detect and filter video media with duration badges and native video playback integration.
- **Private Vault (Hidden Images & Videos)**:
  - Securely hide photos and videos away from the main gallery.
  - Multi-touch pinch-to-zoom gesture on the gallery screen triggers the vault unlock prompt.
  - Password / PIN setup on first use, with secure encrypted storage.
  - Full-featured vault management: view hidden items, unhide back to gallery, or delete permanently.
- **Albums & Folders**: Automatic on-device album detection (Camera, Screenshots, WhatsApp, Downloads, etc.) with quick filter chips.
- **Favorites**: Heart/star photos to collect favorites with dedicated filter view.
- **Batch Operations**: Long-press multi-select mode for batch sharing, batch hiding, and batch deleting.
- **Full-Screen Viewer**: Rotate, inspect EXIF details (file size, dimensions, duration, date), native system share sheet, and direct one-tap send to tools.
- **Noise Removal**: Denoise images using smart filtering.
- **Background Remover**: Remove photo backgrounds with one tap.
- **Generative AI Tools**: Apply AI artistic styles (Vibrant, Cyberpunk, Vintage, Sketch).
- **User Authentication**: Sign in and Sign up with encrypted session persistence.

## Getting Started

Make sure you have [Node.js](https://nodejs.org/) (v18+), React Native CLI, and Android Studio or Xcode set up before running the app.

### Install dependencies

```bash
npm install
```

### Start the Python backend

The app uses a Python backend (`backend.py`) for authentication, noise removal, background removal, and AI enhancement.

```bash
# Install Python dependencies
pip install flask flask-cors pillow bcrypt pymysql

# Start backend server (runs on port 5000)
python3 backend.py
```

### Start the Metro bundler

```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

### Run tests and linting

```bash
# Run React Native tests
npm test

# Run linter
npm run lint

# Run backend unit tests
python3 test_backend.py
```

## Tech Stack

- React Native 0.73
- TypeScript
- React Navigation (Stack + Bottom Tabs)
- NativeWind (Tailwind for RN)
- React Native Camera Roll
- React Native Image Picker
- Encrypted Storage for session & vault password persistence
- Python Flask backend with Pillow, bcrypt, and rembg support

## Notes

- Minimum Node version: 18
- Android and iOS builds are both supported
- Encrypted storage is used for auth tokens and private vault data
