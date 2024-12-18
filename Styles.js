import { StyleSheet, Dimensions,Platform } from 'react-native';

const { width: screenWidth , height: screenHeight} = Dimensions.get('window');



const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    height: Platform.OS === 'ios' ? screenHeight : screenHeight * 2, // Maintain height but adjust responsively
  },
  slide: {
    backgroundColor: 'white',
    borderRadius: 8,
    height: screenHeight * 0.3, // Use 30% of the screen height for slide height
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? screenHeight * 0.06 : 0, // Adjust paddingTop for iOS
  },
  image: {
    width: '100%',
    height: '100%',
    marginTop: Platform.OS === 'ios' ? screenHeight * 0.5 : screenHeight * 0.6, // Adjust dynamically
  },
  largeImage: {
    width: '100%',
    height: '60%',
    marginTop: Platform.OS === 'ios' ? screenHeight * 0.55 : screenHeight * 0.65, // Adjust dynamically
  },
  title: {
    fontSize: 18, // Keep styling intact
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16, // Keep styling intact
    textAlign: 'center',
    fontStyle: 'italic',
  },
  lastSlideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  lastSlideText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginTop: screenHeight * 0.05, // Adjust dynamically for screen height
    fontStyle: 'italic',
  },
  arrowButton: {
    position: 'absolute',
    right: Platform.OS === 'ios' ? 'auto' : screenWidth * 0.4, // Adjust dynamically
    left: Platform.OS === 'ios' ? screenWidth * 0.43 : 'auto', // Adjust dynamically
    top: Platform.OS === 'ios' ? screenHeight * 0.65 : screenHeight * 0.7, // Adjust dynamically
    width: screenWidth * 0.15, // Responsive size for the button
    height: screenWidth * 0.15, // Responsive size for the button
    borderRadius: screenWidth * 0.075, // Match button's circular shape
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  // Styles for LoginOptions page
  loginOptionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
  button: {
    width: '75%',
    height: 80,
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginVertical: 10,
    position: 'relative', // Make the button relative to position the image
    overflow: 'hidden', // Hide overflow of the image
    justifyContent: 'center', // Center text vertically
    paddingLeft: 30, // Add padding to left side for text
  },
  buttonImage: {
    position: 'absolute', // Position image absolutely within button
    right: 0, // Align image to the right edge
    top: 5, // Align image to the top edge
    width: 55, // Increased image width
    height: 70, // Increased image height
    resizeMode: 'contain', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },


  // Styles for LoginPage
  loginPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  logo: {
    width: 120, // Adjust based on your logo size
    height: 120, // Adjust based on your logo size
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#aaa', // Light color for the text
    fontSize: 16,
    marginTop: 10,
  },
  // Styles for ResidentMainPage
  residentMainPageContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // To position text and logo over image
  },
  
  bannerImage: {
    width: screenWidth - 40, // Adjust based on desired size
    height: 150, // Adjust based on desired size
    borderRadius: 15, // Rounded corners
    position: 'absolute', // Position image behind text and logo
    top: 50, // Align to top
    left: 20, // Centering horizontally
    right: 20, // Centering horizontally
  },
  bannerContainer: {
    position: 'relative',
  },
  bannerOverlayContainer: {
    position: 'absolute', // Position it absolutely relative to the banner image
    left: 50,
    bottom: 60, // Fill the entire image space
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
  },
  bannerOverlayLogo: {
    width: 50, // Adjust the width as needed
    height: 50, // Adjust the height as needed
     // Space between logo and text
  },
  bannerOverlayText: {
    fontSize: 16, // Adjust font size
    fontWeight:'condensed',
    color:'#fff',
    textAlign: 'center',
    left: 20,
    bottom: 60,
  },
  bannerOverlaySubtitle: {
    fontSize: 12, // Adjust font size
    color: '#555', 
    textAlign: 'center',
    left: 15,
    bottom: 60,
   fontWeight:'bold'
  },
  logos: {
    width: 100, // Adjust based on your logo size
    height: 100, // Adjust based on your logo size
    position: 'absolute', // Position logo over image
    top: 130, // Center vertically
    left: 180, // Center horizontally
    transform: [{ translateX: -50 }, { translateY: -50 }], // Centering logo
  },

  iconWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },


  activityPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  fullScreenImage: {
    width: '100%',
    height: 250, // Adjust the height as needed
    resizeMode: 'cover', // Ensures the image covers the entire width
  },
  searchIcon: {
    position: 'absolute',
    top: 40, // Position from the top
    right: 10, // Position from the right
    padding: 8, // Add some padding around the icon
    borderRadius: 20, // Rounded corners for the icon container
    
  },

  searchInputBar: {
    position: 'absolute',
    top: 100, // Position the search bar below the icon
    left: 10, // Align to the left
    right: 10, // Align to the right
    backgroundColor: '#fff', // White background for the search bar
    borderRadius: 20, // Rounded corners for the search bar
    paddingHorizontal: 15, // Padding inside the search bar
    paddingVertical: 10, // Vertical padding for a better look
    elevation: 3, // For shadow on Android
    shadowColor: '#000', // For shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  iconWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },

  iconGridContainer: {
    marginTop: 20,
    paddingHorizontal: 10, // Ensure padding is consistent
  },

  sectionCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%', // Ensure the card takes full width
  },

  iconGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Use space-around to distribute items evenly
    flexWrap: 'wrap', // Wrap items to the next line if necessary
  },

  icon: {
    width: (screenWidth / 4) - 20, // Adjust based on screen width and desired spacing
    height: 80, // Increased height for more title space
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15, // Reduced margin between icons
  },

  iconImage: {
    width: '60%',
    height: '70%',
    resizeMode: 'contain',
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  iconTitle: {
    fontSize: 12, // Increased font size for better readability
    textAlign: 'center',
    marginTop: 5,
    color: '#333',
    fontWeight: 'bold',
  },
  infoBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation:4
  },
  infoBannerIconWrapper: {
    marginRight: 10,
  },
 
  
  infoBannerLogo: {
    width: 40,
    height: 40,
    
  },
  infoBannerText: {
    fontSize: 14,
    fontWeight: 'bold',
    bottom:5
  },
  infoBannerSubtitle: {
    fontSize: 10,
    color: '#555',
    marginTop: 20,
    right:150
  },
  // Style for the slider container
  sliderContainer: {
    width:screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Style for slider images
  sliderImage: {
    width: '100%',
    height: 250, // Adjust height to match banner
    resizeMode: 'cover',
  },

  // Pagination style
  pagination: {
    bottom: 10,
  },
  hamburgerMenu: {
    position: 'absolute',
    top: 35,
    left: 10,
    padding: 8,
    zIndex: 1000, // Ensure it is above other content
    borderRadius: 5, // Optional: Add border radius for better appearance
  },
  sidebarContainer: { 
    flex:1,
    backgroundColor: 'rgba(173, 216, 230, 1)', // Sidebar background color
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: '55%',
    position: 'absolute',
    height:'100%',
    left: '-70%', // Initially hidden off-screen
    borderRadius:5
  },
  sidebarContainerVisible: {
    left: 0,
  },
  
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60, // Make the profile picture round
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 15,
  },
    profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 40 : 0, 
  },
  sidebarWelcome: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 25,
  },
  sidebarButtonsContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Subtle separator for buttons
    marginBottom: 20,
  },
  sidebarIcon: {
    marginRight: 10,
    color: '#333',
  },
  sidebarButtonText: {
    fontSize: 16,
    color: '#333',
  },
  ServiceHeadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    padding: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    elevation: 4,
    width: '65%', // Adjust to cover half the width
    alignSelf: 'center', // Align container to center
  },
  ServiceHeadingstaffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    padding: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    elevation: 4,
    width: '95%', // Adjust to cover half the width
    alignSelf: 'center', // Align container to center
  },
  ServiceHeadingIconWrapper: {
    marginRight: 10,
  },  
  ServiceHeadingLogo: {
    width: 40,
    height: 40,
    right:15
  },
  ServiceHeadingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 30 : 10, // Adjust the top position for iOS
    right: Platform.OS === 'ios' ? 10 : 10, // Adjust the right position for iOS
    padding: 10,
    zIndex: 1000, 
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serviceDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  searchCardContainer: {
    margin: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  searchCardHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  searchCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  searchCardText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  changePicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
    elevation: 2,
  },
  changePicText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
    marginVertical: 15,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  infoValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginVertical: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
   // ServiceManMainPage
   cardsContainer:{ 
    marginTop: 20,
    paddingHorizontal: 10,
   },
   cardContainer: {
    width: '90%', // Full width of the screen
    height:220,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4, // Add shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 15,
    alignItems: 'center', 
    alignSelf: 'center',// Center align items horizontally
  },

  cardImageContainer: {
    width: 100, // Adjust width of the image container
    height: 100, // Adjust height of the image container
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, // Space between image and text
  },

  cardImage: {
    width: '100%', // Image takes full width of the container
    height: '100%', // Image takes full height of the container
    resizeMode: 'contain', // Ensure image is scaled properly
  },

  cardTextContainer: {
    alignItems: 'center', // Center align text horizontally
  },

  cardTitle: {
    fontSize: 20, // Increase font size for better visibility
    fontWeight: 'bold',
    color: '#333', // Darker color for better contrast
  },

  cardDescription: {
    fontSize: 16, // Slightly smaller than title
    color: '#555',
    marginTop: 5, // Space between title and description
  },

  // Additional styles for modals
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
  },

  // Modal Content
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 10, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    overflow: 'hidden',
  },

  // Close Button
  modalCloseButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    position: 'absolute',
    top: 10,
    right: 10,
    elevation: 3, // Add shadow for Android
  },

  modalCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  // Modal Title
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },

  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
 
  // Card Container
  cardContainerstaff: {
    width: '100%', // Full width of the container
    maxWidth: 120, // Set max width for cards to ensure they fit in rows
    height: 230,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },

  cardImagestaff: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  staffName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },

  staffContact: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },

  staffProfession: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#777',
    marginLeft: 8,
  },

  // Hire Button
  hireButton: {
    paddingVertical: 6,
    paddingHorizontal: 22,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop:10
  },

  hireButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // No Staff Text
  noStaffText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },

  // Staff Row
  staffRow: {
    justifyContent: 'space-around',
    flexWrap: 'wrap', // Allow wrapping of items
  },
  taskCardContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width:'100%'
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: '#1e90ff',  // Professional blue
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#1e90ff',
  },
  taskTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600', // Bold the task titles
  },
  submitButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addressInput: {
    marginTop: 20,
  marginBottom: 15,
  paddingHorizontal: 15,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  fontSize: 16,
  color: '#333',
  backgroundColor: '#f9f9f9',
  width: '100%',
  // iOS specific styles
  ...Platform.select({
    ios: {
      paddingVertical:15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
},
  noTasksText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginVertical: 20,
  },
  requestContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 10,

  },
  detailtaskContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 10,
    width: '100%',
  },
  columnContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  columntaskContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap', // Allow wrapping
    alignItems: 'flex-start', 
  },
  columnTitle: {
    fontWeight: 'bold',
    width: 120,
    color: '#333',
  },
  columntaskTitle: {
    fontWeight: 'bold',
    width: 82,
    color: '#333',
  },
  taskColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  taskContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  taskName: {
    fontSize: 15,
    color: '#333',
  },

