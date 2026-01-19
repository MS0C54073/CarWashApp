import 'package:flutter/material.dart';

class BookingDetailScreen extends StatelessWidget {
  final String bookingId;

  const BookingDetailScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Booking Details')),
      body: Center(
        child: Text('Booking Detail Screen - ID: $bookingId'),
      ),
    );
  }
}
