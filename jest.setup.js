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

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

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
    deletePhotos: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-image-gallery', () => 'Gallery');
