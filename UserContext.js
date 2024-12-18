// UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profilePic, setProfilePic] = useState('');

  // Function to load profile picture from AsyncStorage
  const loadProfilePic = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('@user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData && userData.profilePic) {
          setProfilePic(userData.profilePic);
        }
      }
    } catch (e) {
      console.error('Failed to load profile picture.', e);
    }
  };

  // Load profile picture on component mount
  useEffect(() => {
    loadProfilePic();
  }, []);

  // Save profile picture to AsyncStorage when it changes
  const updateProfilePic = async (newProfilePic) => {
    try {
      const storedUserData = await AsyncStorage.getItem('@user_data');
      const userData = storedUserData ? JSON.parse(storedUserData) : {};
      userData.profilePic = newProfilePic;
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      setProfilePic(newProfilePic);
    } catch (e) {
      console.error('Failed to save profile picture.', e);
    }
  };

  return (
    <UserContext.Provider value={{ profilePic, setProfilePic: updateProfilePic }}>
      {children}
    </UserContext.Provider>
  );
};
