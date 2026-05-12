# Deployment Guide

This guide will help you deploy your anonymous question submission system as a public website.

## Option 1: GitHub Pages (Recommended - Free)

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Repository name: `anonymous-question-system`
4. Description: `Anonymous question submission system with fingerprinting and Supabase integration`
5. Select "Public"
6. **Do not** check "Add a README file" (we already have one)
7. Click "Create repository"

### Step 2: Push Your Code
After creating the repository, GitHub will show you these commands. Run them in your terminal:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote set-url origin https://github.com/YOUR_USERNAME/anonymous-question-system.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. In your GitHub repository, go to **Settings**
2. Scroll down to "Pages" in the left menu
3. Under "Build and deployment", set **Source** to "Deploy from a branch"
4. Set **Branch** to "main" and folder to "/ (root)"
5. Click "Save"
6. Wait 2-5 minutes for deployment

### Step 4: Access Your Website
Your website will be available at: `https://YOUR_USERNAME.github.io/anonymous-question-system/`

---

## Option 2: Netlify (Alternative - Free)

### Step 1: Sign Up
1. Go to [netlify.com](https://netlify.com) and sign up with GitHub

### Step 2: Deploy
1. Click "New site from Git"
2. Choose "GitHub"
3. Select your `anonymous-question-system` repository
4. Build settings:
   - Build command: leave blank
   - Publish directory: leave blank
5. Click "Deploy site"

### Step 3: Custom Domain (Optional)
Your site will be available at: `https://random-name-123456.netlify.app`

---

## Option 3: Vercel (Alternative - Free)

### Step 1: Sign Up
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub

### Step 2: Import Project
1. Click "New Project"
2. Select your `anonymous-question-system` repository
3. Framework Preset: "Other"
4. Click "Deploy"

### Step 3: Access Your Website
Your site will be available at: `https://anonymous-question-system-.vercel.app`

---

## Environment Configuration

The application is already configured for production with:
- Supabase credentials embedded in the code
- Discord webhook configured
- CDN loading for Supabase library

No additional environment setup is required for basic deployment.

---

## Testing Your Deployment

After deployment, test these features:
1. ✅ Page loads without errors
2. ✅ Fingerprint generation works (check browser console)
3. ✅ Question submission works
4. ✅ Discord notifications arrive
5. ✅ Database entries are created in Supabase

---

## Security Considerations

### For Production Use:
1. **Supabase Security**: Enable Row Level Security (RLS) in your Supabase project
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Domain**: Use a custom domain for professional appearance
4. **HTTPS**: All recommended platforms provide HTTPS automatically

### Supabase RLS Example:
```sql
-- Enable RLS on tables
ALTER TABLE fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert data
CREATE POLICY "Allow anonymous insert" ON fingerprints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON questions FOR INSERT WITH CHECK (true);

-- Allow read access (if needed)
CREATE POLICY "Allow read access" ON fingerprints FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON questions FOR SELECT USING (true);
```

---

## Custom Domain Setup

### GitHub Pages:
1. In repository Settings → Pages
2. Under "Custom domain", add your domain
3. Configure DNS with provided records

### Netlify/Vercel:
1. Go to Domain settings in your dashboard
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Monitoring and Analytics

### GitHub Pages:
- Basic traffic stats available in repository insights

### Netlify/Vercel:
- Detailed analytics and performance monitoring
- Form submissions tracking
- Error logging

---

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure Supabase allows your domain
2. **404 Errors**: Check file paths and base URL
3. **Supabase Connection**: Verify API keys and URL
4. **Discord Webhook**: Check webhook URL and permissions

### Debug Steps:
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Monitor Network tab for failed requests
4. Verify Supabase dashboard for incoming data

---

## Performance Optimization

The site is already optimized with:
- Minimal dependencies
- Efficient fingerprinting
- CDN-loaded libraries
- Responsive design
- Modern CSS animations

For further optimization:
- Enable gzip compression (handled by hosting platforms)
- Use CDN for static assets (automatic on most platforms)
- Implement caching headers (handled by hosting platforms)

---

## Backup and Recovery

Your data is stored in:
- **Supabase**: Automatic backups available
- **GitHub**: Version control for code
- **Discord**: Question notifications as backup

Regular backups recommended:
- Export Supabase data weekly
- Monitor Discord for missed notifications
- Keep GitHub repository updated
