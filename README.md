# 🏠 RoomieFind IU

A roommate-finding platform for Indiana University students. Built with React + Vite + Firebase.

---

## 🚀 Step-by-Step Setup

### Step 1: Install Node.js
Download and install from https://nodejs.org (v18 or later)

---

### Step 2: Set Up Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → Name it `roomie-find-iu` → Continue
3. Disable Google Analytics (optional) → **Create project**

#### Enable Authentication
- Left sidebar → **Build → Authentication → Get started**
- Click **Email/Password** → Enable → Save

#### Enable Firestore Database
- Left sidebar → **Build → Firestore Database → Create database**
- Choose **"Start in test mode"** (we'll add rules later)
- Select your region (e.g., `us-central`) → **Done**

#### Enable Storage
- Left sidebar → **Build → Storage → Get started**
- Click through the defaults → **Done**

#### Get Your Firebase Config
- Click the **gear icon** (top left) → **Project settings**
- Scroll down to **"Your apps"** → Click **Web** (`</>`) icon
- Register app name: `roomie-find-web` → **Register app**
- Copy the `firebaseConfig` object — you'll need it in the next step

---

### Step 3: Add Firebase Config to the App

Open `src/firebase/config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "AIza...",              // ← paste your values here
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123...:web:abc..."
}
```

---

### Step 4: Add Firestore Indexes

Go to **Firestore → Indexes → Composite** and add these indexes:

| Collection    | Fields                              | Order |
|---------------|-------------------------------------|-------|
| `users`       | `createdAt` Descending              | Asc   |
| `interests`   | `fromUserId` Asc, `toUserId` Asc    |       |
| `notifications` | `toUserId` Asc, `createdAt` Desc  |       |

> Tip: When you first run the app, Firebase will show error links in the console that auto-create these indexes for you.

---

### Step 5: Deploy Security Rules

In **Firestore → Rules**, paste the contents of `firestore.rules`

In **Storage → Rules**, paste the contents of `storage.rules`

---

### Step 6: Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

---

### Step 7: Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to:
- **Firebase Hosting** (recommended): `npm install -g firebase-tools && firebase deploy`
- **Vercel**: Connect your GitHub repo at vercel.com
- **Netlify**: Drag & drop the `dist/` folder

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.jsx              # Navbar + bottom mobile nav
│   ├── ProfileCard.jsx         # Browse feed card with hover effect
│   └── ProfileCompletionBanner.jsx
├── firebase/
│   └── config.js               # 🔴 Add your Firebase config here
├── hooks/
│   └── useAuth.jsx             # Auth context & profile state
├── pages/
│   ├── Register.jsx            # Sign up (name, email, password)
│   ├── Login.jsx               # Sign in
│   ├── Onboarding.jsx          # 4-step profile completion wizard
│   ├── Browse.jsx              # Main feed with filters & sorting
│   ├── ProfileView.jsx         # Full profile + Show Interest button
│   ├── MyProfile.jsx           # View/edit own profile
│   ├── Interests.jsx           # Sent / Received tabs
│   └── Notifications.jsx       # Mutual match alerts
└── utils/
    ├── constants.js            # All dropdown options, IU campuses
    └── matchScore.js           # Weighted compatibility algorithm
```

---

## 🧮 Match % Algorithm

| Factor         | Weight |
|----------------|--------|
| Diet           | 20%    |
| Sleep Schedule | 15%    |
| Room Type      | 15%    |
| Rent Range     | 15%    |
| Cleanliness    | 10%    |
| Smoking/Drink  | 10%    |
| Noise Level    | 8%     |
| Pet Preference | 7%     |

---

## 🔔 How Mutual Matching Works

1. User A shows interest in User B
2. User B shows interest in User A  
3. App detects the mutual interest → creates a notification for **both** users
4. Both see an alert: *"🎉 You and [Name] mutually matched!"*
5. Both can view each other's full profiles including contact details

---

## 🏫 IU Campuses Included

- IU Bloomington
- IUPUI (Indianapolis)
- IU East (Richmond)
- IU Kokomo
- IU Northwest (Gary)
- IU South Bend
- IU Southeast (New Albany)
- IU Fort Wayne
