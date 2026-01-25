import React from 'react'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowRight
} from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="w-full bg-black-900 text-white">
      <div className="max-w-7xl mx-auto px-16 py-12">

        {/* Footer Grid - 5 columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">

          {/* Column 1: Logo + Description */}
          <div>
            <h3 className="text-2xl font-bold mb-3"><span className="text-2xl font-heading font-bold text-white-900">
              Power<span className="text-orange-500">Gym</span>
            </span></h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your ultimate fitness destination with state-of-the-art equipment and expert trainers. Join us to reach your fitness goals efficiently and safely.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition">Home</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Services</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Membership</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">About Us</a></li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition">Personal Training</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Group Classes</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Nutrition Plans</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Recovery & Wellness</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <FaPhone className="text-orange-500" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-orange-500" />
                info@fithub.com
              </li>
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-500" />
                123 Fitness Ave, City, ST
              </li>
            </ul>
          </div>

          {/* Column 5: Subscribe */}
          <div>
            <h4 className="font-semibold mb-4">Subscribe</h4>

            {/* Email input */}
            <div className="flex items-center justify-between">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-full"
              />
              <button className="ml-3 text-orange-500 hover:text-orange-600 transition">
                <FaArrowRight />
              </button>
            </div>

            {/* Divider line */}
            <div className="w-full h-px bg-gray-700 mt-2" />

            {/* Optional socials under subscribe */}
            <div className="flex gap-4 mt-5">
              <a href="#" className="hover:text-orange-500 transition">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-700 mb-4" />

        {/* Copyright */}
        <div className="text-center text-sm text-gray-400">
          &copy; 2024 FitHub. All rights reserved.
        </div>

      </div>
    </footer>
  )
}

export default Footer