taskButton:{
  marginTop: 10,
  backgroundColor: '#007bff',
  borderRadius: 20,
  width: '70%',
  alignItems: 'center',
  alignSelf:'center',
  padding:10
},
taskButtonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
},
modalScrollView: {
  flexGrow: 1,
  paddingBottom: 20, // Add padding if needed
},
taskText:{
  fontSize:18
},
commonDetailsContainer: {
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
  marginBottom: 10,
},
modalContents: {
  width: '90%',
  backgroundColor: '#fff', // White background for modal
  borderRadius: 15,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 8,
},
modalTitles: {
  fontSize: 24, // Title size
  fontWeight: 'bold',
  marginBottom: 30,
  textAlign: 'center',
  color: '#343a40', // Dark text color
},
dropdown: {
  padding: 12,
  marginBottom: 30,
  backgroundColor: '#f8f9fa', // Match the label box color
  borderRadius: 5,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
},
dropdownText: {
  textAlign: 'left',
  color: '#495057',  // Dark gray color for dropdown text
  fontSize: 16,
  flex: 1,
},
dropdownArrow: {
  width: 20, // Width for the arrow
  height: 20, // Height for the arrow
  marginLeft: 10,
  tintColor: '#495057', // Gray color for dropdown arrow
},
dropdownList: {
  maxHeight: 150,
  backgroundColor: '#f8f9fa', // Match the color of the label box
  marginBottom: 10,
  marginTop: -15,
  borderRadius: 5,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
},

