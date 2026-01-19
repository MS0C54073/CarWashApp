import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const BookingDetailScreen = () => {
  const route = useRoute();
  const { bookingId } = route.params as { bookingId: string };
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/${bookingId}`);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#ffc107',
      accepted: '#17a2b8',
      picked_up: '#007bff',
      at_wash: '#6c757d',
      washing_bay: '#007bff',
      drying_bay: '#17a2b8',
      wash_completed: '#28a745',
      delivered: '#28a745',
      completed: '#28a745',
      cancelled: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text>Booking not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Booking Details</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {booking.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <Text style={styles.info}>
            <Text style={styles.label}>Make:</Text> {booking.vehicleId?.make}
          </Text>
          <Text style={styles.info}>
            <Text style={styles.label}>Model:</Text> {booking.vehicleId?.model}
          </Text>
          <Text style={styles.info}>
            <Text style={styles.label}>Plate:</Text> {booking.vehicleId?.plateNo}
          </Text>
          <Text style={styles.info}>
            <Text style={styles.label}>Color:</Text> {booking.vehicleId?.color}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Information</Text>
          <Text style={styles.info}>
            <Text style={styles.label}>Service:</Text> {booking.serviceId?.name}
          </Text>
          <Text style={styles.info}>
            <Text style={styles.label}>Car Wash:</Text> {booking.carWashId?.carWashName || booking.carWashId?.name}
          </Text>
          <Text style={styles.info}>
            <Text style={styles.label}>Location:</Text> {booking.carWashId?.location}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <Text style={styles.info}>
            <Text style={styles.label}>Pickup Location:</Text> {booking.pickupLocation}
          </Text>
          {booking.driverId && (
            <Text style={styles.info}>
              <Text style={styles.label}>Driver:</Text> {booking.driverId.name}
            </Text>
          )}
          <Text style={styles.info}>
            <Text style={styles.label}>Amount:</Text> K{booking.totalAmount}
          </Text>
          <Text style={styles.info}>
            <Text style={styles.label}>Payment Status:</Text> {booking.paymentStatus}
          </Text>
        </View>

        {booking.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.info}>{booking.notes}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default BookingDetailScreen;
