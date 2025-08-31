# Notes App - Full Stack Developer Assignment

A modern, responsive notes application built with React, TypeScript, and Vite. Features include user authentication, Google OAuth integration, and full CRUD operations for notes management.

## Features

- **User Authentication**: Email-based OTP authentication system
- **Google OAuth**: Seamless Google sign-in integration
- **Notes Management**: Create, read, update, and delete notes
- **Modern UI**: Built with Shadcn/ui components and Tailwind CSS
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Notes sync automatically with the backend
- **Type Safety**: Full TypeScript implementation
- **JWT Authentication**: Secure token-based authentication

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend Integration
- **RESTful API** - Full CRUD operations
- **JWT Authentication** - Secure token management
- **OTP Verification** - Email-based authentication
- **Google OAuth** - Social login integration

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** or **bun** package manager
- **Git** for version control

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd notes-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Backend API URL
VITE_BASE_URL=https://notes-web-app-backend-cdno.onrender.com

# Google OAuth Configuration (Optional) But required for Google Login
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The application will be available at `http://localhost:8080`

## Build Instructions

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
notes-app/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── AuthLayout.tsx   # Authentication layout
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── SignIn.tsx       # Sign-in component
│   │   ├── SignUp.tsx       # Sign-up component
│   │   └── GoogleLoginButton.tsx # Google OAuth button
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx      # Authentication hook
│   │   ├── useNotes.tsx     # Notes management hook
│   │   └── use-mobile.tsx   # Mobile detection hook
│   ├── lib/                 # Utility libraries
│   │   ├── api.ts           # API client
│   │   ├── googleAuth.ts    # Google OAuth utilities
│   │   └── utils.ts         # General utilities
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Main page
│   │   └── NotFound.tsx     # 404 page
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── dist/                    # Build output
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Authentication Flow

### Email OTP Authentication
1. User enters email, name, and date of birth
2. System sends OTP to the provided email
3. User verifies OTP to complete registration
4. User is automatically signed in and redirected to dashboard

### Google OAuth Authentication
1. User clicks "Continue with Google" button
2. Google OAuth popup opens
3. User signs in with Google account
4. System receives JWT token and authenticates user
5. User is redirected to dashboard

## API Endpoints

The application integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/signin` - Initiate sign-in
- `POST /api/auth/verify-signin-otp` - Sign-in OTP verification
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Notes Management
- `GET /api/notes` - Get all notes for authenticated user
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update existing note
- `DELETE /api/notes/:id` - Delete note

## UI Components

The application uses Shadcn/ui components for a consistent and modern design:

- **Cards** - Note display and layout
- **Buttons** - Actions and navigation
- **Forms** - User input and validation
- **Dialogs** - Modal interactions
- **Toasts** - User notifications
- **Loading States** - User feedback during operations

## Testing

### Run Linting

```bash
npm run lint
```

### Manual Testing Checklist

- [ ] User registration with email OTP
- [ ] User sign-in with email OTP
- [ ] Google OAuth sign-in
- [ ] Create, read, update, delete notes
- [ ] Responsive design on mobile devices
- [ ] Error handling and user feedback
- [ ] Authentication state persistence

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy

### Vercel Deployment

1. Connect your repository to Vercel
2. Vercel will automatically detect Vite configuration
3. Add environment variables in Vercel dashboard
4. Deploy

## 🔧 Configuration

### Vite Configuration

The project uses Vite with the following configuration:
- React SWC plugin for fast compilation
- Path aliases for clean imports
- Development server on port 8080
- Hot module replacement enabled

### Tailwind CSS

- Custom color scheme
- Responsive breakpoints
- Animation utilities
- Typography plugin

##  Troubleshooting

### Common Issues

1. **Port 8080 already in use**
   ```bash
   # Kill process using port 8080
   npx kill-port 8080
   ```

2. **Environment variables not loading**
   - Ensure `.env.local` file is in root directory
   - Restart development server after changes

3. **Google OAuth not working**
   - Verify Google Client ID in environment variables
   - Check authorized origins in Google Cloud Console
   - Ensure backend Google auth endpoint is implemented

4. **Build errors**
   ```bash
   # Clear cache and reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📚 Additional Documentation

- [API Integration Guide](./API_INTEGRATION.md) - Detailed API integration documentation
- [Google OAuth Setup](./GOOGLE_SETUP.md) - Google OAuth configuration guide

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is created as part of a full stack developer assignment.

## Author

Nirbhay Choudhary - Full Stack Developer Assignment

---

**Note**: This is a full stack developer assignment showcasing modern web development practices with React, TypeScript, and comprehensive authentication systems.
