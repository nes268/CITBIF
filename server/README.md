# CITBIF Backend Server

Express backend server with MongoDB for the CITBIF application.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the `server` directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/citbif
   ```
   
   For MongoDB Compass, use your connection string. Example:
   ```
   MONGODB_URI=mongodb://localhost:27017/citbif
   ```

3. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - If using MongoDB Compass, ensure the connection is active

4. **Run the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **API Endpoints**
   - `POST /api/auth/signup` - User signup
     - Body: `{ fullName, email, username, password, role: 'admin' | 'user' }`
   - `GET /api/health` - Health check

## Database Collections

- **admins** - Stores admin users
- **users** - Stores regular users

## Notes

- Passwords are hashed using bcryptjs
- Email and username must be unique across both collections
- Admin users are stored in the `admins` collection
- Regular users are stored in the `users` collection


