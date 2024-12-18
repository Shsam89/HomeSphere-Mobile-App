import React, { useState, useCallback, useContext, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // For icons
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import SwiperFlatList from 'react-native-swiper-flatlist';
import Styles from './Styles'; // Import the styles
import AccountPage_S from './AccountPage_S';
import { AuthContext } from './AuthContext'; 
import { UserContext } from './UserContext';
import axios from 'axios'; // For API calls

const Tab = createBottomTabNavigator();

// InfoBanner Component
const InfoBanner = () => (
  <View style={Styles.infoBannerContainer}>
    <View style={Styles.infoBannerIconWrapper}>
      <Image source={require('./assets/logos.png')} style={Styles.infoBannerLogo} />
    </View>
    <Text style={Styles.infoBannerText}>HomeSphere Residencia</Text>
    <Text style={Styles.infoBannerSubtitle}>All services at your doorstep</Text>
  </View>
);

const ImageSlider = () => {
  const sliderImages = [
    require('./assets/1.jpeg'), 
    require('./assets/image2.png'),
    require('./assets/image3.jpeg'),
  ];

  return (
    <SwiperFlatList
      autoplay
      autoplayDelay={2}
      autoplayLoop
      showPagination
      paginationStyle={Styles.pagination}
      paginationActiveColor="lightblue"
      paginationDefaultColor="gray"
    >
      {sliderImages.map((image, index) => (
        <View style={Styles.sliderContainer} key={index}>
          <Image source={image} style={Styles.sliderImage} />
        </View>
      ))}
    </SwiperFlatList>
  );
};

const Serviceheading = () => (
  <View style={Styles.ServiceHeadingstaffContainer}>
    <View style={Styles.ServiceHeadingIconWrapper}>
      <Image source={require('./assets/team.png')} style={Styles.ServiceHeadingLogo} />
    </View>
    <Text style={Styles.ServiceHeadingText}>Staff Portal</Text>
  </View>
);

const Sidebar = React.memo(({ isVisible, onClose, userName, navigation }) => {
  const { profilePic } = useContext(UserContext);
  const { logout } = useContext(AuthContext);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      onClose();
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginOptions' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [logout, onClose, navigation]);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[Styles.sidebarContainer, isVisible && Styles.sidebarContainerVisible]}>
        <TouchableOpacity style={Styles.closeButton} onPress={onClose}>
          <Icon name="close" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={Styles.profileContainer}>
          <Image
            source={profilePic ? { uri: profilePic } : require('./assets/user.png')}
            style={Styles.profilePic}
          />
          <Text style={Styles.userName}>{userName}</Text>
        </View>

        <View style={Styles.sidebarButtonsContainer}>
          <TouchableOpacity
            style={Styles.sidebarButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="person-outline" size={20} color="#fff" style={Styles.sidebarIcon} />
            <Text style={Styles.sidebarButtonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={Styles.sidebarButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications-outline" size={20} color="#fff" style={Styles.sidebarIcon} />
            <Text style={Styles.sidebarButtonText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={Styles.sidebarButton}
            onPress={handleLogout}
          >
            <Icon name="log-out-outline" size={20} color="#fff" style={Styles.sidebarIcon} />
            <Text style={Styles.sidebarButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

// ServiceManMainPageContent Component

const ServiceManMainPageContent = ({ route, navigation }) => {
  const { userName, CNIC } = route.params;
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [processedRequestIds, setProcessedRequestIds] = useState(new Set());
  const { getToken } = useContext(AuthContext);
  const [completedTasks, setCompletedTasks] = useState([]);
  
  const toggleSidebar = useCallback(() => setSidebarVisible(prev => !prev), []);
  const handleCardPress = useCallback((taskType) => {
    setActiveModal(taskType);
  }, []);
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedRequest(null);
  }, []);
  
  const handleRequestAction = useCallback(async (action) => {
    if (!selectedRequest || selectedRequest.length === 0) return;
    
    try {
      const token = await getToken();
      if (!token) throw new Error('No token found');
  
      const commonDetails = {
        ResidentName: selectedRequest[0].ResidentName,
        Descriptions: selectedRequest[0].Descriptions,
        RequestTimestamp: selectedRequest[0].RequestTimestamp,
      };
  
      for (const request of selectedRequest) {
        if (request.ResidentName !== commonDetails.ResidentName ||
            request.Descriptions !== commonDetails.Descriptions ||
            request.RequestTimestamp !== commonDetails.RequestTimestamp) {
          throw new Error('Selected tasks have different common details.');
        }
      }
  
      for (const request of selectedRequest) {
        const { Request_id } = request;
  
        if (action === 'Accept') {
          await axios.post('http://192.168.0.102:3000/tasks/accept', { requestId: Request_id }, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
  
          setMyTasks(prevTasks => [...prevTasks, { ...request, Statuss: 'Accepted' }]);
        } else if (action === 'Decline') {
          await axios.post('http://192.168.0.102:3000/tasks/decline', { requestId: Request_id }, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
        }
  
        setProcessedRequestIds(prev => new Set(prev).add(Request_id));
      }
  
      setSelectedRequest(null);
      setActiveModal('My Tasks');
  
      await loadRequests();
    } catch (error) {
      Alert.alert('Error', `Failed to ${action.toLowerCase()} task request: ${error.message}`);
    }
  }, [selectedRequest, getToken]);

  const fetchTaskRequests = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No token found');
  
      const response = await axios.get('http://192.168.0.102:3000/tasks/my-requests-forstaff', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!Array.isArray(response.data)) {
        console.error('Unexpected response structure:', response.data);
        return [];
      }
  
      const tasks = response.data.filter(task => !processedRequestIds.has(task.Request_id));
  
      setRequests(tasks);
      return tasks;
    } catch (error) {
      console.log('Error fetching task requests:', error);
      return [];
    }
  }, [getToken, processedRequestIds]);

  const handleTaskCompletion = async (task) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No token found');
  
      await axios.post('http://192.168.0.102:3000/tasks/complete', { requestId: task.Request_id }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      setMyTasks(prevTasks => prevTasks.filter(t => t.Request_id !== task.Request_id));
      setCompletedTasks(prevTasks => [...prevTasks, { ...task, Statuss: 'Completed' }]);
  
      await loadRequests();
  
      Alert.alert('Success', 'Task marked as completed');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark task as completed');
    }
  };

  const loadRequests = useCallback(async () => {
    try {
      const fetchedRequests = await fetchTaskRequests();
      
      const requestsMap = new Map();
      fetchedRequests.forEach(task => {
        if (!requestsMap.has(task.Request_id)) {
          requestsMap.set(task.Request_id, []);
        }
        requestsMap.get(task.Request_id).push(task);
      });
      
      if (requestsMap.size > 0) {
        const firstRequestId = Array.from(requestsMap.keys())[0];
        const newRequests = requestsMap.get(firstRequestId);
        
        // Only set selectedRequest and activeModal if they are not already set
        if (!selectedRequest && !processedRequestIds.has(firstRequestId)) {
          setSelectedRequest(newRequests);
          setActiveModal('Task Request');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load requests');
    }
  }, [fetchTaskRequests, processedRequestIds, selectedRequest]);

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('myTasks', JSON.stringify(myTasks));
      await AsyncStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const myTasksData = await AsyncStorage.getItem('myTasks');
      const completedTasksData = await AsyncStorage.getItem('completedTasks');
      
      if (myTasksData) {
        setMyTasks(JSON.parse(myTasksData));
      }
      if (completedTasksData) {
        setCompletedTasks(JSON.parse(completedTasksData));
      }
    } catch (error) {
      console.log('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadRequests();

    const pollingInterval = setInterval(loadRequests, 5000); // Poll every 5 seconds

    return () => clearInterval(pollingInterval); // Cleanup interval on unmount
  }, [loadRequests]);

  useEffect(() => {
    if (selectedRequest) {
      console.log('Selected request:', selectedRequest);
    }
  }, [selectedRequest]);

  useEffect(() => {
    saveTasks();
  }, [myTasks, completedTasks]);

  

  return (
    <ScrollView contentContainerStyle={Styles.scrollViewContent} showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={Styles.hamburgerMenu} onPress={toggleSidebar}>
          <Icon name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        <Sidebar isVisible={isSidebarVisible} onClose={toggleSidebar} userName={userName} navigation={navigation} />

        <View style={Styles.bannerContainer}>
          <Image source={require('./assets/main.png')} style={Styles.fullScreenImage} />
          <View style={Styles.bannerOverlayContainer}>
            <Image source={require('./assets/logos.png')} style={Styles.bannerOverlayLogo} />
          </View>
          <Text style={Styles.bannerOverlayText}>HomeSphere Residencia</Text>
          <Text style={Styles.bannerOverlaySubtitle}>All services at your doorstep</Text>
        </View>

        <Serviceheading />

        <View style={Styles.cardsContainer}>
          <TouchableOpacity style={Styles.cardContainer} onPress={() => handleCardPress('My Tasks')}>
            <View style={Styles.cardImageContainer}>
              <Image source={require('./assets/my-task.png')} style={Styles.cardImage} />
            </View>
            <View style={Styles.cardTextContainer}>
              <Text style={Styles.cardTitle}>My Tasks</Text>
              <Text style={Styles.cardDescription}>View and manage your tasks.</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={Styles.cardContainer} onPress={() => handleCardPress('Completed Tasks')}>
            <View style={Styles.cardImageContainer}>
              <Image source={require('./assets/complete-task.png')} style={Styles.cardImage} />
            </View>
            <View style={Styles.cardTextContainer}>
              <Text style={Styles.cardTitle}>Completed Tasks</Text>
              <Text style={Styles.cardDescription}>Review your completed tasks.</Text>
            </View>
          </TouchableOpacity>
          <InfoBanner />
          <ImageSlider />
        </View>

        <Modal visible={activeModal === 'My Tasks'} animationType="slide" transparent>
          <View style={Styles.modalContainer}>
            <View style={Styles.modalContent}>
              <Text style={Styles.modalTitle}>My Tasks</Text>
              <ScrollView contentContainerStyle={Styles.modalScrollView}>
                {myTasks.length > 0 ? (
                  Object.values(
                    myTasks.reduce((acc, task) => {
                      if (!acc[task.Request_id]) {
                        acc[task.Request_id] = {
                          requestId: task.Request_id,
                          tasks: [],
                          residentName: task.ResidentName,
                          description: task.Descriptions,
                          requestTime: task.RequestTimestamp,
                        };
                      }
                      acc[task.Request_id].tasks.push(task);
                      return acc;
                    }, {})
                  ).map((request, index) => (
                    <View key={index} style={Styles.requestContainer}>
                      <View style={Styles.detailtaskContainer}>
                        <View style={Styles.columntaskContainer}>
                          <Text style={Styles.columnTitle}>Resident Name:</Text>
                          <Text>{request.residentName || 'N/A'}</Text>
                        </View>
                        <View style={Styles.columntaskContainer}>
                          <Text style={Styles.columnTitle}>Address :</Text>
                          <Text numberOfLines={3} ellipsizeMode="tail">{request.description || 'N/A'}</Text>
                        </View>
                      </View>
                      {request.tasks.map((task, index) => (
                         <View key={index} style={[Styles.taskContainer,{backgroundColor: '#f9f9f9'},{flexDirection:'row'}]}>
                         <Text style={[Styles.taskName,{fontWeight:'bold'}]}>Task Name: </Text>
                         <Text style={Styles.taskName}>{task.Task_name || 'N/A'}</Text>
                       </View>
                      ))}
                      <TouchableOpacity
                        style={Styles.taskButton}
                        onPress={() => {
                          request.tasks.forEach(task => handleTaskCompletion(task));
                        }}
                      >
                        <Text style={Styles.taskButtonText}>Mark as Completed</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={Styles.modalText}>No tasks available</Text>
                )}
              </ScrollView>
              <TouchableOpacity style={Styles.modalCloseButton} onPress={closeModal}>
                <Text style={Styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={activeModal === 'Completed Tasks'} animationType="slide" transparent>
          <View style={Styles.modalContainer}>
            <View style={Styles.modalContent}>
              <Text style={Styles.modalTitle}>Completed Tasks</Text>
              <ScrollView contentContainerStyle={Styles.modalScrollView}>
                {completedTasks.length > 0 ? (
                  Object.values(
                    completedTasks.reduce((acc, task) => {
                      if (!acc[task.Request_id]) {
                        acc[task.Request_id] = {
                          requestId: task.Request_id,
                          tasks: [],
                          residentName: task.ResidentName,
                          description: task.Descriptions,
                          requestTime: task.RequestTimestamp,
                        };
                      }
                      acc[task.Request_id].tasks.push(task);
                      return acc;
                    }, {})
                  ).map((request, index) => (
                    <View key={index} style={Styles.requestContainer}>
                      <View style={Styles.detailtaskContainer}>
                        <View style={Styles.columntaskContainer}>
                          <Text style={Styles.columnTitle}>Resident Name:</Text>
                          <Text>{request.residentName || 'N/A'}</Text>
                        </View>
                        <View style={Styles.columntaskContainer}>
                          <Text style={Styles.columnTitle} numberOfLines={3}>Address:</Text>
                          <Text numberOfLines={3} ellipsizeMode="tail">{request.description || 'N/A'}</Text>
                        </View>
                      </View>
                      {request.tasks.map((task, index) => (
                        <View key={index} style={[Styles.taskContainer,{backgroundColor: '#f9f9f9'},{flexDirection:'row'}]}>
                          <Text style={[Styles.taskName,{fontWeight:'bold'}]}>Task Name: </Text>
                          <Text style={Styles.taskName}>{task.Task_name || 'N/A'}</Text>
                        </View>
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={Styles.modalText}>No completed tasks available</Text>
                )}
              </ScrollView>
              <TouchableOpacity style={Styles.modalCloseButton} onPress={closeModal}>
                <Text style={Styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={activeModal === 'Task Request'} animationType="slide" transparent>
          <View style={Styles.modalContainer}>
            <View style={Styles.modalContent}>
              <Text style={Styles.modalTitle}>Task Request</Text>
              {selectedRequest && selectedRequest.length > 0 ? (
                <View>
                  <View style={Styles.requestContainer}>
                    <View style={Styles.detailtaskContainer}>
                      <View style={Styles.columntaskContainer}>
                        <Text style={Styles.columnTitle}>Resident Name:</Text>
                        <Text>{selectedRequest[0].ResidentName || 'N/A'}</Text>
                      </View>
                      <View style={Styles.columntaskContainer}>
                        <Text style={Styles.columnTitle}>Address:</Text>
                        <Text  numberOfLines={3} ellipsizeMode="tail">{selectedRequest[0].Descriptions || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  {selectedRequest.map((task, index) => (
                    <View key={index} style={[Styles.taskContainer,{backgroundColor: '#f9f9f9'},{flexDirection:'row'}]}>
                    <Text style={[Styles.taskName,{fontWeight:'bold'}]}>Task Name: </Text>
                    <Text style={Styles.taskName} >{task.Task_name || 'N/A'}</Text>
                  </View>
                  ))}
                  
                  <View style={Styles.modalButtonsContainer}>
                    <TouchableOpacity style={[Styles.modalButton , {backgroundColor:'#28a745'}]} onPress={() => handleRequestAction('Accept')}>
                      <Text style={Styles.modalButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[Styles.modalButton , {backgroundColor:'#e3342f'}]} onPress={() => handleRequestAction('Decline')}>
                      <Text style={Styles.modalButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text style={Styles.modalText}>No request selected</Text>
              )}
              <TouchableOpacity style={Styles.modalCloseButton} onPress={closeModal}>
                <Text style={Styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const Notifications = () => {
  return (
    <View style={Styles.activityPageContainer}>
      <Text style={Styles.pageTitle}>Notifications</Text>
    </View>
  );
};

const ServiceManMainPage = ({ route }) => {
  const { userName, CNIC } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { display: 'flex' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={ServiceManMainPageContent}
        initialParams={{ userName, CNIC }}
      />
      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Profile" component={AccountPage_S} initialParams={{ CNIC }} />
    </Tab.Navigator>
  );
};

export default ServiceManMainPage;