import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const fetchStaffDetails = async (CNIC) => {
  try {
    // Check for CNIC validity
    if (!CNIC) {
      throw new Error('CNIC is required');
    }

    // Retrieve the token from AsyncStorage
    const userData = await AsyncStorage.getItem('@user_data');
    if (!userData) {
      Alert.alert('Error', 'No user data found');
      return null;
    }

    const { token } = JSON.parse(userData);
    if (!token) {
      Alert.alert('Error', 'No token found');
      return null;
    }

    // Fetch staff details using CNIC
    const staffResponse = await axios.get(`http://192.168.0.102:3000/Staff/detailsbyCNIC?CNIC=${encodeURIComponent(CNIC)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const staff = staffResponse.data;

    if (!staff) {
      console.warn('No staff found with the given CNIC');
      return null;
    }

    return staff;

  } catch (error) {
    console.error('Error fetching staff details:', error.response ? error.response.data : error.message);
    Alert.alert('Error', error.response ? error.response.data.message : 'An error occurred while fetching staff details.');
    throw error;
  }
};