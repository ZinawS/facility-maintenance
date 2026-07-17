
import React, { useContext, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './context/ProtectedRoute';
import NavBar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ErrorBoundary from './components/UI/ErrorBoundary';
import Spinner from './components/UI/Spinner';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));
const PartsStore = lazy(() => import('./pages/PartsStore'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ServicePlans = lazy(() => import('./pages/ServicePlans'));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'));
const LegalDocument = lazy(() => import('./pages/LegalDocument'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * App component for routing and navigation
 * @returns {JSX.Element} The rendered App component
 */
function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <Spinner size="lg" className="min-h-screen" />;
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow">
          <Suspense fallback={<Spinner size="lg" className="min-h-[60vh]" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
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
              <Route
                path="/parts"
                element={
                  <ProtectedRoute>
                    <PartsStore />
                  </ProtectedRoute>
                }
              />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/service-plans" element={<ServicePlans />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/legal/:type" element={<LegalDocument />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
