import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { databaseService } from './libs/db/database';
import AppNavigator from './navigation/AppNavigator';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize database
    databaseService.initDatabase().catch(error => {
      console.error('Failed to initialize database:', error);
    });

    // Cleanup on unmount
    return () => {
      databaseService.closeDatabase().catch(console.error);
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar barStyle="light-content" backgroundColor="#1976d2" />
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

export default App;
