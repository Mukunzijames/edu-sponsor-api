# 🎓 EDU Sponsor API

[![codecov](https://codecov.io/gh/Mukunzijames/edu-sponsor-api/graph/badge.svg?token=4L0BHVF2P7)](https://codecov.io/gh/Mukunzijames/edu-sponsor-api)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Neon](https://img.shields.io/badge/neon-00E599?style=for-the-badge&logo=neon&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

A comprehensive RESTful API for managing educational sponsorships. This application facilitates connections between sponsors and students, manages school data, handles donations, and processes payments through Stripe integration.

## ✨ Features

- 🏫 **School Management**: CRUD operations for educational institutions
- 👨‍🎓 **Student Profiles**: Comprehensive student information management
- 🤝 **Sponsorship System**: Connect sponsors with students
- 💰 **Donation Tracking**: Monitor and manage educational donations
- 💳 **Payment Processing**: Secure payment handling via Stripe
- 🔐 **JWT Authentication**: Secure user authentication and authorization
- 📊 **Code Coverage**: Comprehensive test coverage with NYC
- 🚀 **TypeScript**: Full type safety and modern development experience

## 🏗️ Project Structure

```
edu-sponsor-api/
├── src/
│   ├── controllers/           # Request handlers and business logic
│   │   ├── authController.ts      # User authentication
│   │   ├── schoolController.ts    # School management
│   │   ├── studentController.ts   # Student management
│   │   ├── sponsorshipController.ts # Sponsorship operations
│   │   ├── donationController.ts  # Donation handling
│   │   └── paymentController.ts   # Stripe payment processing
│   ├── middleware/            # Custom middleware functions
│   │   ├── auth.ts               # JWT authentication middleware
│   │   └── stripe.ts             # Stripe webhook middleware
│   ├── routes/                # API route definitions
│   │   ├── authRoutes.ts         # Authentication routes
│   │   ├── schoolRoutes.ts       # School API routes
│   │   ├── studentRoutes.ts      # Student API routes
│   │   ├── sponsorshipRoutes.ts  # Sponsorship API routes
│   │   ├── paymentRoutes.ts      # Payment & donation routes
│   │   └── index.ts              # Main route aggregator
│   ├── db/                    # Database configuration
│   │   └── schema.ts             # Drizzle ORM schema definitions
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts              # Shared types and interfaces
│   ├── test/                  # Test suites
│   │   ├── auth.test.ts          # Authentication tests
│   │   ├── school.test.ts        # School API tests
│   │   ├── student.test.ts       # Student API tests
│   │   ├── sponsorship.test.ts   # Sponsorship tests
│   │   ├── donation.test.ts      # Donation tests
│   │   └── payment.test.ts       # Payment processing tests
│   ├── app.ts                 # Express application setup
│   └── server.ts              # Application entry point
├── dist/                      # Compiled JavaScript output
├── coverage/                  # Test coverage reports
├── node_modules/              # Dependencies
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .mocharc.json              # Mocha test configuration
└── README.md                  # Project documentation
```

## 🛠️ Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Neon)
- **ORM**: Drizzle ORM
- **Authentication**: JSON Web Tokens (JWT)
- **Payment Processing**: Stripe
- **Testing**: Mocha + Chai + Supertest
- **Code Coverage**: NYC (Istanbul)
- **Process Management**: Nodemon (development)

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (or Neon account)
- **Stripe** account for payment processing

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_neon_database_url

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mukunzijames/edu-sponsor-api.git
   cd edu-sponsor-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Generate database schema**
   ```bash
   npm run db:generate
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

## 🏃‍♂️ Running the Application

### Development Mode
Start the development server with hot reloading:
```bash
npm run dev
```
The API will be available at `http://localhost:3000`

### Production Mode
First build the application, then start it:
```bash
npm run build
npm start
```

## 🏗️ Build Commands

### Build for Production
Compile TypeScript to JavaScript:
```bash
npm run build
```
This creates optimized JavaScript files in the `dist/` directory.

### Database Commands
```bash
# Generate new migrations
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema changes directly
npm run db:push

# Open Drizzle Studio (Database GUI)
npm run db:studio
```

## 🧪 Testing

### Run All Tests
Execute the complete test suite:
```bash
npm test
```

### Watch Mode
Run tests in watch mode for development:
```bash
npm run test:watch
```

### Coverage Report
Generate detailed test coverage reports:
```bash
npm run test:coverage
```
Coverage reports are generated in HTML format in the `coverage/` directory.

### Test Structure
- **136 comprehensive tests** covering all API endpoints
- **Authentication & Authorization** testing
- **Input validation** and error handling
- **Database integration** testing
- **Payment processing** with Stripe mocks
- **Real-time coverage** reporting with NYC

## 📚 API Documentation

The API includes Swagger documentation available at:
```
http://localhost:3000/swagger
```

### Main Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/schools` | Get all schools | ❌ |
| GET | `/api/schools/:id` | Get school by ID | ❌ |
| POST | `/api/schools` | Create school | ✅ |
| GET | `/api/students` | Get all students | ❌ |
| POST | `/api/students` | Create student | ✅ |
| GET | `/api/sponsorships` | Get sponsorships | ✅ |
| POST | `/api/sponsorships` | Create sponsorship | ✅ |
| GET | `/api/payments/donations/all` | Get all donations | ❌ |
| POST | `/api/payments/donations` | Create donation | ✅ |

## 🔧 Development

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks (if configured)

### Testing Best Practices
- Integration tests for all endpoints
- Mocking external services (Stripe)
- Database transaction isolation
- Comprehensive error scenario testing

## 📈 Performance & Monitoring

- **Code Coverage**: Maintained above 65% line coverage
- **Response Times**: Optimized database queries with Drizzle ORM
- **Error Tracking**: Comprehensive error handling and logging
- **Security**: JWT-based authentication with proper middleware

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Mukunzijames/edu-sponsor-api/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with ❤️ for education and sponsorship management**