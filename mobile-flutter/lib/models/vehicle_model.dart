import 'package:equatable/equatable.dart';

class VehicleModel extends Equatable {
  final String id;
  final String clientId;
  final String make;
  final String model;
  final String plateNo;
  final String color;
  final DateTime createdAt;
  final DateTime updatedAt;

  const VehicleModel({
    required this.id,
    required this.clientId,
    required this.make,
    required this.model,
    required this.plateNo,
    required this.color,
    required this.createdAt,
    required this.updatedAt,
  });

  factory VehicleModel.fromJson(Map<String, dynamic> json) {
    return VehicleModel(
      id: json['_id'] ?? json['id'] ?? '',
      clientId: json['clientId'] ?? '',
      make: json['make'] ?? '',
      model: json['model'] ?? '',
      plateNo: json['plateNo'] ?? '',
      color: json['color'] ?? '',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'clientId': clientId,
      'make': make,
      'model': model,
      'plateNo': plateNo,
      'color': color,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get displayName => '$make $model - $plateNo';

  @override
  List<Object?> get props => [id, clientId, make, model, plateNo];
}
