import 'package:equatable/equatable.dart';
import 'user_model.dart';
import 'vehicle_model.dart';
import 'service_model.dart';

enum BookingStatus {
  pending,
  accepted,
  declined,
  pickedUp,
  atWash,
  waitingBay,
  washingBay,
  dryingBay,
  washCompleted,
  delivered,
  completed,
  cancelled,
}

enum PaymentStatus { pending, paid, failed, refunded }

class BookingModel extends Equatable {
  final String id;
  final String clientId;
  final String? driverId;
  final String carWashId;
  final String vehicleId;
  final String serviceId;
  final String pickupLocation;
  final BookingStatus status;
  final double totalAmount;
  final PaymentStatus paymentStatus;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // Populated fields
  final UserModel? client;
  final UserModel? driver;
  final UserModel? carWash;
  final VehicleModel? vehicle;
  final ServiceModel? service;

  const BookingModel({
    required this.id,
    required this.clientId,
    this.driverId,
    required this.carWashId,
    required this.vehicleId,
    required this.serviceId,
    required this.pickupLocation,
    required this.status,
    required this.totalAmount,
    required this.paymentStatus,
    required this.createdAt,
    required this.updatedAt,
    this.client,
    this.driver,
    this.carWash,
    this.vehicle,
    this.service,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['_id'] ?? json['id'] ?? '',
      clientId: json['clientId'] is String 
          ? json['clientId'] 
          : json['clientId']?['_id'] ?? '',
      driverId: json['driverId'] is String 
          ? json['driverId'] 
          : json['driverId']?['_id'],
      carWashId: json['carWashId'] is String 
          ? json['carWashId'] 
          : json['carWashId']?['_id'] ?? '',
      vehicleId: json['vehicleId'] is String 
          ? json['vehicleId'] 
          : json['vehicleId']?['_id'] ?? '',
      serviceId: json['serviceId'] is String 
          ? json['serviceId'] 
          : json['serviceId']?['_id'] ?? '',
      pickupLocation: json['pickupLocation'] ?? '',
      status: _parseStatus(json['status']),
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      paymentStatus: _parsePaymentStatus(json['paymentStatus']),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
      client: json['clientId'] is Map ? UserModel.fromJson(json['clientId']) : null,
      driver: json['driverId'] is Map ? UserModel.fromJson(json['driverId']) : null,
      carWash: json['carWashId'] is Map ? UserModel.fromJson(json['carWashId']) : null,
      vehicle: json['vehicleId'] is Map ? VehicleModel.fromJson(json['vehicleId']) : null,
      service: json['serviceId'] is Map ? ServiceModel.fromJson(json['serviceId']) : null,
    );
  }

  static BookingStatus _parseStatus(String? status) {
    switch (status) {
      case 'pending':
        return BookingStatus.pending;
      case 'accepted':
        return BookingStatus.accepted;
      case 'declined':
        return BookingStatus.declined;
      case 'picked_up':
        return BookingStatus.pickedUp;
      case 'at_wash':
        return BookingStatus.atWash;
      case 'waiting_bay':
        return BookingStatus.waitingBay;
      case 'washing_bay':
        return BookingStatus.washingBay;
      case 'drying_bay':
        return BookingStatus.dryingBay;
      case 'wash_completed':
        return BookingStatus.washCompleted;
      case 'delivered':
        return BookingStatus.delivered;
      case 'completed':
        return BookingStatus.completed;
      case 'cancelled':
        return BookingStatus.cancelled;
      default:
        return BookingStatus.pending;
    }
  }

  static PaymentStatus _parsePaymentStatus(String? status) {
    switch (status) {
      case 'paid':
        return PaymentStatus.paid;
      case 'failed':
        return PaymentStatus.failed;
      case 'refunded':
        return PaymentStatus.refunded;
      default:
        return PaymentStatus.pending;
    }
  }

  String get statusLabel {
    switch (status) {
      case BookingStatus.pickedUp:
        return 'Picked Up';
      case BookingStatus.atWash:
        return 'At Wash';
      case BookingStatus.waitingBay:
        return 'Waiting Bay';
      case BookingStatus.washingBay:
        return 'Washing Bay';
      case BookingStatus.dryingBay:
        return 'Drying Bay';
      case BookingStatus.washCompleted:
        return 'Wash Completed';
      default:
        return status.toString().split('.').last;
    }
  }

  @override
  List<Object?> get props => [id, clientId, status, totalAmount];
}
