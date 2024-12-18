import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Styles from './Styles'; // Import the existing styles

const LoginOptions = ({ navigation }) => {
  return (
    <View style={Styles.container}>
      <TouchableOpacity 
        style={Styles.button} 
        onPress={() => navigation.navigate('LoginPage', { type: 'resident' })}
      >
        <Text style={Styles.buttonText}>Login As Resident</Text>
        <Image 
          source={require('./assets/resident.png')} // Replace with your image
          style={Styles.buttonImage}
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={Styles.button} 
        onPress={() => navigation.navigate('LoginPage', { type: 'service' })}
      >
        <Text style={Styles.buttonText}>Login As Service Man</Text>
        <Image 
          source={require('./assets/serviceman.png')} // Replace with your image
          style={Styles.buttonImage}
        />
      </TouchableOpacity>
    </View>
  );
};

export default LoginOptions;
