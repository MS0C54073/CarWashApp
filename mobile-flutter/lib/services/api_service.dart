import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../models/booking_model.dart';
import '../models/vehicle_model.dart';
import '../models/service_model.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android emulator
  // For iOS simulator: 'http://localhost:5000/api'
  // For physical device: 'http://YOUR_IP:5000/api'

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Auth APIs
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }

  Future<UserModel?> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return UserModel.fromJson(data['data']);
    }
    return null;
  }

  // Booking APIs
  Future<List<BookingModel>> getBookings() async {
    final response = await http.get(
      Uri.parse('$baseUrl/bookings'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> bookings = data['data'] ?? [];
      return bookings.map((b) => BookingModel.fromJson(b)).toList();
    }
    return [];
  }

  Future<BookingModel?> createBooking(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/bookings'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 201) {
      final result = jsonDecode(response.body);
      return BookingModel.fromJson(result['data']);
    }
    return null;
  }

  Future<bool> updateBookingStatus(String bookingId, String status) async {
    final response = await http.put(
      Uri.parse('$baseUrl/bookings/$bookingId/status'),
      headers: await _getHeaders(),
      body: jsonEncode({'status': status}),
    );
    return response.statusCode == 200;
  }

  // Vehicle APIs
  Future<List<VehicleModel>> getVehicles() async {
    final response = await http.get(
      Uri.parse('$baseUrl/vehicles'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> vehicles = data['data'] ?? [];
      return vehicles.map((v) => VehicleModel.fromJson(v)).toList();
    }
    return [];
  }

  Future<VehicleModel?> createVehicle(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/vehicles'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 201) {
      final result = jsonDecode(response.body);
      return VehicleModel.fromJson(result['data']);
    }
    return null;
  }

  // Car Wash APIs
  Future<List<Map<String, dynamic>>> getCarWashes() async {
    final response = await http.get(Uri.parse('$baseUrl/carwash/list'));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['data'] ?? []);
    }
    return [];
  }

  Future<List<ServiceModel>> getServices(String? carWashId) async {
    final uri = carWashId != null
        ? Uri.parse('$baseUrl/carwash/services?carWashId=$carWashId')
        : Uri.parse('$baseUrl/carwash/services');
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> services = data['data'] ?? [];
      return services.map((s) => ServiceModel.fromJson(s)).toList();
    }
    return [];
  }

  // Driver APIs
  Future<List<UserModel>> getAvailableDrivers() async {
    final response = await http.get(
      Uri.parse('$baseUrl/drivers/available'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> drivers = data['data'] ?? [];
      return drivers.map((d) => UserModel.fromJson(d)).toList();
    }
    return [];
  }

  Future<bool> acceptBooking(String bookingId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/drivers/bookings/$bookingId/accept'),
      headers: await _getHeaders(),
    );
    return response.statusCode == 200;
  }
}
