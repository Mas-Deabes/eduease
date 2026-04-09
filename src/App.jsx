import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Discussions from './pages/Discussions'
import Modules from './pages/Modules'
import Assignments from './pages/Assignments'
import Quiz from './pages/Quiz'
import InstructorOverview from './pages/InstructorOverview'
import QuizCreator from './pages/QuizCreator'


function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="discussions" element={<Discussions />} />
        <Route path="modules" element={<Modules />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="quiz/:quizId" element={<Quiz />} />
        <Route path="students" element={<InstructorOverview />} />
        <Route path="quiz-creator" element={<QuizCreator />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}