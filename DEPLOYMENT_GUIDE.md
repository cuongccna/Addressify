# 🚀 ADDRESSIFY - DEPLOYMENT GUIDE
**Production Deployment for v2.0**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Code Quality Assurance
- [x] TypeScript strict mode enabled
- [x] ESLint configuration
- [x] All components properly typed
- [x] Error boundaries implemented
- [x] Loading states handled
- [x] Responsive design tested

### 🔧 Environment Setup Required
- [ ] Supabase project created
- [ ] Shipping API keys obtained:
  - [ ] GHN API key
  - [ ] GHTK API key
  - [ ] VTP API key
  <!-- J&T provider removed intentionally -->
- [ ] Domain purchased and configured
- [ ] SSL certificates ready

---

## 🌐 DEPLOYMENT OPTIONS

### Option 1: Vercel (Recommended)
**Best for**: Zero-config deployment with excellent Next.js support

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add GHN_API_KEY
vercel env add GHTK_API_KEY
vercel env add VTP_API_KEY
<!-- JNT key no longer required -->
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

**Pros:**
- Automatic deployments from GitHub
- Built-in Next.js optimization
- Global CDN
- Serverless functions support
- Free tier available

### Option 2: Netlify
**Best for**: Static site hosting with form handling

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build project
npm run build
npm run export

# Deploy
netlify deploy --prod --dir=out
```

### Option 3: AWS Amplify
**Best for**: AWS ecosystem integration

```bash
# Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Option 4: Docker + VPS
**Best for**: Full control and custom configurations

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## 🔒 ENVIRONMENT VARIABLES

### Production .env Configuration
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Shipping APIs
GHN_API_KEY=your_ghn_api_key
GHTK_API_KEY=your_ghtk_api_key
VTP_API_KEY=your_vtp_api_key
<!-- JNT key no longer required -->

# Application Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
SENTRY_DSN=your_sentry_dsn

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Security Best Practices
- Never commit API keys to version control
- Use different keys for development and production
- Rotate API keys regularly
- Monitor API usage and set up alerts

---

## 📊 MONITORING & ANALYTICS

### Error Tracking Setup
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure Sentry
# sentry.client.config.js
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### Performance Monitoring
```typescript
// utils/analytics.ts
export const trackEvent = (eventName: string, properties: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
}

// Usage
trackEvent('address_processed', {
  count: addresses.length,
  user_id: user.id
})
```

### Health Check Endpoint
```typescript
// pages/api/health.ts
export default function handler(req: Request, res: Response) {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    services: {
      database: 'connected',
      ghn_api: 'operational',
      ghtk_api: 'operational'
    }
  }
  
  res.status(200).json(healthCheck)
}
```

---

## 🚀 CI/CD PIPELINE

### GitHub Actions Setup
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Bundle Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            enforce: true,
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig
```

### Image Optimization
```bash
# Install next-optimized-images
npm install next-optimized-images

# Install optimization plugins
npm install imagemin-mozjpeg imagemin-pngquant
```

### Caching Strategy
```typescript
// utils/cache.ts
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const cacheShippingRates = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  }
}

export const getCachedShippingRates = (key: string) => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(key)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data
      }
    }
  }
  return null
}
```

---

## 🔐 SECURITY CONFIGURATION

### Content Security Policy
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com;
      style-src 'self' 'unsafe-inline' *.googleapis.com;
      img-src 'self' data: *.supabase.co;
      connect-src 'self' *.supabase.co *.ghn.vn *.ghtk.vn;
    `.replace(/\s{2,}/g, ' ').trim()
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### Rate Limiting
```typescript
// utils/rateLimiter.ts
import { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function rateLimit(identifier: string, limit: number = 10, window: number = 60000) {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier) || { count: 0, resetTime: now + window }
  
  if (now > userLimit.resetTime) {
    userLimit.count = 1
    userLimit.resetTime = now + window
  } else {
    userLimit.count += 1
  }
  
  rateLimitMap.set(identifier, userLimit)
  
  return {
    success: userLimit.count <= limit,
    remaining: Math.max(0, limit - userLimit.count),
    resetTime: userLimit.resetTime
  }
}
```

---

## 📱 MOBILE OPTIMIZATION

### PWA Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // other config
})
```

### Mobile Performance
```typescript
// components/LazyLoad.tsx
import { lazy, Suspense } from 'react'

const ShippingComparison = lazy(() => import('./ShippingComparison'))

export const LazyShippingComparison = (props: any) => (
  <Suspense fallback={<div>Loading...</div>}>
    <ShippingComparison {...props} />
  </Suspense>
)
```

---

## 🧪 TESTING IN PRODUCTION

### Smoke Tests
```bash
# Health check
curl https://yourdomain.com/api/health

# API endpoints
curl -X POST https://yourdomain.com/api/addresses/process \
  -H "Content-Type: application/json" \
  -d '{"addresses": ["123 Test St, HCM"]}'
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run loadtest.yml
```

```yaml
# loadtest.yml
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Address processing'
    requests:
      - post:
          url: '/api/addresses/process'
          json:
            addresses: ['123 Test Street, HCM']
```

---

## 📊 POST-DEPLOYMENT MONITORING

### Key Metrics to Track
- **Response Times**: < 2s for API calls
- **Error Rate**: < 1% for critical paths
- **User Engagement**: Time on site, conversion rates
- **API Usage**: Rate limit hits, quota usage

### Alerts Setup
```typescript
// utils/monitoring.ts
export const sendAlert = async (message: string, severity: 'info' | 'warning' | 'error') => {
  if (severity === 'error') {
    // Send to Slack, email, or monitoring service
    await fetch('webhook-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, severity })
    })
  }
}
```

---

## 🎯 GO-LIVE CHECKLIST

### Final Checks
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] API integrations tested
- [ ] SSL certificates active
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Backup systems in place
- [ ] DNS configured correctly

### Launch Day Tasks
1. **Deploy to production** ✅
2. **Run smoke tests** ✅
3. **Monitor error rates** ⏳
4. **Check performance metrics** ⏳
5. **Verify all integrations** ⏳
6. **Test user flows** ⏳
7. **Monitor API quotas** ⏳

### Post-Launch (Week 1)
- [ ] Daily performance reviews
- [ ] User feedback collection
- [ ] Bug prioritization and fixes
- [ ] API usage optimization
- [ ] SEO optimization

---

**Ready to deploy!** 🚀

*This deployment guide ensures a smooth, secure, and scalable launch of Addressify v2.0*