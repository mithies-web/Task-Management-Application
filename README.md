# GenFlow Task Management System - MEAN Stack Monorepo

A comprehensive task management application built with Angular, Node.js, Express, and MongoDB. This monorepo contains both the frontend (Angular) and backend (Node.js/Express) applications.

## 📁 Project Structure

```
├── client/                 # Angular frontend application
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
├── server/                 # Node.js/Express backend API
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── index.js       # Server entry point
│   ├── .env.example       # Environment variables template
│   └── package.json
├── package.json           # Root package.json with monorepo scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Atlas account (or local MongoDB instance)

### Installation

#### Method 1: One Command Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd genflow-task-management

# Install all dependencies and start development servers
npm run install:all
npm run dev
```

#### Method 2: Manual Setup
```bash
# Install root dependencies (development tools)
npm install

# Install server dependencies
npm --prefix server install

# Install client dependencies  
npm --prefix client install

# Start development servers
npm run dev
```

### Environment Setup

1. **Server Environment**:
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Configure your `.env` file**:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:4200
   ```

3. **MongoDB Atlas Setup**:
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Replace `your_mongodb_atlas_connection_string` in `.env`

## 📋 Available Scripts

### Root Level Scripts
- `npm run install:all` - Install dependencies for all packages
- `npm run dev` - Start both client and server in development mode
- `npm run build:all` - Build both client and server
- `npm run test:all` - Run tests for both client and server

### Client Scripts (Angular)
- `npm run start --prefix client` - Start Angular development server
- `npm run build --prefix client` - Build Angular application
- `npm run test --prefix client` - Run Angular tests

### Server Scripts (Node.js)
- `npm run start --prefix server` - Start Node.js server
- `npm run dev --prefix server` - Start server with nodemon
- `npm run test --prefix server` - Run server tests

## 🔧 Development

### Client Development (Angular)
The Angular application runs on `http://localhost:4200` and includes:
- Role-based authentication (Admin, Team Lead, Member)
- Responsive dashboards for each user role
- Project and task management
- Real-time collaboration features
- Comprehensive reporting system

### Server Development (Node.js/Express)
The Express API runs on `http://localhost:5000` and provides:
- RESTful API endpoints
- JWT-based authentication
- Role-based authorization
- MongoDB integration with Mongoose
- Input validation and error handling

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

#### Users (Admin only)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

#### Teams (Admin only)
- `GET /api/admin/teams` - Get all teams
- `POST /api/admin/teams` - Create team
- `PUT /api/admin/teams/:id` - Update team
- `DELETE /api/admin/teams/:id` - Delete team

#### Projects
- `GET /api/projects` - Get projects
- `POST /api/projects` - Create project (Team Lead+)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (Admin only)

#### Tasks
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task (Team Lead+)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Team Lead+)

## 🔐 Demo Credentials

### Admin Account
- **Email**: `admin@genworx.ai`
- **Password**: `@Admin123`

### Team Lead Account
- **Email**: `mithiesoff@gmail.com`
- **Password**: `@Mithies2315`

### Team Member Account
- **Email**: `mithiesofficial@gmail.com`
- **Password**: `@Mithies2317`

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: Angular 20+
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Charts**: Chart.js
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 🔒 Security Features

- JWT-based authentication
- Role-based authorization
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Security headers with Helmet

## 📊 Features

### For Administrators
- User management (create, update, delete users)
- Team management and organization
- System-wide analytics and reporting
- Content management for public pages
- Performance monitoring

### For Team Leads
- Project creation and management
- Team member assignment
- Task delegation and tracking
- Sprint planning and management
- Team performance analytics

### For Team Members
- Personal task dashboard
- Task progress tracking
- Calendar integration
- Time tracking
- Report generation

## 🚀 Deployment

### Client Deployment
```bash
npm run build --prefix client
# Deploy the dist/client folder to your hosting service
```

### Server Deployment
```bash
npm run build --prefix server
# Deploy the server folder to your hosting service
# Set environment variables in production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- **Email**: mithiesofficial@gmail.com
- **Phone**: +91 6383350764 / +91 6374624848

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by the GenWorx AI Team**