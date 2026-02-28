import React from 'react';
import { FaGithub, FaQuestion } from 'react-icons/fa';

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = '1.0.0';

  return (
    <footer className="bg-gray-900 border-t-4 border-orange-500 text-gray-300 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Left: App Info */}
          <div>
            <h3 className="text-white font-semibold mb-2">PowerGym Admin</h3>
            <p className="text-sm text-gray-400">
              Version {appVersion}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              © {currentYear} PowerGym. All rights reserved.
            </p>
          </div>

          {/* Center: Quick Info */}
          <div>
            <h4 className="text-white font-semibold mb-2 text-sm">System</h4>
            <ul className="text-sm space-y-1 text-gray-400">
              <li>Database: <span className="text-green-400">Connected</span></li>
              <li>API Status: <span className="text-green-400">Operational</span></li>
            </ul>
          </div>

          {/* Right: Links */}
          <div>
            <h4 className="text-white font-semibold mb-2 text-sm">Resources</h4>
            <div className="flex gap-4">
              <a 
                href="#help" 
                className="flex items-center gap-2 text-sm hover:text-orange-500 transition"
              >
                <FaQuestion size={14} />
                Help
              </a>
              <a 
                href="#docs" 
                className="flex items-center gap-2 text-sm hover:text-orange-500 transition"
              >
                <FaGithub size={14} />
                Docs
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-4">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
