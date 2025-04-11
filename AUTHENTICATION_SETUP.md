# Authentication Setup for Admin Area

This project uses NextAuth.js with OAuth authentication to protect the admin area. The system supports Google OAuth for secure login and also provides a fallback credentials-based login option.

## How It Works

1. **Middleware Protection**: All routes under `/admin/*` (except `/admin/login`) are protected by middleware that checks for a valid authentication session.

2. **OAuth Authentication Flow**:
   - When a user tries to access an admin page without being authenticated, they are redirected to the login page.
   - The login page offers options to sign in with Google or with username/password.
   - After successful authentication, the user is redirected back to the admin area.
   - The session information is securely managed by NextAuth.js.

3. **Role-Based Access Control**: The system supports role-based access control, with the ability to restrict access to users with the "admin" role.

4. **Logout**: Users can log out by clicking the logout button in the admin navigation bar, which ends their session.

## Configuration

The authentication system requires the following environment variables in your `.env.local` file:

### Required Variables

- `NEXTAUTH_URL`: The base URL of your application (e.g., `http://localhost:3000` for development)
- `NEXTAUTH_SECRET`: A secret key used to encrypt cookies (should be at least 32 characters)

### OAuth Providers

For Google OAuth:
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

### Credentials Login (Fallback)

- `ADMIN_USERNAME`: Username for the admin account
- `ADMIN_PASSWORD`: Password for the admin account

### Access Control (Optional)

- `ALLOWED_EMAILS`: Comma-separated list of email addresses that are allowed to access the admin area
- `ALLOWED_DOMAINS`: Comma-separated list of email domains that are allowed to access the admin area

## Setting Up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Set the application type to "Web application"
6. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env.local` file

## Adding New Admin Users

To give someone access to the admin area, you can:

1. Add their email to the `ALLOWED_EMAILS` environment variable
2. Add their email domain to the `ALLOWED_DOMAINS` environment variable
3. Configure the `signIn` callback in the NextAuth.js configuration to implement custom access control logic

## Security Considerations

- Sessions are managed securely by NextAuth.js using JWT tokens
- In production, cookies are set with the `secure` flag to ensure they're only sent over HTTPS
- The middleware ensures that all admin routes are protected
- OAuth provides a secure authentication method without storing passwords
- The fallback credentials login can be disabled by removing the Credentials provider if not needed
