import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { AuthProvider } from './AuthContext'; // Import the AuthProvider
import { UserProvider } from './UserContext'; // Import the UserProvider
import LandingPage from './LandingPage';
import LoginOptions from './LoginOptions';
import LoginPage from './LoginPage'; 
import ResidentMainPage from './ResidentMainPage'; 
import ServiceManMainPage from './ServiceManMainPage'; 
import AccountPage from './AccountPage'; 
import AccountPage_S from './AccountPage_S';

const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState('LandingPage');
  
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setInitialRoute(parsedData.type === 'resident' ? 'ResidentMainPage' : 'ServiceManMainPage');
        } else {
          setInitialRoute('LandingPage'); // Fallback route if no user data
        }
      } catch (e) {
        console.error('Failed to retrieve user data.', e);
        setInitialRoute('LandingPage'); // Fallback route on error
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <UserProvider>
      <AuthProvider> 
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen 
              name="LandingPage" 
              component={LandingPage} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="LoginOptions" 
              component={LoginOptions} 
              options={{ headerTitle: 'Login Options' }}
            />
            <Stack.Screen 
              name="LoginPage" 
              component={LoginPage} 
              options={{ headerTitle: 'Login' }}
            />
            <Stack.Screen 
              name="ResidentMainPage" 
              component={ResidentMainPage} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ServiceManMainPage" 
              component={ServiceManMainPage} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AccountPage" 
              component={AccountPage} 
              options={{  headerShown: false }} // Optional: Customize header
            />
               <Stack.Screen 
              name="AccountPage_S" 
              component={AccountPage_S} 
              options={{ headerShown: false }} // Optional: Customize header
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </UserProvider>
   
  );
};

export default App;
