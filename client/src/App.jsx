import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/Trainers'
import Services from './pages/Services'
import Membership from './pages/Membership'
import Recovery from './components/Recovery'
import CTA from './components/CTA'
import Benefits from './components/Benefits'
import Trainers from './pages/Trainers'
import ProgramsEvents from './pages/ProgramsEvents'
import MemberRegistration from './components/MemberRegistration'
import ProgramDetail from './pages/ProgramDetail'
import AuthProvider from './context/authContext.jsx' // added
import ThankYou from './components/ThankYou' // added
import Login from './components/Login'
import BookService from './pages/BookService';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile.jsx';
function App() {
  return (
    <div className="App pt-12 md:pt-20">
      <AuthProvider>
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/services" element={<Services />} />
            <Route path="/recovery" element={<Recovery />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/programs-events" element={<ProgramsEvents />} />
            <Route path="/programs/:id" element={<ProgramDetail />} />
            <Route path="/register" element={<MemberRegistration />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/login" element={<Login />} />
            <Route path="/book-service/:id" element={<BookService />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
        
        <Footer />
      </AuthProvider>
    </div>
  )
}

export default App
