/* eslint-env jest */
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native/Libraries/Utilities/BackHandler', () => ({
  exitApp: jest.fn(),
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  removeEventListener: jest.fn(),
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve({action: 'sharedAction'})),
}));

jest.mock('react-native-encrypted-storage', () => {
  const store = {};
  return {
    setItem: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn(key => Promise.resolve(store[key] || null)),
    removeItem: jest.fn(key => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
  };
});

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {
    getPhotos: jest.fn(() =>
      Promise.resolve({
        edges: [],
        page_info: {
          has_next_page: false,
          start_cursor: '',
          end_cursor: '',
        },
      }),
    ),
    getAlbums: jest.fn(() => Promise.resolve([])),
    deletePhotos: jest.fn(() => Promise.resolve([])),
    save: jest.fn(() => Promise.resolve('mock-uri')),
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn((opts, cb) => cb({didCancel: true})),
  launchImageLibrary: jest.fn((opts, cb) => cb({didCancel: true})),
}));

jest.mock('react-native-image-gallery', () => 'Gallery');
jest.mock('react-native-video', () => 'Video');
