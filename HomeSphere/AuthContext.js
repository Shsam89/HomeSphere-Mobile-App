// AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from './UserContext'; // Import UserContext

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);
  const { setProfilePic } = useContext(UserContext); // Correctly access UserContext

  // Updated login function to handle JWT token storage
  const login = async (type, token, userProfilePic) => {
    setUserType(type);
    try {
      // Store user type and token together in AsyncStorage
      const userData = JSON.stringify({ userType: type, token: token });
      await AsyncStorage.setItem('@user_data', userData);

      if (userProfilePic) {
        setProfilePic(userProfilePic); // Update the profile picture
      }
    } catch (e) {
      console.error('Failed to save user data.', e);
    }
  };

  // Updated logout function to clear all user data
  const logout = async () => {
    setUserType(null);
    try {
      // Clear all user data from AsyncStorage
      await AsyncStorage.removeItem('@user_data');
      setProfilePic(''); // Clear the profile picture on logout
    } catch (e) {
      console.error('Failed to clear user data.', e);
    }
  };
  const getToken = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const { token } = JSON.parse(userData);
        return token;
      }
      return null;
    } catch (e) {
      console.error('Failed to get user data.', e);
      return null;
    }
  };


  return (
    <AuthContext.Provider value={{ userType, login, logout,getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
