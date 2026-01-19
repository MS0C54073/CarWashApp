import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const BookingScreen = () => {
  const [carWashes, setCarWashes] = useState([]);
  const [services, setServices] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedCarWash, setSelectedCarWash] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    fetchCarWashes();
    fetchDrivers();
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedCarWash) {
      fetchServices();
    }
  }, [selectedCarWash]);

  const fetchCarWashes = async () => {
    try {
      const response = await axios.get(`${API_URL}/carwash/list`);
      setCarWashes(response.data.data);
    } catch (error) {
      console.error('Error fetching car washes:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/carwash/services?carWashId=${selectedCarWash}`);
      setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL}/drivers/available`);
      setDrivers(response.data.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles`);
      setVehicles(response.data.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleBooking = async () => {
    if (!selectedCarWash || !selectedService || !selectedVehicle || !pickupLocation) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/bookings`, {
        carWashId: selectedCarWash,
        serviceId: selectedService,
        vehicleId: selectedVehicle,
        driverId: selectedDriver || undefined,
        pickupLocation,
      });
      Alert.alert('Success', 'Booking created successfully!');
      navigation.navigate('MyBookings' as never);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>New Booking</Text>

        <Text style={styles.label}>Select Car Wash *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCarWash}
            onValueChange={setSelectedCarWash}
            style={styles.picker}
          >
            <Picker.Item label="Select Car Wash" value="" />
            {carWashes.map((wash: any) => (
              <Picker.Item key={wash._id} label={wash.carWashName || wash.name} value={wash._id} />
            ))}
          </Picker>
        </View>

        {selectedCarWash && (
          <>
            <Text style={styles.label}>Select Service *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedService}
                onValueChange={setSelectedService}
                style={styles.picker}
              >
                <Picker.Item label="Select Service" value="" />
                {services.map((service: any) => (
                  <Picker.Item key={service._id} label={`${service.name} - K${service.price}`} value={service._id} />
                ))}
              </Picker>
            </View>
          </>
        )}

        <Text style={styles.label}>Select Vehicle *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedVehicle}
            onValueChange={setSelectedVehicle}
            style={styles.picker}
          >
            <Picker.Item label="Select Vehicle" value="" />
            {vehicles.map((vehicle: any) => (
              <Picker.Item key={vehicle._id} label={`${vehicle.make} ${vehicle.model} - ${vehicle.plateNo}`} value={vehicle._id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Select Driver (Optional)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDriver}
            onValueChange={setSelectedDriver}
            style={styles.picker}
          >
            <Picker.Item label="Auto Assign" value="" />
            {drivers.map((driver: any) => (
              <Picker.Item key={driver._id} label={driver.name} value={driver._id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Pickup Location *</Text>
        <TextInput
          style={styles.input}
          value={pickupLocation}
          onChangeText={setPickupLocation}
          placeholder="Enter pickup address"
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
