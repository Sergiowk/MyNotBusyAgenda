# MyNotBusyAgenda

A personal organization Progressive Web App (PWA) with Firebase integration for cloud sync across devices.

## Features

- 📝 **Todos**: Task management with completion tracking
- 📔 **Journal**: Daily reflections and notes
- 🎯 **Daily Focus**: Set your main goal for the day
- 📅 **Calendar**: Monthly view with current day highlighting
- 🕐 **Live Clock**: Real-time clock with dynamic greeting
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 🔐 **Google Sign-In**: Secure authentication
- ☁️ **Cloud Sync**: Real-time data sync across devices via Firebase
- 📱 **PWA**: Installable on any device

## Tech Stack

- React 18 + Vite
- TailwindCSS v4
- Firebase (Auth + Firestore)
- React Router
- Lucide Icons

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/MyNotBusyAgenda.git
cd MyNotBusyAgenda
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Google Authentication in Firebase Console > Authentication > Sign-in method
3. Create a Firestore database in Firebase Console > Firestore Database
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Fill in your Firebase credentials in `.env`:
   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### 4. Run development server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Deployment

### Deploy to Vercel/Netlify

1. Push your code to GitHub (`.env` is already in `.gitignore`)
2. Connect your repository to Vercel or Netlify
3. Add environment variables in the hosting platform's dashboard:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
4. Deploy!

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

## Firestore Security Rules

Add these security rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
