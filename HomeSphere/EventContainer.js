import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Modal } from 'react-native';
import { format } from 'date-fns';
import Styles from './Styles';

const EventContainer = ({ events, isEventModalVisible, setIsEventModalVisible }) => {
  const [expandedEvent, setExpandedEvent] = useState(null); // Track expanded event

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
          <Text style={Styles.eventDate}>Event Date : {formatDate(item.EDate)}</Text>

          {/* Conditionally show event description */}
          {expandedEvent === item.EID && (
            <View style={Styles.eventDescriptionContainer}>
              <Text style={Styles.eventDescription}>{item.Descriptions}</Text>
              {/* Optionally, display more details like VIP and general ticket prices */}
              <Text style={Styles.ticketPrice}>VIP Ticket Price: {item.VIPTicketPrice}</Text>
              <Text style={Styles.ticketPrice}>General Ticket Price: {item.GeneralTicketPrice}</Text>
              <Text style={Styles.ticketPrice}>Location: {item.Locations}</Text>
            </View>
          )}
        </TouchableOpacity>
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

  return renderEventModal();
};

export default EventContainer;
