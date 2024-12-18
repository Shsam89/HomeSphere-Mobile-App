import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Linking } from 'react-native';
import Swiper from 'react-native-swiper';
import Styles from './Styles'; // Importing the styles from Styles.js
import Icon from 'react-native-vector-icons/FontAwesome';

const { width: screenWidth } = Dimensions.get('window');

const LandingPage = ({ navigation }) => {
  const data = [
    {
      title: 'Seamless solutions for modern housing needs.',
      text: '',
      image: require('./assets/mockup.jpeg'),
      isLarge: false,
    },
    {
      title: 'For More Information!',
      website: 'https://www.pinterest.com/', 
      image: require('./assets/too.png'),
      isLarge: false,
    },
    {
      title: 'HomeSphere Residencia',
      text: 'Let\'s get started now!',
      image: require('./assets/logos.png'),
      isLarge: true,
    },
  ];

  const handleWebsitePress = (url) => {
    Linking.openURL(url);  // Function to open website link
  };

  return (
    <View style={Styles.container}>  
      <Swiper
        style={Styles.wrapper}
        showsPagination={true}
        loop={true}
        autoplay={true}
        autoplayTimeout={5} 
      >
        {data.map((item, index) => (
          <View key={index} style={Styles.slide}>
            <Image 
              source={item.image} 
              style={item.isLarge ? Styles.largeImage : Styles.image} 
              resizeMode="contain" 
            />
            <Text style={index === 2 ? Styles.lastSlideTitle : Styles.title}>{item.title}</Text>  
            <Text style={index === 2 ? Styles.lastSlideText : Styles.text}>{item.text}</Text>   

            {/* Show website link on second slide if available */}
            {item.website && (
              <TouchableOpacity onPress={() => handleWebsitePress(item.website)}>
                <Text style={Styles.linkText}>Visit our website</Text>
              </TouchableOpacity>
            )}

            {index === 2 && ( // Show the button on the third slide
              <TouchableOpacity
                style={Styles.arrowButton}
                onPress={() => navigation.navigate('LoginOptions')}
              >
                <Icon name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Swiper>
    </View>
  );
};

export default LandingPage;
