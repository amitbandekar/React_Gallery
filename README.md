# Gallery App

A React Native app for managing and enhancing your photos. Includes a built-in gallery, noise removal, background remover, and a generative AI tab — all in one place.

## Features

- Browse and view photos from your device
- Remove noise from images
- Remove backgrounds with one tap
- Generative AI image tools
- User authentication (Sign in / Sign up)

## Getting Started

Make sure you have [Node.js](https://nodejs.org/) (v18+), React Native CLI, and Android Studio or Xcode set up before running the app.

### Install dependencies

```bash
npm install
# or
yarn install
```

### Start the Metro bundler

```bash
npm start
# or
yarn start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

### Run tests

```bash
npm test
```

## Tech Stack

- React Native 0.73
- TypeScript
- React Navigation (Stack + Bottom Tabs)
- NativeWind (Tailwind for RN)
- Axios
- React Native Camera Roll
- React Native Image Picker

## Backend

The app uses a Python backend (`backend.py`) for image processing features. Make sure the backend is running before using noise removal or background remover features.

## Notes

- Minimum Node version: 18
- Android and iOS builds are both supported
- Encrypted storage is used for auth tokens
