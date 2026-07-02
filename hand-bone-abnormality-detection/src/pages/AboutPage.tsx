import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, BarChart3, Users } from 'lucide-react';

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'All data is encrypted and stored securely according to healthcare regulations.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'AI-powered analysis completes in under 2 seconds.',
    },
    {
      icon: BarChart3,
      title: '99.2% Accuracy',
      description: 'Trained on over 10,000 medical images for precision.',
    },
    {
      icon: Users,
      title: 'Medical Grade',
      description: 'Designed in collaboration with healthcare professionals.',
    },
  ];

  const team = [
    { name: 'Dr. Sarah Chen', role: 'Lead AI Researcher', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
    { name: 'Dr. Michael Rodriguez', role: 'Radiology Consultant', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
    { name: 'Dr. Emily Johnson', role: 'Medical Imaging Specialist', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            About HBA System
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
            AI-powered hand bone abnormality detection system
          </p>
        </motion.div>

        {/* Project Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Project Overview</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                HBA is an AI-powered system designed to automatically detect and localize hand bone abnormalities from X-ray images. Using convolutional neural networks (CNNs) with Grad-CAM visualization, it provides both classification and localization of abnormalities.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Detects fractures and other bone abnormalities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Provides heatmap visualization for abnormal region localization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>HIPAA-compliant and secure for medical use</span>
                </li>
              </ul>
            </div>
            <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519494026894-cc9b9468200c?w=800&q=80"
                alt="AI Analysis"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Technology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 mb-16"
        >
          <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Deep Learning Architecture</h3>
              <ul className="space-y-2 text-slate-500">
                <li>• Convolutional Neural Networks (CNN)</li>
                <li>• Grad-CAM for localization visualization</li>
                <li>• Transfer learning from ResNet-50</li>
                <li>• Data augmentation for robustness</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Backend Technology</h3>
              <ul className="space-y-2 text-slate-500">
                <li>• Python with TensorFlow/Keras</li>
                <li>• Flask REST API</li>
                <li>• PostgreSQL database</li>
                <li>• OpenCV for image preprocessing</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Research Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Our Research Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 overflow-hidden">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-blue-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;