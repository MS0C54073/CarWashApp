import 'package:equatable/equatable.dart';

enum ServiceName {
  fullBasicWash,
  engineWash,
  exteriorWash,
  interiorWash,
  waxAndPolishing,
}

class ServiceModel extends Equatable {
  final String id;
  final String carWashId;
  final ServiceName name;
  final String? description;
  final double price;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const ServiceModel({
    required this.id,
    required this.carWashId,
    required this.name,
    this.description,
    required this.price,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['_id'] ?? json['id'] ?? '',
      carWashId: json['carWashId'] ?? '',
      name: _parseServiceName(json['name']),
      description: json['description'],
      price: (json['price'] ?? 0).toDouble(),
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  static ServiceName _parseServiceName(String? name) {
    switch (name) {
      case 'Full Basic Wash':
        return ServiceName.fullBasicWash;
      case 'Engine Wash':
        return ServiceName.engineWash;
      case 'Exterior Wash':
        return ServiceName.exteriorWash;
      case 'Interior Wash':
        return ServiceName.interiorWash;
      case 'Wax and Polishing':
        return ServiceName.waxAndPolishing;
      default:
        return ServiceName.fullBasicWash;
    }
  }

  String get serviceNameLabel {
    switch (name) {
      case ServiceName.fullBasicWash:
        return 'Full Basic Wash';
      case ServiceName.engineWash:
        return 'Engine Wash';
      case ServiceName.exteriorWash:
        return 'Exterior Wash';
      case ServiceName.interiorWash:
        return 'Interior Wash';
      case ServiceName.waxAndPolishing:
        return 'Wax and Polishing';
    }
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'carWashId': carWashId,
      'name': serviceNameLabel,
      'description': description,
      'price': price,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, carWashId, name, price];
}
