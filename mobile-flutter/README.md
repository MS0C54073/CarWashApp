# SUKA Car Wash - Flutter Mobile App

Cross-platform mobile application for iOS and Android.

## Features

- ✅ Client interface for booking car washes
- ✅ Driver interface for accepting and managing bookings
- ✅ Real-time booking status tracking
- ✅ Vehicle management
- ✅ Cross-platform (iOS & Android)

## Setup

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Android Studio / Xcode
- Backend API running

### Installation

```bash
cd mobile-flutter
flutter pub get
```

### Configuration

Update API URL in `lib/services/api_service.dart`:

- **Android Emulator**: `http://10.0.2.2:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`
- **Physical Device**: `http://YOUR_IP:5000/api`

### Run

```bash
# For Android
flutter run

# For iOS (macOS only)
flutter run -d ios

# For specific device
flutter devices
flutter run -d <device-id>
```

## Project Structure

```
lib/
├── models/          # Data models
├── screens/         # UI screens
│   ├── auth/        # Login/Register
│   ├── client/      # Client screens
│   └── driver/      # Driver screens
├── services/        # API services
├── providers/        # State management
└── routes/          # Navigation
```

## Building for Production

### Android

```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
```
