# Gallery App

A React Native app for managing and enhancing your photos. Includes a built-in gallery, noise removal, background remover, and a generative AI tab — all in one place.

## Features

- Browse and view photos from your device
- Remove noise from images with smart denoising
- Remove backgrounds with one tap
- Generative AI image tools with style presets (Vibrant, Cyberpunk, Vintage, Sketch)
- User authentication (Sign in / Sign up) with encrypted session persistence

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
pip install flask flask-cors pillow bcrypt

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
- Python Flask backend with Pillow, bcrypt, and rembg support

## Notes

- Minimum Node version: 18
- Android and iOS builds are both supported
- Encrypted storage is used for auth tokens
