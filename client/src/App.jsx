import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingHelpline from './components/FloatingHelpline';
import Home from './pages/Home';
import About from './pages/Trainers';
import Services from './pages/Services';
import Membership from './pages/Membership';
import Recovery from './components/Recovery';
import CTA from './components/CTA';
import Benefits from './components/Benefits';
import Trainers from './pages/Trainers';
import ProgramsEvents from './pages/ProgramsEvents';
import MemberRegistration from './components/MemberRegistration';
import ProgramDetail from './pages/ProgramDetail';
import AuthProvider from './context/authContext';
import ThankYou from './components/ThankYou';
import Login from './components/Login';
import BookService from './pages/BookService';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ForgotMembership from './pages/ForgotMembership';
import AboutUs from './pages/Aboutus';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

// Admin imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/Members';
import AdminTrainers from './pages/admin/AdminTrainers';
import AdminPrograms from './pages/admin/Programs';
import AdminBookings from './pages/admin/Bookings';
import AdminMembershipPlans from './pages/admin/MembershipPlans';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

// Wrapper component to use hooks
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`App ${!isAdminRoute ? 'pt-16 md:pt-20' : ''}`}>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          className: 'custom-toast',
          success: {
            className: 'custom-toast success-toast',
          },
          error: {
            className: 'custom-toast error-toast',
          },
        }}
      />

      {/* Only show Header on non-admin routes */}
      {!isAdminRoute && <Header />}
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/membership/success" element={<PaymentSuccess />} />
          <Route path="/membership/failed" element={<PaymentFailed />} />
          <Route path="/programs-events" element={<ProgramsEvents />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />
          <Route path="/register" element={<MemberRegistration />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book-service/:id" element={<BookService />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-membership" element={<ForgotMembership />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="trainers" element={<AdminTrainers />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="plans" element={<AdminMembershipPlans />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </main>
      
      {/* Only show Footer and FloatingHelpline on non-admin routes */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingHelpline />}
    </div>
  );
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;