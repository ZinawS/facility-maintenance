
import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './context/ProtectedRoute';
import NavBar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import PartsStore from './pages/PartsStore';
import Testimonials from './pages/Testimonials';
import FAQ from './pages/FAQ';
import ServicePlans from './pages/ServicePlans';

/**
 * App component for routing and navigation
 * @returns {JSX.Element} The rendered App component
 */
function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div className="container mx-auto p-6 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/parts" element={<PartsStore />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/service-plans" element={<ServicePlans />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
