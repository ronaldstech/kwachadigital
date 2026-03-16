import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import BuyTokensModal from './components/BuyTokensModal';


// Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Orders from './pages/Orders';
import Yazam from './pages/Yazam';
import PresentationDetail from './pages/PresentationDetail';
import FreeProducts from './pages/FreeProducts';
import AITools from './pages/AITools';
import DissertationTool from './anonemasi/pages/DissertationTool';
import EssayTool from './anonemasi/pages/EssayTool';
import PowerPointTool from './anonemasi/pages/PowerPointTool';

// Helper to scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Route Component
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.info(`[ProtectedRoute] Path: ${location.pathname}, Loading: ${loading}, User: ${user ? 'Authenticated' : 'Guest'}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    console.info(`[ProtectedRoute] No user found at ${location.pathname}. Redirecting to Home.`);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Layout for Public Pages (with Navbar and Footer)
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-bg-main flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const AppContent = () => {
  const { 
    user,
    isAuthModalOpen, 
    closeAuthModal, 
    initialAuthMode,
    isBuyTokensModalOpen,
    closeBuyTokensModal
  } = useAuth();


  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" />

      <Routes>
        {/* Public Routes with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/yazam" element={<Yazam />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/presentation/:id" element={<PresentationDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/ai-tools" element={<AITools />} />
          <Route path="/ai-tools/free-products" element={<FreeProducts />} />
          
          {/* Protected Dashboard Routes (WITH Navbar/Footer) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<Orders />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Protected AI Tool Routes (IMMERSIVE - NO Navbar/Footer) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/ai-tools/dissertation" element={<DissertationTool />} />
          <Route path="/ai-tools/essay" element={<EssayTool />} />
          <Route path="/ai-tools/powerpoint" element={<PowerPointTool />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
        initialMode={initialAuthMode} 
      />
      <BuyTokensModal 
        isOpen={isBuyTokensModalOpen} 
        onClose={closeBuyTokensModal} 
        user={user}
      />

    </>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
