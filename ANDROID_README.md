# Mobile App Integration

This project processes the web application into a native mobile app using **Capacitor**.

## Prerequisites

- **Node.js** and **npm** installed.
- **Android Studio** (for Android builds).
- **Xcode** (for iOS builds, Mac only).

## Quick Start

### Android

1.  **Prepare the App**:
    ```bash
    npm run android
    ```
    This command builds your latest web code and copies it to the Android project.

2.  **Build/Run**:
    - Open the `android` folder in **Android Studio**.
    - Connect your device or start an emulator.
    - Click the **Run** (green triangle) button.
    - To generate an APK: `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

### iOS (Mac Only)

1.  **Prepare the App**:
    ```bash
    npm run ios
    ```

2.  **Build/Run**:
    - Open the `ios` folder in **Xcode**.
    - Select your target device/simulator.
    - Click the **Play** button.

## Workflow

1.  Make changes to your web app in `src/`.
2.  Run `npm run android` (or `npm run ios`) to sync changes to the native project.
3.  Build/Run the native app in Android Studio (or Xcode).

## Troubleshooting

### Blank Page After Build

If you see a blank page when running the app in Capacitor, this is likely due to incorrect asset paths. The app is configured to automatically use the correct base path:

- **Capacitor builds** (mobile): Uses root path `/`
- **Web builds** (GitHub Pages): Uses `/MyNotBusyAgenda/`

This is handled automatically by the build scripts. When you run `npm run android` or `npm run ios`, the `VITE_BUILD_TARGET=capacitor` environment variable is set, which tells Vite to use the root path.

**Solution**: Always use the provided npm scripts (`npm run android`, `npm run ios`) instead of building manually. These scripts ensure the correct configuration is applied.

