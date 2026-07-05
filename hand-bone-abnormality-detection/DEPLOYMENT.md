# Automatic Deployment Guide

Your project is now configured for automatic deployment! Choose one of the options below:

---

## Option 1: GitHub Pages (Free, Automatic) ✅ RECOMMENDED

**Best for:** Public projects with no backend requirements

### Setup:
1. Push code to GitHub
2. Go to Settings → Pages
3. Set "Source" to "GitHub Actions"
4. Done! Automatic deployment on every push to `main`

**Deployment URL:** `https://yourusername.github.io/repository-name`

**Workflow file:** `.github/workflows/deploy.yml`

---

## Option 2: Vercel (Free, Easiest) 🚀

**Best for:** Projects wanting simple, fast deployment

### Setup:
1. Sign up at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Set environment variables in Vercel dashboard
4. Deploy! (Auto-deploys on push)

**Deployment URL:** Auto-generated (e.g., `hba-detection.vercel.app`)

**Alternative - Using GitHub Actions:**

1. Get your Vercel credentials:
   ```bash
   vercel login
   vercel link  # Follow prompts to create project
   ```

2. Add GitHub Secrets:
   - Go to Settings → Secrets and variables → Actions
   - Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

3. Workflow file: `.github/workflows/vercel-deploy.yml`

---

## Option 3: Netlify (Free, Easy) 📡

**Best for:** Smooth deployment with great features

### Setup:
1. Sign up at [netlify.com](https://netlify.com)
2. Connect your GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy! (Auto-deploys on push)

**Deployment URL:** Auto-generated (e.g., `hba-detection.netlify.app`)

**Configuration file:** `netlify.toml` (already created)

---

## Comparing Deployment Options

| Feature | GitHub Pages | Vercel | Netlify |
|---------|-------------|--------|---------|
| **Cost** | Free | Free | Free |
| **Setup Time** | 2 min | 3 min | 3 min |
| **Auto-Deploy** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Serverless Functions** | ❌ No | ✅ Yes | ✅ Yes |
| **Analytics** | ❌ No | ✅ Yes | ✅ Yes |
| **Environment Vars** | GitHub Secrets | Vercel Dashboard | Netlify Dashboard |
| **Custom Domain** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Environment Variables

### For GitHub Pages:
Use GitHub Secrets for sensitive data:
1. Settings → Secrets and variables → Actions
2. Add secrets (e.g., `VITE_API_URL`)
3. Reference in workflow: `${{ secrets.YOUR_SECRET }}`

### For Vercel/Netlify:
Set environment variables directly in their dashboards:
- Vercel: Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment

**Note:** Variables must start with `VITE_` to be accessible in React client

---

## Testing Deployment Locally

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

---

## Troubleshooting

### Build fails on CI/CD:
- Check build logs in GitHub Actions / Vercel / Netlify dashboard
- Ensure all dependencies are in `package.json`
- Test locally: `npm run build`

### Routes not working:
- Check `vite.config.ts` for correct alias config
- Ensure `netlify.toml` has redirect rules
- SPA rewrites may be needed

### Environment variables not loading:
- Must start with `VITE_` prefix
- Add to deployment platform dashboard
- Restart deployment

---

## Quick Start Commands

```bash
# 1. Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repo and push
git remote add origin https://github.com/yourusername/hand-bone-abnormality-detection.git
git branch -M main
git push -u origin main

# 3. GitHub Pages: Enable in repo Settings → Pages

# 4. Vercel: Visit https://vercel.com/new and import GitHub repo

# 5. Netlify: Visit https://app.netlify.com and connect GitHub repo
```

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Choose deployment platform (GitHub Pages recommended)
3. ✅ Configure environment variables
4. ✅ Test deployment
5. ✅ Set custom domain (optional)

Happy deploying! 🚀
