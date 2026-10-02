# MediBook - Appointment Booking System

A modern, full-stack appointment booking website built with React, TypeScript, Express.js, and designed for healthcare providers and patients.

## 🚀 Features

### Patient Dashboard

- **User Authentication**: Secure signup and login with password hashing
- **Appointment Booking**: Easy-to-use form with date, time, and notes
- **Appointment History**: View previous, cancelled, and rescheduled appointments
- **PDF Downloads**: Download completed appointment details as PDF
- **Messages**: Send messages to admin (Coming soon)

### Admin Dashboard

- **User Management**: View all registered users
- **Appointment Management**: Approve, cancel, reschedule appointments with filters
- **Dashboard Statistics**: Real-time counts and analytics
- **Message Responses**: Respond to patient messages (Coming soon)
- **Status Updates**: Update appointment statuses with one click

### Technical Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Patient and Admin role separation
- **REST API**: Clean API structure for all operations
- **PDF Generation**: Automatic PDF generation for appointment details
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live dashboard updates

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Query** for data fetching

### Backend

- **Node.js** with Express.js
- **TypeScript** for type safety
- **JWT** for authentication
- **bcryptjs** for password hashing
- **jsPDF** for PDF generation

### Database (Recommended)

- **PostgreSQL** with Supabase or Neon (via MCP integration)
- **MySQL** support ready (replace mock data with actual queries)

## 📋 Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **Database** (Connect via MCP for production use)

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd medibook

# Install dependencies
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key

# Database Configuration (when using actual database)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medibook
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Server Configuration
PORT=8080
NODE_ENV=development
```

### 3. Database Setup (Production)

For production use, connect to a database via MCP:

1. **Supabase**: Click "Connect MCP" in the UI and select Supabase
2. **Neon**: Click "Connect MCP" in the UI and select Neon
3. **MySQL**: Replace mock data in server routes with actual MySQL queries

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin User', 'admin@example.com', '$2a$10$example', 'admin');
```

### 4. Development

```bash
# Start development server (runs both frontend and backend)
pnpm dev

# The application will be available at:
# http://localhost:8080
```

### 5. Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🎯 Demo Credentials

### Admin Access

- **Email**: `admin@example.com`
- **Password**: Any password (demo mode)

### Patient Access

- Create a new account using the signup form
- All new users are automatically assigned the "patient" role

## 📚 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Appointments (Protected)

- `POST /api/appointments` - Create appointment (Patient)
- `GET /api/appointments/user` - Get user appointments (Patient)
- `GET /api/appointments` - Get all appointments (Admin)
- `PUT /api/appointments/:id/status` - Update status (Admin)
- `DELETE /api/appointments/:id` - Delete appointment (Admin)

### Messages (Protected)

- `POST /api/messages` - Send message
- `GET /api/messages/user` - Get user messages
- `GET /api/messages` - Get all messages (Admin)

### PDF Generation

- `GET /api/appointments/:id/pdf` - Download appointment PDF

### Admin Dashboard

- `GET /api/admin/stats` - Get dashboard statistics (Admin)

## 🔧 Configuration

### Environment Variables

| Variable     | Description               | Default     |
| ------------ | ------------------------- | ----------- |
| `JWT_SECRET` | Secret key for JWT tokens | Required    |
| `PORT`       | Server port               | 8080        |
| `NODE_ENV`   | Environment mode          | development |
| `DB_*`       | Database configuration    | -           |

### Customization

- **Styling**: Modify `client/global.css` and `tailwind.config.ts`
- **Branding**: Update logo and colors in components
- **Features**: Add new routes in `server/routes/` and pages in `client/pages/`

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├── components/ui/      # Reusable UI components
│   ├── lib/               # Utilities and auth
│   ├── pages/             # Application pages
│   └── App.tsx            # Main app component
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   └── index.ts           # Server configuration
├── shared/                # Shared types and interfaces
└── package.json           # Dependencies and scripts
```

## 🚀 Deployment

### Netlify/Vercel (Recommended)

1. Connect your repository
2. Build command: `pnpm build`
3. Publish directory: `dist/spa`
4. Set environment variables in deployment settings

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [Your deployment URL]
- **Documentation**: [Additional docs if available]
- **Support**: [Contact information]

---

**Built with ❤️ using Builder.io, React, TypeScript, and modern web technologies.**
