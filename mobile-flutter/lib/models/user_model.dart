import 'package:equatable/equatable.dart';

enum UserRole { client, driver, carwash, admin }

class UserModel extends Equatable {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String nrc;
  final UserRole role;
  final bool isActive;
  
  // Client specific
  final String? businessName;
  final bool? isBusiness;
  
  // Driver specific
  final String? licenseNo;
  final String? licenseType;
  final String? licenseExpiry;
  final String? address;
  final String? maritalStatus;
  final bool? availability;
  
  // Car Wash specific
  final String? carWashName;
  final String? location;
  final int? washingBays;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.nrc,
    required this.role,
    this.isActive = true,
    this.businessName,
    this.isBusiness,
    this.licenseNo,
    this.licenseType,
    this.licenseExpiry,
    this.address,
    this.maritalStatus,
    this.availability,
    this.carWashName,
    this.location,
    this.washingBays,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      nrc: json['nrc'] ?? '',
      role: _parseRole(json['role']),
      isActive: json['isActive'] ?? true,
      businessName: json['businessName'],
      isBusiness: json['isBusiness'],
      licenseNo: json['licenseNo'],
      licenseType: json['licenseType'],
      licenseExpiry: json['licenseExpiry'],
      address: json['address'],
      maritalStatus: json['maritalStatus'],
      availability: json['availability'],
      carWashName: json['carWashName'],
      location: json['location'],
      washingBays: json['washingBays'],
    );
  }

  static UserRole _parseRole(String? role) {
    switch (role) {
      case 'client':
        return UserRole.client;
      case 'driver':
        return UserRole.driver;
      case 'carwash':
        return UserRole.carwash;
      case 'admin':
        return UserRole.admin;
      default:
        return UserRole.client;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'nrc': nrc,
      'role': role.toString().split('.').last,
      'isActive': isActive,
      if (businessName != null) 'businessName': businessName,
      if (isBusiness != null) 'isBusiness': isBusiness,
      if (licenseNo != null) 'licenseNo': licenseNo,
      if (licenseType != null) 'licenseType': licenseType,
      if (licenseExpiry != null) 'licenseExpiry': licenseExpiry,
      if (address != null) 'address': address,
      if (maritalStatus != null) 'maritalStatus': maritalStatus,
      if (availability != null) 'availability': availability,
      if (carWashName != null) 'carWashName': carWashName,
      if (location != null) 'location': location,
      if (washingBays != null) 'washingBays': washingBays,
    };
  }

  @override
  List<Object?> get props => [
        id,
        name,
        email,
        phone,
        nrc,
        role,
        isActive,
      ];
}
