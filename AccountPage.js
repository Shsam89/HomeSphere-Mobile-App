import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { UserContext } from './UserContext';
import { format } from 'date-fns';
import logo from './assets/logos.png';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountPage = ({ route }) => {
  const [CNIC, setCNIC] = useState(null);
  const { setProfilePic } = useContext(UserContext);
  const [resident, setResident] = useState(null);
  const [plots, setPlots] = useState([]);
  const [ownership, setOwnership] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setLocalProfilePic] = useState('');

  useEffect(() => {
    const { CNIC } = route.params || {};
    if (CNIC) {
      setCNIC(CNIC);
    } else {
      console.error('CNIC is missing from route params');
    }
  }, [route.params]);
  

  const fetchData = async () => {
    if (!CNIC) {
      Alert.alert('Error', 'CNIC is required to fetch data.');
      return;
    }

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
      setLoading(true); // Show a loading indicator while fetching data
  
      // Fetch resident details
      const residentResponse = await axios.get('http://192.168.0.102:3000/resident/details', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`// Include JWT token in the Authorization header
        }
      });
  
      setResident(residentResponse.data);
      const picture = residentResponse.data.Picture || '';
      setLocalProfilePic(picture);
      setProfilePic(picture);
  
      // Fetch plots details
      const plotsResponse = await axios.get('http://192.168.0.102:3000/resident/plots', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Include JWT token in the Authorization header
        }
      });
  
      setPlots(plotsResponse.data);
  
      // Fetch ownership details
      const ownershipResponse = await axios.get('http://192.168.0.102:3000/resident/ownership', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Include JWT token in the Authorization header
        }
      });
  
      setOwnership(ownershipResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      Alert.alert('Error', error.response ? error.response.data.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false); // Optional: Hide the loading indicator
    }
  };

  useEffect(() => {
    
    if (CNIC) {
      fetchData(); // Only fetch data if CNIC is available
    } 
  }, [CNIC]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need permission to access your media library.');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      const { uri, mimeType, fileName } = result.assets[0];
  
      const formData = new FormData();
      formData.append('Picture', {
        uri: uri,
        type: mimeType || 'image/jpeg',
        name: fileName || 'profile.jpg',
      });
  
      try {
        const token = await AsyncStorage.getItem('@user_data').then(data => JSON.parse(data).token);
        if (!token) {
          Alert.alert('Error', 'No authentication token found');
          return;
        }
  
        const response = await axios.post('http://192.168.0.102:3000/resident/update-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`, // Include JWT token in the request header
          },
        });
  
        if (response.data.success) {
          Alert.alert('Success', 'Profile picture updated successfully.');
          setProfilePic(uri); // Update the context
          fetchData(); // Refresh data
        } else {
          Alert.alert('Error', 'Failed to update profile picture.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'An error occurred while uploading the image.');
      }
    }
  };
  
  if (loading) {
    return <ActivityIndicator size="large" color="#00aaff" style={styles.loader} />;
  }

  // Format date using date-fns
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MM-dd-yyyy');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Taskbar with Logo and App Name */}
      <View style={styles.taskbar}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.appName}>HomeSphere Residencia</Text>
      </View>
      <View style={styles.mainCard}>
        <View style={styles.profileHeaderCard}>
          <Icon name="user-circle" size={24} color="#333" />
          <Text style={styles.profileHeader}>Profile</Text>
        </View>
        
        <View style={styles.profileContainer}>
          <View style={styles.profileCard}>
            <Image
              key={profilePic}
              source={profilePic ? { uri:profilePic } : require('./assets/user2.jpg')}
              style={styles.profilePic}
            />
            <View style={styles.profileDetails}>
              {resident ? (
                <>
                  <View style={styles.detailRow}>
                    <Icon name="user" size={20} color="#333" />
                    <Text style={styles.infoText}>{resident.Names}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="phone" size={20} color="#333" />
                    <Text style={styles.infoText}>{resident.Contact}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="id-card" size={20} color="#333" />
                    <Text style={styles.infoText}>{resident.CNIC}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.noDataText}>No resident details found.</Text>
              )}
              <TouchableOpacity onPress={pickImage} style={styles.changePicButton}>
                <Icon name="camera" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Plot Details Card */}
        <View style={styles.profileCard_plot}>
          <Image
            source={require('./assets/plot.png')} // Placeholder image for Plot Details
            style={styles.profilePic}
          />
          <View style={styles.profileDetails}>
            <View style={styles.cardHeaderContainer}>
              <Text style={styles.cardHeader}>Plot Details</Text>
            </View>
            {plots.length > 0 ? (
              plots.map(plot => (
                <View key={plot.PlotID} style={styles.cardContent}>
                  <Text style={styles.cardText_Plot}><Icon name="map" size={17} /> Plot Number: {plot.PlotNumber}</Text>
                  <Text style={styles.cardText_Plot}><Icon name="arrows" size={17} /> Size: {plot.Size}</Text>
                  <Text style={styles.cardText_Plot}><Icon name="check-square" size={17} /> Plot Status: {plot.SoldStatus}</Text>
                  <Text style={styles.cardText_Plot}><Icon name="wrench" size={17} /> House Status: {plot.HouseStatus}</Text>
                  <Text style={styles.cardText_Plot}><Icon name="map-signs" size={17} /> Street #: {plot.Street}</Text>
                  <Text style={styles.cardText_Plot}><Icon name="home" size={17} /> Address: {plot.Addresses}</Text>
                  <Text style={styles.cardText_Plot}><Icon name="info-circle" size={17} /> Information: {plot.Information}</Text>
                </View>
              ))
            ) : (
              <Text>No plots found.</Text>
            )}
          </View>
        </View>

        {/* Ownership Card */}
        <View style={styles.profileCard}>
          <Image
            source={require('./assets/ownership.png')} // Placeholder image for Ownership details
            style={styles.profilePic}
          />
          <View style={styles.profileDetails}>
            <View style={styles.cardHeaderContainer}>
              <Text style={styles.cardHeader}>Ownership</Text>
            </View>
            {ownership.length > 0 ? (
              ownership.map(owner => (
                <View key={owner.OwnID} style={styles.cardContent}>
                  <Text style={styles.cardText}><Icon name="tag" size={17} /> Plot ID: {owner.PlotID}</Text>
                  <Text style={styles.cardText}><Icon name="calendar" size={17} /> Purchase Date:  {formatDate(owner.PurchaseDate)}</Text>
                </View>
              ))
            ) : (
              <Text>No ownership records found.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
    padding: 16,
  },
  mainCard: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  profileHeaderCard: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  profileHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profileCard: {
    width: '100%',
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 20,
  },
  profileCard_plot: {
    width: '100%',
    height: 550,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 20,
  },
  profilePic: {
    width: '40%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileDetails: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  changePicButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  cardsContainer: {
    width: '90%',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  cardContent: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  cardText: {
    fontSize: 17,
    color: '#555',
    marginBottom: 10,
  },
  cardText_Plot: {
    fontSize: 17,
    color: '#555',
    marginBottom: 25,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskbar: {
    width: '80%', // Adjust the width based on content
    backgroundColor: 'lightblue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'column', // Stack logo above app name
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 25,
    borderRadius: 20,
    elevation: 5, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderColor: '#ddd', // Add border
    borderWidth: 1,
  },
  logo: {
    width: 60, // Increased size
    height: 60, // Increased size
    resizeMode: 'contain',
    marginBottom: 8, // Space between logo and text
  },
  appName: {
    fontSize: 15, // Decreased font size
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AccountPage;
