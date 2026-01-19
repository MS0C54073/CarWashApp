import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const DriverBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_URL}/drivers/bookings`);
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleAccept = async (bookingId: string) => {
    try {
      await axios.put(`${API_URL}/drivers/bookings/${bookingId}/accept`);
      Alert.alert('Success', 'Booking accepted');
      fetchBookings();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status });
      Alert.alert('Success', 'Status updated');
      fetchBookings();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#ffc107',
      accepted: '#17a2b8',
      picked_up: '#007bff',
      delivered: '#28a745',
      completed: '#28a745',
    };
    return colors[status] || '#6c757d';
  };

  const getNextAction = (status: string) => {
    if (status === 'pending') return { label: 'Accept', action: 'accept' };
    if (status === 'accepted') return { label: 'Mark Picked Up', action: 'picked_up' };
    if (status === 'wash_completed') return { label: 'Mark Delivered', action: 'delivered' };
    return null;
  };

  const renderBooking = ({ item }: any) => {
    const nextAction = getNextAction(item.status);
    
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id } as never)}
      >
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTitle}>
            {item.vehicleId?.make} {item.vehicleId?.model}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
        <Text style={styles.bookingInfo}>
          Client: {item.clientId?.name}
        </Text>
        <Text style={styles.bookingInfo}>
          Pickup: {item.pickupLocation}
        </Text>
        <Text style={styles.bookingInfo}>
          Car Wash: {item.carWashId?.carWashName || item.carWashId?.name}
        </Text>
        <Text style={styles.bookingInfo}>
          Amount: K{item.totalAmount}
        </Text>
        
        {nextAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (nextAction.action === 'accept') {
                handleAccept(item._id);
              } else {
                handleStatusUpdate(item._id, nextAction.action);
              }
            }}
          >
            <Text style={styles.actionButtonText}>{nextAction.label}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item: any) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </View>
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
  bookingCard: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bookingInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: '#667eea',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default DriverBookingsScreen;
