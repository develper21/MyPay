import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icon component moved outside to avoid re-creation on every render
const TabBarIcon = ({ routeName, color, size }: { routeName: string; color: string; size: number }) => {
  let iconName: string;

  switch (routeName) {
    case 'Home':
      iconName = 'home';
      break;
    case 'Pay':
      iconName = 'payment';
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
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <TabBarIcon routeName={route.name} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Pay" component={PayScreen} />
      <Tab.Screen name="History" component={CalendarHistory} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
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
  );
};

export default AppNavigator;