dropdownItem: {
  padding: 10,
  backgroundColor: '#f8f9fa', // Same color as the label box
  borderBottomColor: '#dcdcdc', // Light gray lines between dropdown items
  borderBottomWidth: 1,
},
dropdownItemText: {
  fontSize: 16,
  color: '#495057', // Dark gray color for items
},
textInput: {
  padding: 10,
  marginBottom: 20,
  height: 100,
  textAlignVertical: 'top',
  backgroundColor: '#f8f9fa', // Light gray background for input without border
  borderRadius: 5,
},
submitButtons: {
  backgroundColor: '#007BFF', // Button color matching the design
  borderRadius: 5,
  padding: 12,
  alignItems: 'center',
  marginBottom: Platform.OS === 'ios' ? 20 : 0,
},
submitButtonTexts: {
  color: '#fff', // White text for button
  fontSize: 16,
  fontWeight: 'bold',
},
modalCloseButtons: {
  position: 'absolute',
  top: 10,
  right: 10,
},
modalCloseTexts: {
  fontSize: 24,
  color: '#343a40', // Dark color for close button
},

// Events
eventContainer: {
  margin: 12,
  padding: 15,
  backgroundColor: '#fff',
  borderRadius: 18,
  elevation: 6, // Slightly stronger shadow for better depth
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#ddd', // Subtle border to enhance structure
  shadowColor: '#000', 
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 5 },
  shadowRadius: 10,
},
eventImage: {
  width: '100%',
  height: 200,
  borderRadius: 15,
  borderWidth: 2,
  borderColor: '#ddd', // Border around the image for a clean look
},
eventTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  marginTop: 15,
  color: '#2c3e50', // A deeper, more elegant color
  textTransform: 'capitalize', // Makes title more refined
},
eventDate: {
  fontSize: 15,
  color: '#7f8c8d', // A lighter, more modern gray
  marginVertical: 8,
  fontStyle: 'italic', // Subtle and elegant styling for dates
},
eventDescription: {
  fontSize: 16,
  color: '#34495e', // A darker text color for improved readability
  lineHeight: 22,
  marginTop: 10,
  textAlign: 'justify', // Improved readability with justified text
},
modalsBackground: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker background for better contrast
},
modalsContainer: {
  width: '85%',
  height: '80%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 20,
  elevation: 12, // Stronger shadow to make the modal stand out
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 10 },
  shadowRadius: 15,
},
modalsTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 20,
  color: '#2c3e50', // Elegant and bold color for titles
},
eventList: {
  paddingBottom: 25,
},
closeButtons: {
  padding: 14,
  backgroundColor: '#2980b9', // Rich blue color for the close button
  borderRadius: 10,
  marginTop: 20,
  shadowColor: '#2980b9', // Subtle shadow to make button pop
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 10,
},
closeButtonsText: {
  color: '#fff',
  textAlign: 'center',
  fontSize: 18,
  fontWeight: '600', // Slightly bolder text for clarity
},
detailsLink: {
  fontSize: 14,
  color: '#007BFF',
  marginTop: 10,
  textDecorationLine: 'underline',
  fontWeight: '500',
},
expandedInfoContainer: {
  marginTop: 15,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: '#eee',
},
expandedTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 5,
  color: '#333',
},
eventDescription: {
  fontSize: 14,
  color: '#555'
},
 infoSection: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginLeft: 28, // Ensures alignment under the title
  },
  infoValue: {
    fontSize: 14,
    color: '#555',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
    marginHorizontal: 10,
  },

  
});

export default Styles;