import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, Download, Share2, ArrowLeft, Brain, Clock, Target, FileText, Trash2, ZoomIn, X, BarChart } from 'lucide-react';
import { scanService } from '../services/scanService';
import { pdfService } from '../services/pdfService';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/appStore';
import { toast } from 'react-hot-toast';
import type { ScanResult } from '../types';

// Metric Card Component for displaying ML performance metrics
interface MetricCardProps {
  label: string;
  value: number;
  maxValue: number;
  displayValue: string;
  color: 'blue' | 'teal' | 'purple' | 'green';
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, maxValue, displayValue, color, icon }) => {
  const numericValue = value ?? 0;
  const percentage = (numericValue / maxValue) * 100;
  const colorMap = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' },
    teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', bar: 'bg-teal-500' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', bar: 'bg-purple-500' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', bar: 'bg-green-500' },
  };
  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} rounded-xl p-3 border border-white/50 dark:border-slate-700/50`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
          {label}
        </span>
      </div>
      <div className={`text-2xl font-bold ${colors.text} mb-1.5`}>{displayValue}</div>
      <div className="w-full h-1.5 bg-white/60 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors.bar} rounded-full transition-all duration-1000`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};

const formatMetric = (value: number | null | undefined, digits = 1): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }
  return value.toFixed(digits);
};

