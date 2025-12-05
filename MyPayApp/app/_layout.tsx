import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store/store';
import { databaseService } from '../src/libs/db/database';
import AppNavigator from '../src/navigation/AppNavigator';

const AppContent = () => {
  useEffect(() => {
    databaseService.initDatabase().catch(error => {
      console.error('Failed to initialize database:', error);
    });

    return () => {
      databaseService.closeDatabase().catch(console.error);
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />
      <AppNavigator />
    </>
  );
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}
