import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Marketplace from './components/Marketplace'
import YazamVault from './components/YazamVault'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Upload from './components/Upload'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Scroll component to handle route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-root">
          <Toaster position="top-center" reverseOrder={false} />
          <ScrollToTop />

          <Navbar />

          <main className="main-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/yazam" element={<YazamVault />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>

      <style jsx>{`
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-container {
          flex: 1;
        }
      `}</style>
    </AuthProvider>
  )
}

export default App
