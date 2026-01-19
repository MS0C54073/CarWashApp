import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    nrc: '',
    role: 'client' as 'client' | 'driver' | 'carwash',
    // Client specific
    businessName: '',
    isBusiness: false,
    // Driver specific
    licenseNo: '',
    licenseType: '',
    licenseExpiry: '',
    address: '',
    maritalStatus: '',
    // Car wash specific
    carWashName: '',
    location: '',
    washingBays: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.nrc) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const registerData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        nrc: formData.nrc,
        role: formData.role,
      };

      if (formData.role === 'client') {
        if (formData.isBusiness) {
          registerData.businessName = formData.businessName;
        }
        registerData.isBusiness = formData.isBusiness;
      } else if (formData.role === 'driver') {
        registerData.licenseNo = formData.licenseNo;
        registerData.licenseType = formData.licenseType;
        registerData.licenseExpiry = formData.licenseExpiry;
        registerData.address = formData.address;
        registerData.maritalStatus = formData.maritalStatus;
      } else if (formData.role === 'carwash') {
        registerData.carWashName = formData.carWashName;
        registerData.location = formData.location;
        registerData.washingBays = parseInt(formData.washingBays) || 0;
      }

      await register(registerData);
      Alert.alert('Success', 'Registration successful!');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Register</Text>
        
        <Text style={styles.label}>Role</Text>
        <View style={styles.roleContainer}>
          {['client', 'driver', 'carwash'].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                formData.role === role && styles.roleButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, role: role as any })}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  formData.role === role && styles.roleButtonTextActive,
                ]}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <Text style={styles.label}>Phone *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>NRC *</Text>
        <TextInput
          style={styles.input}
          value={formData.nrc}
          onChangeText={(text) => setFormData({ ...formData, nrc: text })}
        />

        {formData.role === 'client' && (
          <>
            <Text style={styles.label}>Business Name (if business)</Text>
            <TextInput
              style={styles.input}
              value={formData.businessName}
              onChangeText={(text) => setFormData({ ...formData, businessName: text })}
            />
          </>
        )}

        {formData.role === 'driver' && (
          <>
            <Text style={styles.label}>License Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.licenseNo}
              onChangeText={(text) => setFormData({ ...formData, licenseNo: text })}
            />
            <Text style={styles.label}>License Type *</Text>
            <TextInput
              style={styles.input}
              value={formData.licenseType}
              onChangeText={(text) => setFormData({ ...formData, licenseType: text })}
            />
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />
          </>
        )}

        {formData.role === 'carwash' && (
          <>
            <Text style={styles.label}>Car Wash Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.carWashName}
              onChangeText={(text) => setFormData({ ...formData, carWashName: text })}
            />
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
            <Text style={styles.label}>Number of Washing Bays *</Text>
            <TextInput
              style={styles.input}
              value={formData.washingBays}
              onChangeText={(text) => setFormData({ ...formData, washingBays: text })}
              keyboardType="numeric"
            />
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login' as never)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#667eea',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#667eea',
  },
  roleButtonText: {
    color: '#667eea',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#fff',
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
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#667eea',
    fontSize: 14,
  },
});

export default RegisterScreen;
