# Studio Booking System

A comprehensive web application for managing recording studio bookings, resources, and client relationships. This platform streamlines the process of booking and managing recording studio spaces, providing tools for both studio owners and musicians/producers.

## Features

### For Studio Owners/Managers
- **Studio Configuration**: Set up studio spaces, equipment inventory, and pricing
- **Booking Management**: View, approve, modify, and track all bookings
- **Staff Scheduling**: Assign staff to sessions and manage availability
- **Revenue Tracking**: Generate reports on studio utilization and income
- **Client Management**: Track client history and preferences

### For Musicians/Producers
- **Easy Booking**: Find and book available studio spaces with real-time availability
- **Equipment Selection**: Add specialized equipment to bookings
- **Scheduling**: Receive confirmations and reminders for upcoming sessions
- **Payment Processing**: Secure online payments for booking deposits or full payments
- **Session Management**: Track booking history and session materials

## Technology Stack

### Frontend
- React.js with TypeScript
- Redux Toolkit for state management
- Material UI component library
- FullCalendar for scheduling interface
- Formik with Yup for form validation
- Axios for API requests
- Stripe Elements for payment UI

### Backend
- Node.js with Express
- RESTful API architecture
- JWT authentication with refresh tokens
- Prisma ORM for database operations
- Stripe API for payment processing
- SendGrid for email notifications
- Twilio for SMS notifications
- AWS S3 for file storage

### Database
- PostgreSQL for primary data storage
- Redis for caching and real-time updates

### DevOps
- Docker for containerization
- GitHub Actions for CI/CD
- AWS (EC2 or ECS) for hosting
- Let's Encrypt for SSL certificates
- Sentry for error tracking

## Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL
- Redis
- Docker (optional, for containerized deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dxaginfo/studio-booking-system.git
   cd studio-booking-system
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # In the server directory, create a .env file
   cp .env.example .env
   
   # Edit the .env file with your database credentials and API keys
   ```

4. **Set up the database**
   ```bash
   # In the server directory
   npx prisma migrate dev
   
   # Seed the database with initial data (optional)
   npm run seed
   ```

5. **Start the development servers**
   ```bash
   # Start the backend server (from the server directory)
   npm run dev
   
   # Start the frontend development server (from the client directory)
   npm start
   ```

6. **Access the application**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000

### Docker Deployment

1. **Build the Docker images**
   ```bash
   docker-compose build
   ```

2. **Start the containers**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Application: http://localhost:3000
   - API: http://localhost:5000

## Project Structure

```
studio-booking-system/
├── client/               # Frontend React application
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── assets/       # Images, fonts, etc.
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context providers
│   │   ├── features/     # Feature-based modules
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Page layout components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux store configuration
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Utility functions
│   │   ├── App.tsx       # Main application component
│   │   └── index.tsx     # Application entry point
│   └── package.json      # Frontend dependencies
│
├── server/               # Backend Node.js/Express application
│   ├── prisma/           # Prisma schema and migrations
│   ├── src/              # Source code
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   ├── app.ts        # Express application setup
│   │   └── server.ts     # Server entry point
│   └── package.json      # Backend dependencies
│
├── docker-compose.yml    # Docker Compose configuration
├── .github/              # GitHub Actions workflows
└── README.md             # Project documentation
```

## API Documentation

API documentation is available at `/api/docs` when running the server locally.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FullCalendar](https://fullcalendar.io/) - Calendar component
- [Material UI](https://mui.com/) - React UI framework
- [Stripe](https://stripe.com/) - Payment processing
- [Prisma](https://www.prisma.io/) - ORM for database access