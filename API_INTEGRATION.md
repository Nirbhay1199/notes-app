# Notes App API Integration

This document explains how the Notes App frontend integrates with the backend API.

## Environment Setup

Create a `.env.local` file in the root directory with:

```env
VITE_BASE_URL=https://notes-web-app-backend-cdno.onrender.com
```

## API Integration Overview

The app now uses the following backend APIs:

### Authentication APIs
- **POST /api/auth/signup** - User registration with email, name, and DOB
- **POST /api/auth/verify-otp** - OTP verification for signup
- **POST /api/auth/signin** - Initiate signin (send OTP)
- **POST /api/auth/verify-signin-otp** - Verify signin OTP
- **GET /api/auth/me** - Get current user profile
- **POST /api/auth/logout** - User logout

### Notes APIs
- **GET /api/notes** - Get all notes for authenticated user
- **POST /api/notes** - Create new note
- **PUT /api/notes/:id** - Update existing note
- **DELETE /api/notes/:id** - Delete note

## Key Components

### 1. API Client (`src/lib/api.ts`)
- Centralized API communication layer
- Handles all HTTP requests to the backend
- Includes proper error handling and type definitions
- Uses session-based authentication with cookies

### 2. Authentication Hook (`src/hooks/useAuth.tsx`)
- Manages authentication state throughout the app
- Provides methods for signup, signin, OTP verification, and logout
- Automatically checks authentication status on app load
- Integrates with toast notifications for user feedback

### 3. Notes Hook (`src/hooks/useNotes.tsx`)
- Manages notes state and CRUD operations
- Provides loading states for better UX
- Handles API errors with toast notifications
- Automatically refreshes notes after operations

## Authentication Flow

### Sign Up Process:
1. User enters name, DOB, and email
2. Frontend calls `/api/auth/signup` to send OTP
3. User enters OTP received via email
4. Frontend calls `/api/auth/verify-otp` to complete registration
5. User is automatically signed in and redirected to dashboard

### Sign In Process:
1. User enters email address
2. Frontend calls `/api/auth/signin` to send OTP
3. User enters OTP received via email
4. Frontend calls `/api/auth/verify-signin-otp` to complete signin
5. User is redirected to dashboard

## Session Management

- Uses Express sessions with cookies for authentication
- No JWT tokens required - simpler for personal projects
- Sessions are automatically handled by the browser
- Logout clears the session on the backend

## Error Handling

- All API errors are caught and displayed via toast notifications
- Loading states prevent multiple simultaneous requests
- Form validation ensures required fields are filled
- Network errors are gracefully handled with user-friendly messages

## Usage Examples

### Using the Authentication Hook:
```tsx
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, signIn, logout } = useAuth();
  
  // Check if user is authenticated
  if (user) {
    return <div>Welcome, {user.name}!</div>;
  }
  
  // Sign in
  const handleSignIn = async () => {
    try {
      await signIn('user@example.com');
    } catch (error) {
      // Error is handled by the hook
    }
  };
};
```

### Using the Notes Hook:
```tsx
import { useNotes } from '@/hooks/useNotes';

const NotesComponent = () => {
  const { notes, createNote, isLoading } = useNotes();
  
  const handleCreate = async () => {
    try {
      await createNote('Title', 'Content');
    } catch (error) {
      // Error is handled by the hook
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {notes.map(note => (
        <div key={note.id}>{note.title}</div>
      ))}
    </div>
  );
};
```

## Testing

The app includes a comprehensive Postman collection (`Notes-App-API.postman_collection.json`) for testing all endpoints. Update the `base_url` variable in the collection to point to your backend deployment.

## Security Features

- OTP-based authentication (no passwords)
- Session-based authentication
- CSRF protection via session cookies
- Input validation on both frontend and backend
- Rate limiting on OTP endpoints (handled by backend)

## Deployment Notes

- Ensure your backend is deployed and accessible
- Update the `VITE_BASE_URL` environment variable
- The frontend will automatically connect to the backend
- All API calls include proper CORS headers and credentials
