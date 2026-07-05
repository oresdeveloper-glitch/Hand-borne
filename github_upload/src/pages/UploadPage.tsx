import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/appStore';
import { scanService, BACKEND_URL } from '../services/scanService';
import { toast } from 'react-hot-toast';

import { motion } from 'framer-motion';
import { Upload, X, Brain, Loader2, LogIn, User, FileImage, AlertCircle, Camera } from 'lucide-react';

const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'upload' | 'metadata' | 'processing'>('upload');
  
  const { user } = useAuth();
  const { addScan, addNotification } = useAppStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, or WebP images.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return false;
    }
    return true;
  };

  const validateWithBackend = async (file: File): Promise<boolean> => {
    setIsValidating(true);
    setValidationError('');

    try {
      const form = new FormData();
      form.append('file', file, file.name);

      const resp = await fetch(`${BACKEND_URL}/validate`, {
        method: 'POST',
        body: form,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const msg = err?.reason || err?.error || 'Image validation failed.';
        toast.error(msg);
        setValidationError(msg);
        return false;
      }

      const data = await resp.json();
      if (!data.ok) {
        const msg = data.reason || 'Image validation failed.';
        toast.error(msg);
        setValidationError(msg);
        return false;
      }

      return true;
    } catch (e: any) {
      console.warn('Backend unavailable for validation, skipping.', e);
      return true;
    } finally {
      setIsValidating(false);
    }
  };


  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (!file || !validateFile(file)) return;

    const ok = await validateWithBackend(file);
    if (!ok) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    const ok = await validateWithBackend(file);
    if (!ok) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setValidationError('');
    setStep('upload');
  };

  const proceedToMetadata = () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    setStep('metadata');
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const userId = user?.id || `guest_${Date.now()}`;
    setIsProcessing(true);
    setStep('processing');

    try {
      const stages = [
        'Checking image quality...',
        'Enhancing image with CLAHE...',
        'Running CNN inference...',
        'Generating Grad-CAM heatmap...',
        'Detecting bounding boxes...',
        'Finalizing analysis...',
      ];

      for (let i = 0; i < stages.length; i++) {
        setProcessingStage(stages[i]);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const scanResult = await scanService.analyzeImage({
        userId,
        file: selectedFile,
        patientAge: patientAge ? parseInt(patientAge) : undefined,
        patientGender: patientGender || undefined,
        notes: notes || undefined,
      });

      addScan(scanResult);
      addNotification({
        type: scanResult.classification === 'normal' && scanResult.confidence >= 90 ? 'success' : 'warning',
        title: 'Analysis Complete',
        message: `Scan ${scanResult.fileName}: ${scanResult.displayLabel} (${scanResult.confidence.toFixed(1)}% confidence).`,
      });

      toast.success('Analysis complete! Viewing results...');
      navigate(`/results/${scanResult.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Analysis failed. Please try again.');
      setStep('metadata');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Link to={user ? '/dashboard' : '/'} className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
            ← Back to {user ? 'Dashboard' : 'Home'}
          </Link>
          <h1 className="text-4xl font-bold mb-2">Upload X-Ray Image</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Upload a hand X-ray image for AI-powered analysis
          </p>
          <div className="mt-3 inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-medium mr-2">Backend URL:</span>
            <code className="font-mono">{BACKEND_URL}</code>
          </div>
        </motion.div>

        {/* Guest Banner */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Guest Mode Active</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Your scans will be saved locally. Sign in for full features.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[
              { key: 'upload', label: 'Upload', num: 1 },
              { key: 'metadata', label: 'Patient Info', num: 2 },
              { key: 'processing', label: 'Analysis', num: 3 },
            ].map((stage, i) => (
              <React.Fragment key={stage.key}>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step === stage.key
                      ? 'bg-blue-600 text-white'
                      : ['upload', 'metadata', 'processing'].indexOf(step) > i
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {stage.num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${
                    step === stage.key ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {stage.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                    ['upload', 'metadata', 'processing'].indexOf(step) > i
                      ? 'bg-green-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mx-auto">
                    <Upload className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Drop your X-ray image here</h3>
                    <p className="text-slate-500">or click to browse files</p>
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
                    <span className="flex items-center space-x-1">
                      <FileImage className="w-4 h-4" />
                      <span>JPG, PNG, WebP</span>
                    </span>
                    <span>•</span>
                    <span>Max 10MB</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Selected Image</h3>
                  <button
                    onClick={removeFile}
                    className="text-slate-500 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type.split('/')[1].toUpperCase()}
                    </p>
                    {validationError && (
                      <p className="text-xs text-red-600 mt-2">{validationError}</p>
                    )}
                  </div>

                  <button
                    onClick={proceedToMetadata}
                    disabled={isValidating || !!validationError}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? 'Validating...' : 'Continue'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Metadata */}
        {step === 'metadata' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg mb-6">Patient Information (Optional)</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Patient Age
                    </label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      min="0"
                      max="120"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900"
                      placeholder="e.g., 45"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Gender
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Clinical Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 resize-none"
                    placeholder="Any relevant clinical information..."
                  />
                </div>

                <div className="flex items-start space-x-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Privacy Notice</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Patient data is processed locally and never leaves your device. We follow HIPAA-compliant practices.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep('upload')}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Start AI Analysis</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <Camera className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm truncate">{selectedFile?.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedFile && `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="max-w-md mx-auto text-center">
              {/* Animated Brain */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Brain className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">Analyzing X-Ray</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">{processingStage || 'Initializing...'}</p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-teal-600"
                  initial={{ width: '0%' }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                ></motion.div>
              </div>

              <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>This may take a few seconds...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Info Panel */}
        {step === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">HBA AI Detection Pipeline</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Step 1: Quality check (hand X-ray verification)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Step 2: Fracture detection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span>Step 3: Degenerative change detection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Step 4: Deformity & abnormality detection</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
