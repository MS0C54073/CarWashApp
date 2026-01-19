# Quick Start: Run SuCAR Mobile App in Android Studio

## 🚀 Fast Setup (5 Steps)

### 1. Install Android Studio
Download from: https://developer.android.com/studio
- Install with default settings
- Complete the setup wizard

### 2. Create Android Emulator
1. Open Android Studio
2. **Tools → Device Manager → Create Device**
3. Choose **Pixel 5** or **Pixel 6**
4. Download **API 33** (Tiramisu) system image
5. Click **Finish**

### 3. Start Emulator
- In Device Manager, click **▶ Play** button
- Wait for emulator to boot (~1-2 minutes first time)

### 4. Configure API URL
The mobile app is already configured for Android emulator at:
```
http://10.0.2.2:5000/api
```
✅ No changes needed!

### 5. Run the App

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Start Mobile App:**
```bash
cd mobile
npm install  # First time only
npm start
```
Then press **`a`** when prompted, or run:
```bash
npm run android
```

## ✅ That's It!

The app will:
1. Build and install on the emulator
2. Connect to backend at `http://10.0.2.2:5000/api`
3. Open automatically

## 🧪 Test It

1. **Register** a new user (Client or Driver)
2. **Login** with your credentials
3. **Create a booking** (if Client)
4. **Accept booking** (if Driver)

## ⚠️ Troubleshooting

**"Cannot connect to backend"**
- ✅ Make sure backend is running: `cd backend && npm run dev`
- ✅ Check emulator is running
- ✅ Verify API_URL is `http://10.0.2.2:5000/api`

**"Expo not found"**
```bash
npm install -g @expo/cli
```

**"SDK not found"**
- In Android Studio: **File → Project Structure → SDK Location**
- Note the path and set `ANDROID_HOME` environment variable

For detailed setup, see `ANDROID_STUDIO_SETUP.md`
