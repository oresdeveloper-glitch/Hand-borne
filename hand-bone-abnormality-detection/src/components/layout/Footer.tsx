import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Code, Share2, Mail, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const links = {
    Product: [
      { name: 'How It Works', path: '/#how-it-works' },
      { name: 'Features', path: '/#features' },
      { name: 'Results', path: '/#results' },
    ],
    Company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Careers', path: '#' },
    ],
    Legal: [
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '#' },
    ],
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Brain className="text-white w-7 h-7" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                HBA
              </span>
            </Link>
            <p className="text-slate-400 text-sm">
              AI-powered hand bone abnormality detection from X-ray images.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Code className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-slate-400 hover:text-blue-400 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} HBA. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for Healthcare</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;