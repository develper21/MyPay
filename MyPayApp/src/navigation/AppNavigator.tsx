import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

// Import screens (we'll create these next)
import AuthScreen from '../features/auth/AuthScreen';
import HomeScreen from '../features/home/HomeScreen';
import PayScreen from '../features/payments/PayScreen';
import CalendarHistory from '../history/CalendarHistory';
import MoreScreen from '../features/more/MoreScreen';
import DayDetailScreen from '../history/DayDetailScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DayDetail: { date: string };
};

export type MainTabParamList = {
  Home: undefined;
  Pay: undefined;
  History: undefined;
  More: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Pay':
              iconName = 'send';
              break;
            case 'History':
              iconName = 'history';
              break;
            case 'More':
              iconName = 'more-horiz';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Pay" 
        component={PayScreen}
        options={{ title: 'Pay' }}
      />
      <Tab.Screen 
        name="History" 
        component={CalendarHistory}
        options={{ title: 'History' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="DayDetail" 
              component={DayDetailScreen}
              options={{ 
                headerShown: true,
                title: 'Transaction Details',
                headerStyle: { backgroundColor: '#1976d2' },
                headerTintColor: 'white',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
