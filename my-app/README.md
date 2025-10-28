# 🏔️ TrekGuide - Trekking Guide & Portal MVP

A full-stack MVP platform that connects trekkers with trekking guides and provides comprehensive trek route information including shops and waste disposal points.

## Features

- **Authentication** (NextAuth.js with Credentials Provider)
  - User registration and login
  - Role-based access (Guide/User)
  - JWT session management

- **Guide Management**
  - Guide profile creation and editing
  - Public guide directory
  - Profile photo upload support

- **Trek Information**
  - Detailed trek routes with difficulty levels
  - Interactive maps using Leaflet
  - Shop locations along routes
  - Waste disposal points

- **Responsive UI**
  - Built with Tailwind CSS
  - Mobile-friendly design
  - Clean and modern interface

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB (via Mongoose)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React-Leaflet

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the `my-app` directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/trekguide
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trekguide

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

Generate a random secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Load Sample Data**: Click the "Load Sample Treks" button on the home page to populate the database with 6 sample trek routes including Annapurna Circuit, Everest Base Camp, and more!

## Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── guides/
│   │   └── treks/
│   ├── (auth)/
│   ├── (guides)/
│   ├── (dashboard)/
│   ├── (treks)/
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
├── models/
└── types/
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Guides
- `GET /api/guides` - Get all guides
- `POST /api/guides` - Create/update guide profile (guide only)
- `GET /api/guides/[id]` - Get guide by ID

### Treks
- `GET /api/treks` - Get all treks
- `POST /api/treks` - Create new trek
- `GET /api/treks/[id]` - Get trek by ID

## User Roles

### Guide
- Register and login
- Create and edit profile
- Access dashboard

### User (Trekker)
- Browse guides and treks
- View detailed guide profiles
- Explore trek routes with maps

## Database Schema

### Users
- name, email, password (hashed), role

### Guides
- userId, fullName, age, education, experienceYears, wagesPerDay, bio, photoUrl

### Treks
- name, description, difficulty, shops (array), wastePoints (array)

## Future Enhancements

- React Native mobile app (consuming the same API)
- Booking system for guides
- Reviews and ratings
- Real-time chat
- Payment integration
