import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ClientHomeScreen from './src/screens/client/ClientHomeScreen';
import DriverHomeScreen from './src/screens/driver/DriverHomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BookingScreen from './src/screens/client/BookingScreen';
import MyBookingsScreen from './src/screens/client/MyBookingsScreen';
import VehicleListScreen from './src/screens/client/VehicleListScreen';
import DriverBookingsScreen from './src/screens/driver/DriverBookingsScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
          <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
          <Stack.Screen name="VehicleList" component={VehicleListScreen} />
          <Stack.Screen name="DriverBookings" component={DriverBookingsScreen} />
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
