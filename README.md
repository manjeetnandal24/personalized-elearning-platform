# LearnTrack - Personalized E-Learning Platform

LearnTrack is a full-stack Learning Management System built using React, TypeScript, Node.js, Express, Prisma, and PostgreSQL.

This is the frontend repository of LearnTrack.

## Repositories

Frontend: https://github.com/manjeetnandal24/personalized-elearning-platform.git

Backend: https://github.com/manjeetnandal24/personalized-elearning-backend.git

## Tech Stack

- React.js
- TypeScript
- Vite
- CSS
- React Router

## Main Features

### Authentication
- Register and login
- Email verification
- Forgot password
- Reset password
- Role-based access

### Student
- Browse courses
- Enroll in courses
- Track lesson progress
- Attempt quizzes
- View certificates
- View announcements
- Access course resources
- Contact/support page
- AI assistant

### Instructor
- Instructor dashboard
- Manage assigned courses
- Manage curriculum
- Manage quizzes
- View students
- View analytics
- Add announcements
- Add course resources

### Admin
- Admin dashboard
- Manage students
- Manage instructors
- Assign instructors to courses
- Manage courses
- Manage curriculum
- Manage quizzes
- Manage certificates
- View analytics
- Manage announcements
- Manage resources
- View support queries

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@test.com | Available on request |
| Instructor | instructor@test.com | Available on request |
| Student | teststudent3@example.com | Available on request |

## How to Run Frontend

Install dependencies:

```bash
npm install



```

Start development server:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

Frontend runs on:

```text
http://localhost:5173
```

## Environment Variable

Create `.env` file in frontend root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Developed By

Manjeet Nandal  
B.Tech CSE  
Project: LearnTrack