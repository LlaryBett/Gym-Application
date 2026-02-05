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


function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/programs-events" element={<ProgramsEvents />} />
          <Route path="/register" element={<MemberRegistration />} />
          
          {/* Add more routes as needed */}
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