const formatPercentMetric = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1)}%`;
};

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeView, setActiveView] = useState<'original' | 'processed' | 'heatmap'>('original');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);
  
  const { user } = useAuth();
  const { deleteScan, addNotification } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const found = scanService.getScanById(id);
      setScan(found);
      setIsLoading(false);
    }
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!scan) return;
    setIsGeneratingPdf(true);
    try {
      await pdfService.generateReport(scan, user);
      toast.success('Report downloaded successfully');
      addNotification({
        type: 'success',
        title: 'Report Generated',
        message: `Medical report for ${scan.fileName} has been downloaded.`,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    if (!scan) return;
    const shareData = {
      title: 'HBA Analysis Result',
      text: `Classification: ${scan.classification} (${scan.confidence.toFixed(1)}% confidence)`,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch {
      toast.error('Failed to share');
    }
  };

  const handleDelete = () => {
    if (!scan) return;
    if (window.confirm('Are you sure you want to delete this scan? This action cannot be undone.')) {
      deleteScan(scan.id);
      toast.success('Scan deleted');
      navigate('/history');
    }
  };

  const classificationColors: Record<string, string> = {
    normal: 'from-green-500 to-emerald-500',
    fracture: 'from-red-500 to-orange-500',
    degenerative: 'from-yellow-500 to-amber-500',
    deformity: 'from-purple-500 to-pink-500',
  };

  const classificationBgColors: Record<string, string> = {
    normal: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    fracture: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    degenerative: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    deformity: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };

  const severityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Scan Not Found</h2>
          <p className="text-slate-500 mb-6">The requested scan could not be found.</p>
          <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link to={user ? '/history' : '/'} className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to History</span>
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Analysis Results</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Scan ID: <span className="font-mono text-xs">{scan.id}</span> • {new Date(scan.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-2 text-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-lg transition-all flex items-center space-x-2 text-sm disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF Report'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Interpretation Banner */}
        <div className="mb-6">
          <div className={`rounded-xl p-4 border ${scan.classification ? classificationBgColors[scan.classification] : 'bg-slate-50 dark:bg-slate-800'} shadow-sm`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{scan.displayLabel || scan.classification}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{scan.interpretation}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Confidence</div>
                <div className="text-xl font-bold">{scan.confidence.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Viewer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              {/* View Switcher */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Radiological Images</h3>
                <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                  {[
                    { key: 'original', label: 'Original' },
                    { key: 'processed', label: 'Localized' },
                    { key: 'heatmap', label: 'Heatmap' },
                  ].map((view) => (
                    <button
                      key={view.key}
                      onClick={() => setActiveView(view.key as any)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        activeView === view.key
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Display */}
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden group">
                <img
                  src={
                    activeView === 'original' ? scan.originalImageUrl :
                    activeView === 'processed' ? scan.processedImageUrl :
                    scan.heatmapUrl
                  }
                  alt={activeView}
                  className="w-full h-full object-contain"
                />
                {scan.boundingBoxes.length > 0 && activeView !== 'original' && (
                  <div className="absolute inset-0 pointer-events-none">
                    {scan.boundingBoxes.map((box, index) => (
                      <div
                        key={index}
                        className={`absolute border-2 rounded-md transition-all ${
                          selectedBoxIndex === index ? 'border-red-400 bg-red-400/10' : 'border-yellow-300/80'
                        }`}
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.width}%`,
                          height: `${box.height}%`,
                        }}
                      />
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setZoomedImage(
                    activeView === 'original' ? scan.originalImageUrl :
                    activeView === 'processed' ? scan.processedImageUrl :
                    scan.heatmapUrl
                  )}
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium">
                  {activeView === 'original' && 'Original X-Ray'}
                  {activeView === 'processed' && 'AI-Localized Findings'}
                  {activeView === 'heatmap' && 'Grad-CAM Heatmap'}
                </div>
              </div>
            </motion.div>

            {/* Findings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Clinical Findings</span>
              </h3>
              <div className="space-y-3">
                {scan.findings.map((finding, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedBoxIndex(i)}
                    onMouseEnter={() => setSelectedBoxIndex(i)}
                    onMouseLeave={() => setSelectedBoxIndex(null)}
                    className={`w-full text-left border rounded-xl p-4 transition-colors ${
                      selectedBoxIndex === i ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{finding.type}</h4>
                        <p className="text-sm text-slate-500">{finding.location}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[finding.severity]}`}>
                        {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)} Severity
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{finding.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Recommendations</span>
              </h3>
              <ul className="space-y-2">
                {scan.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300 pt-0.5">{rec}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Classification Result */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`rounded-2xl p-6 shadow-lg border ${classificationBgColors[scan.classification]}`}
            >
              <h3 className="font-semibold mb-4">Classification Result</h3>
              <div className="text-center py-4">
                <div className={`w-20 h-20 bg-gradient-to-br ${classificationColors[scan.classification]} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                  {scan.classification === 'normal' ? (
                    <Shield className="w-10 h-10 text-white" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                <h4 className="text-2xl font-bold mb-1 capitalize">{scan.classification}</h4>
                <p className="text-slate-500 text-sm mb-4">Primary Classification</p>
                
                {/* Confidence Circle */}
                <div className="relative w-24 h-24 mx-auto mb-2">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-200 dark:text-slate-700" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(scan.confidence / 100) * 251.2} 251.2`}
                      className="text-blue-600 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{scan.confidence.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Confidence Score</p>
              </div>
            </motion.div>

            {/* ML Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800"
            >
              <h3 className="font-semibold mb-1 flex items-center space-x-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                <span>Model Performance Metrics</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Validated diagnostic accuracy</p>
              
              {/* Primary Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* ROC-AUC */}
                <MetricCard
                  label="ROC-AUC"
                  value={scan.performanceMetrics.rocAuc}
                  maxValue={1}
                  displayValue={formatMetric(scan.performanceMetrics.rocAuc, 3)}
                  color="blue"
                  icon="📊"
                />
                {/* AUC */}
                <MetricCard
                  label="AUC"
                  value={scan.performanceMetrics.auc}
                  maxValue={1}
                  displayValue={formatMetric(scan.performanceMetrics.auc, 3)}
                  color="teal"
                  icon="📈"
                />
                {/* Precision */}
                <MetricCard
                  label="Precision"
                  value={scan.performanceMetrics.precision}
                  maxValue={100}
                  displayValue={formatPercentMetric(scan.performanceMetrics.precision)}
                  color="purple"
                  icon="🎯"
                />
                {/* Accuracy */}
                <MetricCard
                  label="Accuracy"
                  value={scan.performanceMetrics.accuracy}
                  maxValue={100}
                  displayValue={formatPercentMetric(scan.performanceMetrics.accuracy)}
                  color="green"
                  icon="✓"
                />
              </div>
              
              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5">
                  <div className="text-slate-500 dark:text-slate-400 mb-0.5">Recall (Sensitivity)</div>
                  <div className="font-bold text-slate-900 dark:text-white">{formatPercentMetric(scan.performanceMetrics.recall)}</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5">
                  <div className="text-slate-500 dark:text-slate-400 mb-0.5">Specificity</div>
                  <div className="font-bold text-slate-900 dark:text-white">{formatPercentMetric(scan.performanceMetrics.specificity)}</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5">
                  <div className="text-slate-500 dark:text-slate-400 mb-0.5">F1 Score</div>
                  <div className="font-bold text-slate-900 dark:text-white">{formatPercentMetric(scan.performanceMetrics.f1Score)}</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5">
                  <div className="text-slate-500 dark:text-slate-400 mb-0.5">NPV</div>
                  <div className="font-bold text-slate-900 dark:text-white">{formatPercentMetric(scan.performanceMetrics.npv)}</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <h3 className="font-semibold mb-4">Analysis Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Processing Time</span>
                  </span>
                  <span className="font-medium text-sm">{(scan.analysisTime / 1000).toFixed(2)}s</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500 flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>AI Model</span>
                  </span>
                  <span className="font-medium text-sm">ResNet-50 + Grad-CAM</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500">Image Size</span>
                  <span className="font-medium text-sm">{scan.metadata.width}×{scan.metadata.height}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500">File Size</span>
                  <span className="font-medium text-sm">{(scan.metadata.fileSize / 1024).toFixed(2)} KB</span>
                </div>
                {scan.metadata.patientAge && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-sm text-slate-500">Patient Age</span>
                    <span className="font-medium text-sm">{scan.metadata.patientAge} years</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-500">Findings</span>
                  <span className="font-medium text-sm">{scan.findings.length} detected</span>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
                <button
                  onClick={handleShare}
                  className="w-full border border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Results</span>
                </button>
                <Link
                  to="/upload"
                  className="w-full border border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>New Analysis</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="w-full text-red-600 border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Scan</span>
                </button>
              </div>
            </motion.div>

            {/* Medical Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Disclaimer:</strong> This AI analysis is for clinical decision support only. Final diagnosis must be confirmed by a qualified radiologist.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Zoom Modal */}
        {zoomedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full text-slate-900 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
