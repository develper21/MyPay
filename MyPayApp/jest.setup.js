// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock react-native-calendars
jest.mock('react-native-calendars', () => ({
  Calendar: 'Calendar',
  CalendarList: 'CalendarList',
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  INTERNET_CREDENTIALS: 'internet',
  setInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
  getSupportedBiometryType: jest.fn(),
}));

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => ({
  isSensorAvailable: jest.fn(),
  createKeys: jest.fn(),
  createSignature: jest.fn(),
  deleteKeys: jest.fn(),
}));

// Mock react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => ({
    executeSql: jest.fn(),
    close: jest.fn(),
  })),
  DEBUG: true,
  enablePromise: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock crypto for encryption service
global.crypto = {
  getRandomValues: jest.fn((arr) => {
    return arr.map(() => Math.floor(Math.random() * 256));
  }),
};

// Mock btoa/atob for encryption
global.btoa = jest.fn((str) => Buffer.from(str, 'binary').toString('base64'));
global.atob = jest.fn((str) => Buffer.from(str, 'base64').toString('binary'));

// Silence console.log in tests unless debugging
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
