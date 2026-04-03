import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'

function PrivateRoute ({children}) {
  const {user, loading} = useAuth()
  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" replace/>
}

function PublicRoute ({ children}){
  const { user, loading} = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace/> : children
  }

  export default function App(){
    return(
      <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }