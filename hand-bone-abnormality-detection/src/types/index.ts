// Core TypeScript types for the entire application
// Following industry best practices with strict typing

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // In production, only hash is stored
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isVerified: boolean;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
  userId: string;
}

export interface MLPerformanceMetrics {
  accuracy: number;      // Overall accuracy (0-100)
  precision: number;     // Positive predictive value (0-100)
  recall: number;        // Sensitivity / True Positive Rate (0-100)
  specificity: number;   // True Negative Rate (0-100)
  f1Score: number;       // Harmonic mean of precision and recall (0-100)
  rocAuc: number;        // ROC-AUC score (0-1)
  auc: number;           // Area Under Curve (0-1)
  npv: number;           // Negative Predictive Value (0-100)
}

export interface ScanResult {
  id: string;
  userId: string;
  fileName: string;
  originalImageUrl: string;
  processedImageUrl: string;
  heatmapUrl: string;
  classification: Classification;
  confidence: number;
  boundingBoxes: BoundingBox[];
  findings: Finding[];
  recommendations: string[];
  analysisTime: number; // in milliseconds
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: ScanMetadata;
  performanceMetrics: MLPerformanceMetrics;
  // Human-friendly interpretation for display
  displayLabel?: string;
  interpretation?: string;
}

export type Classification = 
  | 'normal' 
  | 'fracture' 
  | 'degenerative' 
  | 'deformity';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface Finding {
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ScanMetadata {
  width: number;
  height: number;
  fileSize: number;
  format: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  notes?: string;
  qualityCheck?: {
    passed: boolean;
    score: number;
  };
}

export interface AnalyticsData {
  totalScans: number;
  scansByClassification: Record<Classification, number>;
  scansByDate: { date: string; count: number }[];
  averageConfidence: number;
  averageProcessingTime: number;
  recentActivity: ScanResult[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
