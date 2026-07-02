import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Upload, History, BarChart3, FileText, Activity, TrendingUp, Clock } from 'lucide-react';
import { scanService } from '../services/scanService';
import type { ScanResult, AnalyticsData } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          const data = scanService.getAnalytics(user.id);
          setAnalytics(data);
          setRecentScans(data.recentActivity);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const getClassColor = (classification: string) => {
    switch (classification) {
      case 'normal': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'fracture': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'degenerative': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'deformity': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalScans = analytics?.totalScans || 0;
  const abnormalities = (analytics?.scansByClassification.fracture || 0) +
    (analytics?.scansByClassification.degenerative || 0) +
    (analytics?.scansByClassification.deformity || 0);
  const avgConfidence = analytics?.averageConfidence || 0;
  const avgTime = analytics?.averageProcessingTime || 0;

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
            Medical Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back, <span className="font-semibold">{user?.name}</span>. Here's your activity overview.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={Upload}
            label="Total Scans"
            value={totalScans.toString()}
            color="blue"
            trend="+12%"
          />
          <StatCard
            icon={Activity}
            label="Abnormalities"
            value={abnormalities.toString()}
            color="red"
            trend={abnormalities > 0 ? 'Detected' : 'None'}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg. Confidence"
            value={`${avgConfidence.toFixed(1)}%`}
            color="green"
            trend="High"
          />
          <StatCard
            icon={Clock}
            label="Avg. Analysis Time"
            value={`${(avgTime / 1000).toFixed(1)}s`}
            color="purple"
            trend="Fast"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Link
            to="/upload"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-500/20 transition-all hover:-translate-y-0.5 text-white group"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-1">New Scan</h3>
            <p className="text-xs text-blue-100">Upload X-ray</p>
          </Link>

          <Link
            to="/history"
            className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 hover:shadow-xl hover:shadow-teal-500/20 transition-all hover:-translate-y-0.5 text-white group"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-1">History</h3>
            <p className="text-xs text-teal-100">View all scans</p>
          </Link>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white group cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all hover:-translate-y-0.5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-1">Analytics</h3>
            <p className="text-xs text-purple-100">View insights</p>
          </div>

          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-5 text-white group cursor-pointer hover:shadow-xl hover:shadow-slate-500/20 transition-all hover:-translate-y-0.5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-1">Reports</h3>
            <p className="text-xs text-slate-300">Generate PDF</p>
          </div>
        </motion.div>

        {/* Classification Breakdown */}
        {totalScans > 0 && analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-8"
          >
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Classification Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ClassBreakdown
                label="Normal"
                count={analytics.scansByClassification.normal}
                total={totalScans}
                color="green"
              />
              <ClassBreakdown
                label="Fracture"
                count={analytics.scansByClassification.fracture}
                total={totalScans}
                color="red"
              />
              <ClassBreakdown
                label="Degenerative"
                count={analytics.scansByClassification.degenerative}
                total={totalScans}
                color="yellow"
              />
              <ClassBreakdown
                label="Deformity"
                count={analytics.scansByClassification.deformity}
                total={totalScans}
                color="purple"
              />
            </div>
          </motion.div>
        )}

        {/* Recent Scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Scans</h2>
            {recentScans.length > 0 && (
              <Link to="/history" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all →
              </Link>
            )}
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-4">No scans yet</p>
              <Link
                to="/upload"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Your First Scan</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.slice(0, 5).map((scan) => (
                <Link
                  key={scan.id}
                  to={`/results/${scan.id}`}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-14 h-14 bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={scan.originalImageUrl} alt={scan.fileName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate text-slate-900 dark:text-white">{scan.fileName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {new Date(scan.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getClassColor(scan.classification)}`}>
                      {scan.classification}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {scan.confidence.toFixed(1)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'red' | 'green' | 'purple';
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, trend }) => {
  const colorMap = {
    blue: 'from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    red: 'from-red-500/10 to-red-500/5 dark:from-red-500/20 dark:to-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
    green: 'from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900',
    purple: 'from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-5 border`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-white/80 dark:bg-slate-800/80 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold opacity-75">{trend}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm opacity-75">{label}</div>
    </div>
  );
};

// Classification Breakdown Component
interface ClassBreakdownProps {
  label: string;
  count: number;
  total: number;
  color: 'green' | 'red' | 'yellow' | 'purple';
}

const ClassBreakdown: React.FC<ClassBreakdownProps> = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colorMap = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
      </div>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{percentage.toFixed(0)}%</div>
    </div>
  );
};

export default Dashboard;
