# Deploying to Hostinger

This application is a full-stack React app with a Node.js (Express) backend and SQLite database. Here is how to deploy it to Hostinger.

## Prerequisites
You need a Hostinger plan that supports **Node.js** (e.g., VPS hosting, or advanced shared hosting with Node.js App support via hPanel/cPanel).

## Deployment Steps

1. **Build the Application**
   Run the following command to build the frontend and backend:
   ```bash
   npm run build
   ```
   This will compile everything into the `dist/` folder, including `dist/server.cjs` (your backend server).

2. **Prepare Files for Upload**
   Create a zip file of your project. 
   - **Include**: `dist/`, `package.json`, `package-lock.json`, `.env` (create this if you have API keys), and `appdata.db` (if you want to keep existing data).
   - **Do NOT include**: `node_modules/` or `src/` (to save space).

3. **Upload to Hostinger**
   - Open your Hostinger **File Manager**.
   - Navigate to the domain folder (e.g., `public_html`).
   - Upload and extract the zip file there.

4. **Setup Node.js App in hPanel**
   - In your Hostinger dashboard, search for **Node.js**.
   - Click **Create Application**.
   - **Node.js version**: Select `18.x` or `20.x`.
   - **Application mode**: `Production`
   - **Application root**: The folder where you uploaded the files (e.g., `public_html`).
   - **Application startup file**: Type `dist/server.cjs` or `server.js` or `dist/server.js` (All three entry points are now auto-supported!)
   - Click **Create**.

5. **Install Dependencies**
   - Once the app is created in Hostinger, click the **NPM Install** button in the Node.js App dashboard. This will install all required packages.

6. **Environment Variables**
   - If you are using Razorpay or Gemini AI, add your API keys to the **Environment variables** section in the Hostinger Node.js dashboard, or upload a `.env` file containing:
     ```env
     GEMINI_API_KEY=your_key_here
     RAZORPAY_KEY_ID=your_razorpay_id
     RAZORPAY_KEY_SECRET=your_razorpay_secret
     ```

7. **Port Configuration**
   The server automatically detects `process.env.PORT || 3000`, so Hostinger/Phusion Passenger will bind to the assigned port seamlessly without any code edits required!

8. **Start the App**
   Click **Start** or **Restart** in the Hostinger Node.js dashboard. Your app should now be live!

---

### Alternative: Frontend-Only Deployment (Static Hosting)
If your Hostinger plan does NOT support Node.js (e.g., basic shared hosting):
1. Run `npm run build`.
2. Upload *only* the contents of the `dist/` folder (the `index.html`, `assets/`, etc.) to your `public_html`.
3. Create an `.htaccess` file in `public_html` with the following rules to support React Router:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
*Warning: In static hosting mode, backend features like Cloud Sync, Razorpay Order creation, and AI Assistant will not function.*
