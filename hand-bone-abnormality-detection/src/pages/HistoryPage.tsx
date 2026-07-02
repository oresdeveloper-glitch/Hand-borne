import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Trash2, FileText, Filter, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { scanService } from '../services/scanService';
import { toast } from 'react-hot-toast';
import type { ScanResult, Classification } from '../types';

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [filteredScans, setFilteredScans] = useState<ScanResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<Classification | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScans = async () => {
      try {
        if (user) {
          const userScans = scanService.getScansByUser(user.id);
          setScans(userScans);
          setFilteredScans(userScans);
        }
      } catch (error) {
        console.error('Failed to load scans:', error);
        toast.error('Failed to load scan history');
      } finally {
        setIsLoading(false);
      }
    };
    loadScans();
  }, [user]);

  useEffect(() => {
    let filtered = scans;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (scan) =>
          scan.fileName.toLowerCase().includes(query) ||
          scan.classification.toLowerCase().includes(query) ||
          scan.findings.some((f) => f.type.toLowerCase().includes(query))
      );
    }

    // Apply classification filter
    if (classificationFilter !== 'all') {
      filtered = filtered.filter((scan) => scan.classification === classificationFilter);
    }

    setFilteredScans(filtered);
  }, [searchQuery, classificationFilter, scans]);

  const handleDelete = (scanId: string) => {
    if (window.confirm('Are you sure you want to delete this scan? This action cannot be undone.')) {
      try {
        scanService.deleteScan(scanId);
        setScans(scans.filter((s) => s.id !== scanId));
        toast.success('Scan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete scan');
      }
    }
  };

  const getClassColor = (classification: string) => {
    switch (classification) {
      case 'normal':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'fracture':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'degenerative':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'deformity':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    }
  };

  const stats = {
    total: scans.length,
    normal: scans.filter((s) => s.classification === 'normal').length,
    abnormal: scans.filter((s) => s.classification !== 'normal').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">Scan History</h1>
          <p className="text-slate-600 dark:text-slate-400">View and manage your past X-ray analysis results</p>
        </motion.div>

        {/* Stats Bar */}
        {scans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-6"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Total Scans</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.normal}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Normal</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.abnormal}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Abnormal</div>
            </div>
          </motion.div>
        )}

        {/* Search & Filters */}
        {scans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by filename or classification..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value as Classification | 'all')}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="all">All Classifications</option>
                  <option value="normal">Normal</option>
                  <option value="fracture">Fracture</option>
                  <option value="degenerative">Degenerative</option>
                  <option value="deformity">Deformity</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scans List */}
        {filteredScans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
              {scans.length === 0 ? 'No scans yet' : 'No matching scans'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {scans.length === 0
                ? 'Upload your first X-ray to get started'
                : 'Try adjusting your search or filters'}
            </p>
            {scans.length === 0 && (
              <Link
                to="/upload"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <span>Upload First Scan</span>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScans.map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link to={`/results/${scan.id}`} className="block group">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:-translate-y-1">
                    {/* Image Preview */}
                    <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                      <img
                        src={scan.processedImageUrl || scan.originalImageUrl}
                        alt={scan.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${getClassColor(
                            scan.classification
                          )}`}
                        >
                          {scan.classification}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(scan.id);
                        }}
                        className="absolute top-3 left-3 p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-600 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Delete scan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">
                        {scan.fileName}
                      </h3>
                      <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Confidence</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {scan.confidence.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                          View →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
