import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, FlatList, Modal,Alert ,KeyboardAvoidingView, Platform} from 'react-native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Ionicons'; // For icons
import Icons from 'react-native-vector-icons/FontAwesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SwiperFlatList from 'react-native-swiper-flatlist';
import Styles from './Styles'; // Import the Styles
import AccountPage from './AccountPage';
import { fetchResidentDetails } from './residentdetails';
import { fetchStaffDetails } from './Staffdetails';
import { AuthContext } from './AuthContext'; 
import { UserContext } from './UserContext';
import { iconsSection1, iconsSection2 } from './iconData'; // Import static icon data

// Define Tab Navigator
const Tab = createBottomTabNavigator();

const InfoBanner = () => (
  <View style={Styles.infoBannerContainer}>
    <View style={Styles.infoBannerIconWrapper}>
      <Image source={require('./assets/logos.png')} style={Styles.infoBannerLogo} />
    </View>
    <Text style={Styles.infoBannerText}>HomeSphere Residencia</Text>
    <Text style={Styles.infoBannerSubtitle}>All services at your doorstep</Text>
  </View>
);

const Serviceheading = () => (
  <View style={Styles.ServiceHeadingContainer}>
    <View style={Styles.ServiceHeadingIconWrapper}>
      <Image source={require('./assets/services.png')} style={Styles.ServiceHeadingLogo} />
    </View>
    <Text style={Styles.ServiceHeadingText}>Services</Text>
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


const Sidebar = React.memo(({ isVisible, onClose, userName, navigation }) => {
  const { profilePic } = useContext(UserContext);
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
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
  };
  const handleNavigate = (route) => {
    onClose(); // Close the sidebar
    navigation.navigate(route); // Navigate to the provided route
  };
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
            onPress={() => handleNavigate('Profile')}
          >
            <Icon name="person-outline" size={20} color="#fff" style={Styles.sidebarIcon} />
            <Text style={Styles.sidebarButtonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={Styles.sidebarButton}
            onPress={() => handleNavigate('Notifications')}
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


const ResidentMainPageContent = ({ route, navigation }) => {
  const { userName } = route.params;
  const { getToken } = useContext(AuthContext);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredServices, setFilteredServices] = useState({ iconsSection1, iconsSection2 });
  const [searchResults, setSearchResults] = useState([]);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [staffDetails, setStaffDetails] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState({});
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedStaffCNIC, setSelectedStaffCNIC] = useState(null);
  const [requestDetails, setRequestDetails] = useState({ tasks: [] });
  const [isRequestTrackingModalVisible, setIsRequestTrackingModalVisible] = useState(false);
  const [address, setAddress] = useState('');
  const [isComplaintVisible, setIsComplaintVisible] = useState(false);
  const [complaintType, setComplaintType] = useState(''); // General or Staff
  const [complaintDescription, setComplaintDescription] = useState('');
  const [selectedProfession, setSelectedProfession] = useState(null); // For staff complaints
  const [staffList, setStaffList] = useState([]); // List of staff for the selected profession
  const [selectedStaff, setSelectedStaff] = useState(null); // Selected staff for complaint
  const [isComplaintTypeDropdownVisible, setComplaintTypeDropdownVisible] = useState(false); // Control complaint type dropdown visibility
  const [isProfessionDropdownVisible, setProfessionDropdownVisible] = useState(false); // Control profession dropdown visibility
  const [isStaffDropdownVisible, setStaffDropdownVisible] = useState(false);
  const [events, setEvents] = useState([]);
const [isEventModalVisible, setIsEventModalVisible] = useState(false);
const [expandedEvent, setExpandedEvent] = useState(null);
  
   useEffect(() => {
    fetchStaffData();
    fetchEvents();
    const intervalId = setInterval(() => {
      fetchStaffData();
      fetchEvents();
    }, 10000); // Fetch every 10 seconds

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchEvents = async () => {
    try {
      const token = await getToken(); // Assuming a function to get auth token
      const response = await fetch('http://192.168.0.102:3000/events/details', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await response.json();
      if (response.ok) {
        setEvents(data);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch events.');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  

  const fetchStaffData = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('http://192.168.0.102:3000/services-and-staff', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Map staff data to match the format expected in the UI
      const mappedStaff = data.staff.map(staff => ({
        CNIC: staff.CNIC,
        id: staff.A_id,
        name: staff.Names,
        contact: staff.Contact,
        picture: staff.Picture,
        profession: staff.Profession
      }));

      setStaffDetails(mappedStaff || []);

    } catch (error) {
      console.error('Error fetching staff data:', error.message);
    }
  };

  const fetchTasksByProfession = async (profession) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const url = `http://192.168.0.102:3000/tasks/by-profession?profession=${encodeURIComponent(profession)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setTasks(data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
    }
  };

  const fetchStaffDetails = async (CNIC) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`http://192.168.0.102:3000/Staff/detailsbyCNIC?CNIC=${encodeURIComponent(CNIC)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching staff details:', error.message);
      return null;
    }
  };

  const handleTaskSelection = (taskId) => {
    setSelectedTask(prevState => ({
      ...prevState,
      [taskId]: !prevState[taskId], // Toggle task selection
    }));
  };

  const handleHire = async (staff) => {
    setSelectedService(staff);
    fetchTasksByProfession(staff.profession);
    setTaskModalVisible(true);
    
    try {
      if (!staff.CNIC) {
        throw new Error('Staff CNIC is undefined');
      }

      console.log('Fetching details for staff CNIC:', staff.CNIC);

      const staffDetails = await fetchStaffDetails(staff.CNIC);

      console.log('Fetched staff details:', staffDetails);

      if (!staffDetails) {
        throw new Error('Failed to fetch staff details');
      }

      const selectedStaff = staffDetails;
      console.log('Selected Staff:', selectedStaff);

      if (!selectedStaff || !selectedStaff.CNIC) {
        throw new Error('Staff CNIC not found');
      }

      setSelectedStaffCNIC(selectedStaff.CNIC);

    } catch (error) {
      console.error('Error fetching staff details:', error.message);
    }
  };

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
  const handleSearchToggle = () => setSearchVisible(!isSearchVisible);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredServices({ iconsSection1, iconsSection2 });
      setSearchResults([]);
    } else {
      const filteredSection1 = iconsSection1.filter(item =>
        item.title?.toLowerCase().includes(text.toLowerCase())
      );
      const filteredSection2 = iconsSection2.filter(item =>
        item.title?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredServices({ iconsSection1: filteredSection1, iconsSection2: filteredSection2 });

      if (filteredSection1.length > 0 || filteredSection2.length > 0) {
        setSearchResults(filteredSection1.concat(filteredSection2));
      } else {
        setSearchResults([{ id: 'no-service', title: 'No service found' }]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Get IDs of selected tasks
      const selectedTaskIds = Object.keys(selectedTask).filter(taskId => selectedTask[taskId]);
  
      // Validate if any tasks are selected
      if (selectedTaskIds.length === 0) {
        alert('No tasks selected');
        return;
      }
  
    
      if (!selectedService || !selectedService.id) {
        alert('No service selected');
        return;
      }
    
      if (!address.trim()) {
        alert('Please enter your address.');
        return;
      }
      // Get authentication token
      const token = await getToken();
      if (!token) {
        throw new Error('No token found');
      }
  
      // Fetch resident details
      const residentDetails = await fetchResidentDetails();
      const residentCNIC = residentDetails?.resident?.CNIC;
      if (!residentCNIC) {
        throw new Error('Resident CNIC not found');
      }
  
      // Validate if staff CNIC is provided
      if (!selectedStaffCNIC) {
        throw new Error('Staff CNIC not found');
      }
  
      // Determine the profession for the selected service
      const profession = selectedService?.profession || 'Unknown Profession';
      if (profession === 'Unknown Profession') {
        throw new Error('Profession is undefined or unknown');
      }
  
      // Fetch tasks related to the selected profession
      const tasksResponse = await fetch(`http://192.168.0.102:3000/tasks/by-profession?profession=${encodeURIComponent(profession)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
  
      if (!tasksResponse.ok) {
        const errorText = await tasksResponse.text();
        throw new Error(`HTTP error! Status: ${tasksResponse.status} - ${errorText}`);
      }
  
      const tasksData = await tasksResponse.json();
      if (!Array.isArray(tasksData) || tasksData.length === 0) {
        console.warn('No tasks found for the selected profession');
        throw new Error('No tasks available for the selected profession');
      }
  
      // Filter selected tasks from fetched tasks
      const selectedTasksData = tasksData.filter(task => selectedTaskIds.includes(task.Task_id));
      if (selectedTasksData.length === 0) {
        console.error('No matching tasks found for selected task IDs');
        throw new Error('Selected tasks not found');
      }
  
      // Grouping task-specific details except task names
      const commonTaskDetails = {
        residentCNIC,
        staffCNIC: selectedStaffCNIC,
        description: address,
        status: 'Pending',
      };
  
      // Prepare task-specific data
      const tasksForRequest = selectedTasksData.map(task => ({
        ...commonTaskDetails,
        taskId: task.Task_id, // Include task-specific ID
      }));
  
      // Prepare request body
      const requestBody = {
        requestId: null, // Will be set after creating the request
        ...commonTaskDetails,
        taskIds: selectedTaskIds, // Send task IDs
        tasks: tasksForRequest, // Include task-specific details
      };
  
      console.log('Sending request with payload:', JSON.stringify(requestBody, null, 2));
  
      // Send request to create request entry
      const createRequestResponse = await fetch('http://192.168.0.102:3000/requests/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!createRequestResponse.ok) {
        const errorText = await createRequestResponse.text();
        throw new Error(`HTTP error! Status: ${createRequestResponse.status} - ${errorText}`);
      }
  
      const requestResult = await createRequestResponse.json();
      const requestId = requestResult.requestId;
  
      // Update request body with the new requestId
      requestBody.requestId = requestId;
  
      // Submit task request with individual task details
      const response = await fetch('http://192.168.0.102:3000/tasks/request', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
      console.log('Task request submitted:', result);
  
      Alert.alert('Success', 'Request sent successfully!', [{ text: 'OK', onPress: () => { setTaskModalVisible(false); } }]);
      setSelectedTask({}); // Reset all task selections
      setAddress('');
  
    } catch (error) {
      console.error('Error submitting task request:', error.message);
    }
  };
  
  const fetchRequestDetails = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No token found');
      }
  
      const response = await fetch('http://192.168.0.102:3000/tasks/my-requests-forresident', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      console.log('API Response Data:', data); // Log raw data
  
      // Filter out tasks with status "Not Available"
      const filteredData = data.filter(item => item.Statuss !== 'Not Available');
      console.log('Filtered Data:', filteredData); // Log filtered data
  
      const groupedData = filteredData.reduce((acc, item) => {
        if (!acc[item.Request_id]) {
          acc[item.Request_id] = {
            requestId: item.Request_id,
            tasks: [],
            staffName: item.Staff_Name,
            profession: item.Staff_Profession,
            requestTimestamp: item.RequestTimestamp,
            acceptTimestamp: item.AcceptTimestamp,
            status: item.Request_Status,
          };
        }
        acc[item.Request_id].tasks.push(item.Task_name);
        return acc;
      }, {});
  
      // Convert to an array
      const formattedData = Object.values(groupedData);
      console.log('Formatted Data:', formattedData); // Log final formatted data
  
      setRequestDetails({
        requests: formattedData,
      });
  
    } catch (error) {
      console.error('Error fetching request details:', error.message);
      setRequestDetails({
        requests: [],
      });
    }
  };

  const renderComplaintForm = () => {

    const complaintTypes = [
      { label: 'General Complaint', value: 'general' },
      { label: 'Staff Complaint', value: 'staff' },
    ];
  
    const submitComplaint = async () => {
      try {
        // Validate complaint type
        if (!complaintType) {
          alert('Please select a complaint type.');
          return;
        }
    
        // Fetch resident details
        const residentDetails = await fetchResidentDetails();
        const residentCNIC = residentDetails?.resident?.CNIC;
        const residentAId = residentDetails?.resident?.A_id; // Fetching A_id
        if (!residentCNIC) {
          throw new Error('Resident CNIC not found');
        }
        if (!residentAId) {
          throw new Error('Resident A_id not found');
        }
    
        // Validation for General Complaint
        if (complaintType === 'general') {
          if (!complaintDescription.trim()) {
            alert('Please enter a complaint description.');
            return;
          }
    
          const token = await getToken();
          const apiUrl = 'http://192.168.0.102:3000/complaints/general';
          const requestBody = {
            complaintDescription,
            CNIC: residentCNIC, // Resident CNIC
            A_id: residentAId,
          };
    
          console.log('API URL:', apiUrl);
          console.log('Request Body:', JSON.stringify(requestBody));
    
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
    
          const result = await response.json();
          console.log('Response:', result); // Log the complete response
    
          if (response.ok) {
            alert(result.message);
            // Reset form
            setComplaintDescription('');
            setSelectedProfession('');
            setSelectedStaff(null);
            setComplaintType('');
            return;
          } else {
            console.log('Error Response:', result); // Log the error response for debugging
            throw new Error(result.error || 'Error submitting complaint');
          }
        }
    
        // Validation for Staff Complaint
        if (complaintType === 'staff') {
          if (!selectedProfession) {
            alert('Please select a profession.');
            return;
          }
          if (!selectedStaff) {
            alert('Please select a staff member.');
            return;
          }
          if (!complaintDescription.trim()) {
            alert('Please enter a complaint description.');
            return;
          }
    
          const token = await getToken();
          const apiUrl = 'http://192.168.0.102:3000/complaints/staff';
          const requestBody = {
            complaintDescription,
            RCNIC: residentCNIC, // Resident CNIC
            SCNIC: selectedStaff?.CNIC, // Selected staff CNIC
            profession: selectedProfession, // Selected profession
          };
    
          console.log('API URL:', apiUrl);
          console.log('Request Body:', JSON.stringify(requestBody));
    
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
    
          const result = await response.json();
          console.log('Response:', result); // Log the complete response
    
          if (response.ok) {
            alert(result.message);
            // Reset form
            setComplaintDescription('');
            setSelectedProfession('');
            setSelectedStaff(null);
            setComplaintType('');
            return;
          } else {
            console.log('Error Response:', result); // Log the error response for debugging
            throw new Error(result.error || 'Error submitting complaint');
          }
        }
      } catch (error) {
        console.error('Error submitting complaint:', error.message);
        alert('Error submitting complaint. Please try again.');
      }
    };
    
    
  
    const handleProfessionChange = (profession) => {
      setSelectedProfession(profession);
      const filteredStaff = staffDetails.filter(
        staff => staff.profession.toLowerCase() === profession.toLowerCase()
      );
      
      setStaffList(filteredStaff);
    };
    return (
      <Modal visible={isComplaintVisible} animationType="slide" transparent>
        <View style={Styles.modalContainer}>
        <KeyboardAvoidingView
          style={Styles.modalContents}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on the platform
        >
            <TouchableOpacity style={Styles.modalCloseButtons} onPress={() => setIsComplaintVisible(false)}>
              <Text style={Styles.modalCloseTexts}>×</Text>
            </TouchableOpacity>
    
            <Text style={Styles.modalTitles}>Submit a Complaint</Text>
    
            {/* Complaint Type */}
            <TouchableOpacity
              style={Styles.dropdown}
              onPress={() => setComplaintTypeDropdownVisible(!isComplaintTypeDropdownVisible)}
            >
              <Text style={Styles.dropdownText}>
                {complaintType ? complaintTypes.find(type => type.value === complaintType).label : 'Select a complaint type'}
              </Text>
              <Image source={require('./assets/down-arrow.png')} style={Styles.dropdownArrow} />
            </TouchableOpacity>
    
            {isComplaintTypeDropdownVisible && (
                <FlatList
                  data={complaintTypes}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setComplaintType(item.value);
                        setComplaintTypeDropdownVisible(false);
                      }}
                      style={Styles.dropdownItem}
                    >
                      <Text style={Styles.dropdownItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  style={Styles.dropdownList}
                />
              
            )}
    
            {/* General Complaint Section */}
            {complaintType === 'general' && (
              <>
                <TextInput
                 style={Styles.textInput}
                 placeholder="Describe your complaint"
                 placeholderTextColor="#aaa"
                 value={complaintDescription}
                 onChangeText={setComplaintDescription}
                 multiline
                />
                <TouchableOpacity style={Styles.submitButtons} onPress={submitComplaint}>
                  <Text style={Styles.submitButtonTexts}>Submit Complaint</Text>
                </TouchableOpacity>
              </>
            )}
    
            {/* Staff Complaint Section */}
            {complaintType === 'staff' && (
              <>
                <TouchableOpacity
                  style={Styles.dropdown}
                  onPress={() => setProfessionDropdownVisible(!isProfessionDropdownVisible)}
                >
                  <Text style={Styles.dropdownText}>
                    {selectedProfession ? selectedProfession : 'Select a profession'}
                  </Text>
                  <Image source={require('./assets/down-arrow.png')} style={Styles.dropdownArrow} />
                </TouchableOpacity>
    
                {isProfessionDropdownVisible && (
                    <FlatList
                    data={Array.from(new Set(staffDetails.map(staff => staff.profession.toLowerCase()))).map(profession =>
                      profession.charAt(0).toUpperCase() + profession.slice(1) // Capitalize first letter
                    )}
                    
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => {
                            handleProfessionChange(item);
                            setProfessionDropdownVisible(false);
                          }}
                          style={Styles.dropdownItem}
                        >
                          <Text style={Styles.dropdownItemText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      style={Styles.dropdownList}
                    />
                )}
    
                {staffList.length > 0 && (
                  <>
                    <TouchableOpacity
                      style={Styles.dropdown}
                      onPress={() => setStaffDropdownVisible(!isStaffDropdownVisible)}
                    >
                      <Text style={Styles.dropdownText}>
                        {selectedStaff ? selectedStaff.name : 'Select a staff member'}
                      </Text>
                      <Image source={require('./assets/down-arrow.png')} style={Styles.dropdownArrow} />
                    </TouchableOpacity>
    
                    {isStaffDropdownVisible && (
                        <FlatList
                          data={staffList}
                          keyExtractor={(item) => item.CNIC}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedStaff(item);
                                setStaffDropdownVisible(false);
                              }}
                              style={Styles.dropdownItem}
                            >
                              <Text style={Styles.dropdownItemText}>{item.name}</Text>
                            </TouchableOpacity>
                          )}
                          style={Styles.dropdownList}
                        />
                    )}
                  </>
                )}
    
    <TextInput
  style={Styles.textInput}
  placeholder="Describe your complaint"
  placeholderTextColor="#aaa"
  value={complaintDescription}
  onChangeText={setComplaintDescription}
  multiline
/>
                <TouchableOpacity style={Styles.submitButtons} onPress={submitComplaint}>
                  <Text style={Styles.submitButtonTexts}>Submit Complaint</Text>
                </TouchableOpacity>
              </>
            )}
          </KeyboardAvoidingView>
      </View>
    </Modal>
    );
  };

   const renderRequestTrackingModal = () => {
    if (!isRequestTrackingModalVisible) return null;
  
    if (!requestDetails || !Array.isArray(requestDetails.requests)) {
      return <Text>No data available</Text>; // Handle case with no data
    }
  
    console.log('Rendering request details:', requestDetails);
  
    return (
      <Modal visible={true} animationType="slide" transparent>
        <View style={Styles.modalContainer}>
          <View style={Styles.modalContent}>
            <TouchableOpacity style={Styles.modalCloseButton} onPress={() => setIsRequestTrackingModalVisible(false)}>
              <Text style={Styles.modalCloseText}>×</Text>
            </TouchableOpacity>
            <Text style={Styles.modalTitle}>Request Tracking</Text>
            <ScrollView contentContainerStyle={Styles.scrollViewContent}>
              {requestDetails.requests.length > 0 ? (
                requestDetails.requests.map(request => (
                  <View key={request.requestId} style={Styles.requestContainer}>
                    <View style={Styles.detailsContainer}>
                      <View style={Styles.columnContainer}>
                        <Text style={Styles.columntaskTitle}>Tasks:</Text>
                        <View style={Styles.taskColumn}>
                          {request.tasks.map((task, index) => (
                            <View key={index} style={Styles.taskContainer}>
                              <Text style={Styles.taskName} >{task}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <View style={Styles.columnContainer}>
                        <Text style={Styles.columnTitle}>Staff Name:</Text>
                        <Text>{request.staffName}</Text>
                      </View>
                      <View style={Styles.columnContainer}>
                        <Text style={Styles.columnTitle}>Profession:</Text>
                        <Text>{request.profession}</Text>
                      </View>
                      <View style={Styles.columnContainer}>
                        <Text style={Styles.columnTitle}>Request Time:</Text>
                        <Text>{request.requestTimestamp}</Text>
                      </View>
                      <View style={Styles.columnContainer}>
                        <Text style={Styles.columnTitle}>Accept Time:</Text>
                        <Text>{request.acceptTimestamp || 'N/A'}</Text>
                      </View>
                      <View style={Styles.columnContainer}>
                        <Text style={Styles.columnTitle}>Status:</Text>
                        <Text>{request.status}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text>No tasks available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  const renderTaskModal = () => {
    if (!taskModalVisible  ) return null;
  
    return (
      <Modal visible={taskModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS uses 'padding' for better behavior with the keyboard
      >
        <View style={Styles.modalContainer}>
          <View style={Styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity style={Styles.modalCloseButton} onPress={() => setTaskModalVisible(false)}>
              <Text style={Styles.modalCloseText}>×</Text>
            </TouchableOpacity>
  
            {/* Title */}
            <Text style={Styles.modalTitle}>Select Task</Text>
  
            {/* Single Card for Tasks */}
            <View style={Styles.taskCardContainer}>
              {tasks.length > 0 ? (
                tasks.map((item) => (
                  <TouchableOpacity
                    key={item.Task_id}
                    style={Styles.taskItem}
                    onPress={() => handleTaskSelection(item.Task_id)}
                  >
                    <View style={Styles.checkboxContainer}>
                      {/* Checkbox */}
                      <View style={[Styles.checkbox, selectedTask[item.Task_id] && Styles.checkboxChecked]}>
                        {selectedTask[item.Task_id] && <Icon name="checkmark" size={18} color="#fff" />}
                      </View>
                      {/* Task Name */}
                      <Text style={Styles.taskTitle}>{item.Task_name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={Styles.noTasksText}>No tasks available for this profession</Text>
              )}
            </View>
  
            {/* Address Input */}
            <TextInput
              style={Styles.addressInput}
              placeholder="Enter your address"
               placeholderTextColor="#aaa"
              value={address}
              onChangeText={setAddress}
              multiline={true}
              numberOfLines={3} 
            />
  
            {/* Submit Button */}
            <TouchableOpacity style={Styles.submitButton} onPress={handleSubmit}>
              <Text style={Styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };
  
  const openModal = async (item) => {
    setSelectedService(item);
  };
  const openRequestTrackingModal = async () => {
    setIsRequestTrackingModalVisible(true);
    await fetchRequestDetails(); // Fetch request details when opening the modal
   
  };
  
  const closeModal = () => setSelectedService(null);

  const renderIcon = (openModal) => ({ item }) => (
    <TouchableOpacity
      style={Styles.icon}
      onPress={() => {
        if (item.title === 'Request Tracking') {
          openRequestTrackingModal(); // Open request tracking modal
        } else if (item.title === 'Complaints') {
          setIsComplaintVisible(true); // Open complaints modal when clicking on Complaints
        } 
          else if (item.title === 'Events') {
          setIsEventModalVisible(true); // Open event modal
        }
        else {
          openModal(item); // Open service modal for other items
        }
      }}
    >
      <Image source={item.source} style={Styles.iconImage} />
      <Text style={Styles.iconTitle}>{item.title}</Text>
    </TouchableOpacity>
  );
  
  const renderSearchCard = () => {
    if (searchResults.length > 0 && searchResults[0].title === 'No service found') {
      return (
        <View style={Styles.searchCard}>
          <Text style={Styles.searchCardText}>No service found</Text>
        </View>
      );
    }
    return (
      <View style={Styles.searchCardContainer}>
        <Text style={Styles.searchCardHeading}>Search Results</Text>
        <FlatList
          data={searchResults}
          renderItem={renderIcon(openModal)}
          keyExtractor={(item) => `search-${item.id}`} // Use a prefix to avoid collisions
          numColumns={3}
          columnWrapperStyle={Styles.iconGridRow}
          scrollEnabled={false}
        />
      </View>
    );
  };
  
  const renderServiceModal = () => {
    if (!selectedService || taskModalVisible) return null; // Ensure task modal isn't visible
  
    const staffForService = staffDetails.filter(staff =>
      staff.profession?.toLowerCase() === selectedService.title?.toLowerCase()
    );
  
    return (
      <Modal visible={!!selectedService} animationType="slide" transparent>
        <View style={Styles.modalContainer}>
          <View style={Styles.modalContent}>
            <TouchableOpacity style={Styles.modalCloseButton} onPress={closeModal}>
              <Text style={Styles.modalCloseText}>×</Text>
            </TouchableOpacity>
            <Text style={Styles.modalTitle}>{selectedService.title}</Text>
            {staffForService.length > 0 ? (
              <FlatList
                data={staffForService}
                renderItem={({ item }) => {
                  const imageUrl = item.picture ? `http://192.168.0.102:3000${item.picture}` : null;
                  const userImage = require('./assets/user.png'); 
                  return (
                    <View style={Styles.cardContainerstaff} key={`staff-${item.id}`}>
                      <Image
                        source={imageUrl ? { uri: imageUrl } : userImage}
                        style={Styles.cardImagestaff}
                        onError={() => console.log('Error loading image:', imageUrl)}
                      />
                      <View style={Styles.infoContainer}>
                        <View style={Styles.infoRow}>
                          <Icons name="user" size={16} color="#007bff" />
                          <Text style={Styles.staffName}>{item.name}</Text>
                        </View>
                        <View style={Styles.infoRow}>
                          <Icons name="phone" size={16} color="#007bff" />
                          <Text style={Styles.staffContact}>{item.contact}</Text>
                        </View>
                        <View style={Styles.infoRow}>
                          <Icons name="briefcase" size={16} color="#007bff" />
                          <Text style={Styles.staffProfession}>{item.profession}</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={Styles.hireButton} onPress={() => { handleHire(item); }}>
                        <Text style={Styles.hireButtonText}>Hire</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
                keyExtractor={(item) => `staff-${item.id}-${item.contact}`}
                numColumns={2} // Two items per row
                columnWrapperStyle={Styles.staffRow} // Style for the row wrapper
              />
            ) : (
              <Text style={Styles.noStaffText}>No staff available for this service</Text>
            )}
          </View>
        </View>
      </Modal>
    );
  };
  const toggleEventDescription = (EID) => {
    // Toggle the visibility of event description on click
    setExpandedEvent(prevState => (prevState === EID ? null : EID));
  };

  const renderEvent = ({ item }) => {
    const eventImageUrl = item.Picture ? `http://192.168.0.102:3000${item.Picture}` : null;
    const eventImage = require('./assets/festival.jpg'); 

    const formatDate = (dateString) => format(new Date(dateString), 'MM-dd-yyyy');

    return (
      <View style={Styles.eventContainer}>
        <TouchableOpacity onPress={() => toggleEventDescription(item.EID)}>
          <Image 
            source={eventImageUrl ? { uri: eventImageUrl } : eventImage} 
            style={Styles.eventImage} 
            resizeMode="cover"
          />
          <Text style={Styles.eventTitle}>{item.EName}</Text>
          <Text style={Styles.eventDate}>Event Date: {formatDate(item.EDate)}</Text>
          <Text style={Styles.detailsLink}>Tap to view more details</Text>
        </TouchableOpacity>

        {expandedEvent === item.EID && (
  <View style={Styles.expandedInfoContainer}>
    <Text style={Styles.expandedTitle}>Event Description</Text>
    <Text style={Styles.eventDescription}>{item.Descriptions}</Text>
    <View style={Styles.separator} />
    {/* Audience Type Section */}
    <View style={Styles.infoSection}>
      <View style={Styles.infoRow}>
        <Icons name="users" size={20} color="#333" style={Styles.infoIcon} />
        <Text style={Styles.infoTitle}>Audience Type:</Text>
      </View>
      <View style={Styles.infoBox}>
        <Text style={Styles.infoValue}>{item.AudienceType}</Text>
      </View>
    </View>

    {/* Ticket Prices Section */}
    <View style={Styles.infoSection}>
      <View style={Styles.infoRow}>
        <Icons name="ticket" size={20} color="#333" style={Styles.infoIcon} />
        <Text style={Styles.infoTitle}>VIP Ticket Price:</Text>
      </View>
      <View style={Styles.infoBox}>
        <Text style={Styles.infoValue}>{item.VIPTicketPrice}</Text>
      </View>
    </View>
    <View style={Styles.infoSection}>
      <View style={Styles.infoRow}>
        <Icons name="ticket" size={20} color="#333" style={Styles.infoIcon} />
        <Text style={Styles.infoTitle}>General Ticket Price:</Text>
      </View>
      <View style={Styles.infoBox}>
        <Text style={Styles.infoValue}>{item.GeneralTicketPrice}</Text>
      </View>
    </View>

    {/* Location Section */}
    <View style={Styles.infoSection}>
      <View style={Styles.infoRow}>
        <Icon name="location-sharp" size={20} color="#333" style={Styles.infoIcon} />
        <Text style={Styles.infoTitle}>Location:</Text>
      </View>
      <View style={Styles.infoBox}>
        <Text style={Styles.infoValue}>{item.Locations}</Text>
      </View>
    </View>
  </View>
)}
      </View>
    );
  };
  const renderEventModal = () => (
    <Modal visible={isEventModalVisible} animationType="slide" transparent={true}>
      <View style={Styles.modalsBackground}>
        <View style={Styles.modalsContainer}>
          <Text style={Styles.modalsTitle}>Upcoming Events</Text>
          <FlatList
            data={events}
            renderItem={renderEvent}
            keyExtractor={(item) => item.EID.toString()}
            contentContainerStyle={Styles.eventList}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity onPress={() => setIsEventModalVisible(false)} style={Styles.closeButtons}>
            <Text style={Styles.closeButtonsText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );



  return (
    <ScrollView contentContainerStyle={Styles.scrollViewContent}>
     
      <View style={{ flex: 1 }}>
        {/* Hamburger Menu Icon */}
        <TouchableOpacity style={Styles.hamburgerMenu} onPress={toggleSidebar}>
          <Icon name="menu" size={28} color="#fff" />
        </TouchableOpacity>


        {/* Sidebar Component */}
        <Sidebar isVisible={isSidebarVisible} onClose={toggleSidebar} userName={userName} navigation={navigation} />

        {/* Banner with overlay */}
        <View style={Styles.bannerContainer}>
          <Image source={require('./assets/main.png')} style={Styles.fullScreenImage} />
          <View style={Styles.bannerOverlayContainer}>
            <Image source={require('./assets/logos.png')} style={Styles.bannerOverlayLogo} />
          </View>
          <Text style={Styles.bannerOverlayText}>HomeSphere Residencia</Text>
          <Text style={Styles.bannerOverlaySubtitle}>All services at your doorstep</Text>
        </View>

        {/* Search Icon and Bar */}
        <TouchableOpacity style={Styles.searchIcon} onPress={handleSearchToggle}>
          <Icon name="search" size={26} color="#fff" />
        </TouchableOpacity>
        {isSearchVisible && (
          <TextInput
            style={Styles.searchInputBar}
            placeholder="Search..."
            value={searchText}
            onChangeText={handleSearch}
          />
        )}

        {/* Conditionally Render Serviceheading or Search Results */}
        {searchText.trim() === '' ? (
          <>
            <Serviceheading />
            <View style={Styles.iconGridContainer}>
              <View style={Styles.sectionCard}>
                <Text style={Styles.sectionHeader}>General Services</Text>
                <FlatList
             data={filteredServices.iconsSection1}
             renderItem={renderIcon(openModal)}
             keyExtractor={(item, index) => `${item.id}-${index}`} // Ensures unique keys
             numColumns={3}
             columnWrapperStyle={Styles.iconGridRow}
             scrollEnabled={false}
              />
              
              </View>
              <View style={Styles.sectionCard}>
                <Text style={Styles.sectionHeader}>Home Services</Text>
                <FlatList
               data={filteredServices.iconsSection2}
               renderItem={renderIcon(openModal)}
               keyExtractor={(item, index) => `${item.id}-${index}`} // Ensures unique keys
               numColumns={3}
               columnWrapperStyle={Styles.iconGridRow}
               scrollEnabled={false}
              />
              </View>
              <InfoBanner />
              <ImageSlider />
            </View>
          </>
        ) : (
          renderSearchCard()
        )}
          {renderComplaintForm()}
 {renderTaskModal()}
        {renderServiceModal()}
        {renderRequestTrackingModal()}
        {renderEventModal()}
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

const ResidentMainPage = ({ route }) => {
  const { userName } = route.params; // Retrieve the username
  const { CNIC } = route.params; // Retrieve CNIC from route params

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
         component={ResidentMainPageContent} 
         initialParams={{userName}}
      />
      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Profile" component={AccountPage} initialParams={{ CNIC }} />
    </Tab.Navigator>
  );
};

export default ResidentMainPage;
