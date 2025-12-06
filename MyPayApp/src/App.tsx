import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { databaseService } from './libs/db/database';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './theme/theme';

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
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={colors.background} 
          translucent={false}
        />
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

export default App;
