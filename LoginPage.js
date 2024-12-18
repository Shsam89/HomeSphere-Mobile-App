import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, Linking, KeyboardAvoidingView,ScrollView, Keyboard, TouchableWithoutFeedback, Platform, } from 'react-native';
import Styles from './Styles'; // Importing the styles from Styles.js
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios'; // For making HTTP requests
import { AuthContext } from './AuthContext'; // Import AuthContext


const LoginPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params; // 'resident' or 'service'
  const { login } = React.useContext(AuthContext); // Access login function from AuthContext

  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [hsName, setHsName] = useState(''); // Housing Society Name
  const [adminId, setAdminId] = useState(null); // Admin ID

  // Function to fetch Admin ID based on Housing Society Name
  const fetchAdminId = async (hsName) => {
    try {
      const response = await axios.get('http://192.168.0.102:3000/admin/get-id', {
        params: {
          HS_Name: hsName
        }
      });
      if (response.data.success) {
        setAdminId(response.data.A_id);
        return response.data.A_id;
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch Admin ID');
        return null;
      }
    } catch (error) {
     
      Alert.alert('Error', 'Invalid Society Name.');
      return null;
    }
  };
  const handleLogin = async () => {
    if (!hsName) {
      Alert.alert('Error', 'Please enter Housing Society Name.');
      return;
    }
    if (!cnic) {
      Alert.alert('Error', 'Please enter CNIC.');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter Password.');
      return;
    }
  
    const fetchedAdminId = await fetchAdminId(hsName);
  
    if (!fetchedAdminId) {
      return; // Abort login if Admin ID is not fetched
    }
  
    const url = type === 'resident'
      ? 'http://192.168.0.102:3000/residents/login'
      : 'http://192.168.0.102:3000/staff/login';
  
    try {
      const response = await axios.post(url, { CNIC: cnic, Passwords: password, A_id: fetchedAdminId });
      if (response.data.success) {
        const { userName, token } = response.data;
  
        try {
          await AsyncStorage.setItem('@user_data', JSON.stringify({ cnic, userName, type, A_id: fetchedAdminId, token }));
        } catch (e) {
          console.error('Failed to save user data.', e);
        }
  
        // Assuming `userProfilePic` is available in your context or props
        login(type, token); // Pass profile picture URL to login function if available
        Alert.alert('Login Successful', `Welcome ${userName}`);
        navigation.navigate(type === 'resident' ? 'ResidentMainPage' : 'ServiceManMainPage', {
          userName: userName,
          CNIC: cnic,
        });
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
      }
    } catch (error) {
      console.log(error.response ? error.response.data : error.message); // Detailed error log
      Alert.alert('Login Failed', 'An error occurred. Please try again.');
    }
  };
  const handleForgotPassword = () => {
    // Replace with your actual forgot password logic or URL
    Linking.openURL('https://www.example.com/forgot-password');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Adjust for iOS keyboard
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={Styles.loginPageContainer}>
            <Image
              source={require('./assets/logos.png')} // Ensure the path to your logo is correct
              style={Styles.logo}
            />
            <Text style={Styles.loginTitle}>
              {type === 'resident' ? 'Resident Login' : 'Service Man Login'}
            </Text>
            <TextInput
              style={Styles.input}
              placeholder="Housing Society Name"
              value={hsName}
              onChangeText={setHsName}
            />
            <TextInput
              style={Styles.input}
              placeholder="CNIC"
              value={cnic}
              onChangeText={setCnic}
              keyboardType="numeric"
            />
            <TextInput
              style={Styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={Styles.submitButton} onPress={handleLogin}>
              <Text style={Styles.submitButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={Styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
