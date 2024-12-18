import axios from 'axios';

export const fetchPublicIpAddress = async () => {
  try {
    const response = await axios.get('http://192.168.0.102 :3000/current-ip');
    return response.data.ip;
  } catch (error) {
    console.error('Error fetching public IP address:', error);
    return null;
  }
};