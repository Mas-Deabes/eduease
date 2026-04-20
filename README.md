EduEase
A web-based educational support platform designed to increase social presence in online learning environments. EduEase provides students with anonymous discussion, progress tracking and at-risk detection, while giving instructors the tools to identify and support struggling students early.
Live Demo
https://eduease-self.vercel.app
Features

Anonymous Discussion Board — students can post questions publicly or anonymously. When posting anonymously the real name is never stored in the database
Student Dashboard — displays quiz average, progress ring, weekly activity chart and an at-risk warning for students below the 40% pass threshold
Quiz Creator — instructors can build multiple choice quizzes with automatic marking
Quiz Player — students take quizzes with immediate per-question feedback showing correct and incorrect answers
Instructor Overview — instructors can view all students, their quiz averages and at-risk flags, with a direct contact button for each student
Modules Page — instructors can create modules, students can view their enrolled modules and progress
Role Based Access — students and instructors see different navigation menus and have access to different features

Tech Stack
TechnologyPurposeReactFrontend frameworkViteBuild toolFirebase AuthenticationUser login and registrationCloud FirestoreNoSQL databaseReact RouterClient side navigationRechartsData visualisationVercelDeployment
Getting Started
Prerequisites

Node.js version 18 or higher
A Firebase project with Authentication and Firestore enabled

Installation

Clone the repository

git clone https://github.com/Mas-Deabes/eduease.git
cd eduease

Install dependencies

npm install

Create a .env file in the project root and add your Firebase credentials

VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_STORAGE_BUCKET=your_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value

Start the development server

npm run dev

Open http://localhost:5173 in your browser

Firebase Setup

Go to console.firebase.google.com
Create a new project
Enable Email/Password authentication under Authentication → Sign-in method
Create a Firestore database in test mode
Copy your web app configuration into the .env file

User Roles
EduEase has two user roles — student and instructor.
All users who register through the app are automatically assigned the student role. To create an instructor account, register normally and then manually change the role field from student to instructor in the Firestore console under the users collection.
Project Structure
src/
├── components/     — reusable UI components (Layout, sidebar)
├── context/        — AuthContext for global authentication state
├── lib/            — Firebase connection
├── pages/          — full page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Discussions.jsx
│   ├── Assignments.jsx
│   ├── Quiz.jsx
│   ├── QuizCreator.jsx
│   ├── Modules.jsx
│   └── InstructorOverview.jsx
└── styles/         — global CSS and design tokens
Academic Context
This project was developed as a Final Year Project for BSc Computer Science at Kingston University by Sif El Din Deabes (K2373433), April 2026.
The project is grounded in social presence theory — research showing that students in online learning environments perform better when they feel connected to peers and instructors. EduEase addresses the gap identified in existing LMS platforms by providing anonymous discussion and proactive at-risk detection.
