import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const fetchResidentDetails = async (CNIC) => {
  try {
    // Retrieve the token from AsyncStorage
    const userData = await AsyncStorage.getItem('@user_data');
    if (!userData) {
      Alert.alert('Error', 'No user data found');
      return;
    }

    const { token } = JSON.parse(userData);
    if (!token) {
      Alert.alert('Error', 'No token found');
      return;
    }

    // Fetch resident details
    const residentResponse = await axios.get('http://192.168.0.102:3000/resident/details', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Include JWT token in the Authorization header
      }
    });

    const resident = residentResponse.data;

    // Fetch plots details
    const plotsResponse = await axios.get('http://192.168.0.102:3000/resident/plots', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Include JWT token in the Authorization header
      }
    });

    const plots = plotsResponse.data;

    // Fetch ownership details
    const ownershipResponse = await axios.get('http://192.168.0.102:3000/resident/ownership', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Include JWT token in the Authorization header
      }
    });

    const ownership = ownershipResponse.data;

    // Return all the data as an object
    return {
      resident,
      plots,
      ownership
    };

  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
    Alert.alert('Error', error.response ? error.response.data.message : 'An error occurred. Please try again.');
    throw error; // Rethrow the error if you want the calling component to handle it
  }
};
