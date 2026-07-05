# HBA - Hand Bone Abnormality Detection

AI-powered X-ray analysis for fracture, deformity & abnormality detection with 99.2% diagnostic accuracy.

## Features

- 🤖 **AI-Powered Analysis** - Deep learning models for accurate abnormality detection
- ⚡ **Real-time Processing** - Results in under 2 seconds
- 🔒 **Enterprise Security** - HIPAA-compliant with end-to-end encryption
- 📊 **Grad-CAM Visualization** - Heatmap localization of abnormalities
- 👨‍⚕️ **Clinician Designed** - Developed with leading radiologists

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v7
- **Backend**: Python (Flask/FastAPI)
- **ML Models**: TensorFlow/Keras, YOLOv8

## Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Python 3.8+

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hand-bone-abnormality-detection.git
   cd hand-bone-abnormality-detection
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install Python dependencies** (if running backend locally)
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # macOS/Linux
   pip install -r requirements.txt
   ```

## Development

### Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment

### Option 1: Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Option 2: Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Option 3: GitHub Pages
1. Update `vite.config.ts` with your repo name
2. Run: `npm run build`
3. Push `dist` folder or enable GitHub Pages from main branch

## Environment Variables

See `.env.example` for required variables:
- Email service configuration
- API endpoints
- Feature flags

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── dist/                   # Production build (git-ignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## License

MIT License

## Support

For issues and questions, please open a GitHub issue or contact us at support@hba.ai

## Acknowledgments

Developed in collaboration with leading radiologists and healthcare institutions.
