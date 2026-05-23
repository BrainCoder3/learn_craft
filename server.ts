/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import apiRoutes from './server/routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize and Seed Firestore in the background so it doesn't block server startup
  console.log('Bootstrapping database services with Google Firestore (async)...');
  db.init().then(() => {
    console.log('Database bootstrapping completed.');
  }).catch(err => {
    console.error('Database bootstrapping error occurred:', err);
  });

  // Middleware for body parsing
  app.use(express.json());

  // Mount server API routing layer
  app.use('/api', apiRoutes);

  // Dedicated HTML endpoint to clear browser session, cookies, and Firebase credentials
  app.get('/clear-session', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clearing Session...</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: #0b0f19;
            color: #f3f4f6;
            font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
          }
          .card {
            background: linear-gradient(145deg, #151c2e, #0e1424);
            border: 1px solid #1e293b;
            padding: 2.5rem;
            border-radius: 1.5rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 440px;
            width: 90%;
            animation: fadeIn 0.4s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .icon {
            font-size: 3rem;
            margin-bottom: 1.5rem;
            display: inline-block;
            animation: bounce 1.5s infinite ease-in-out;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.025em;
          }
          p {
            color: #94a3b8;
            font-size: 0.95rem;
            margin: 0 0 2rem 0;
          }
          .progress-bar-bg {
            background-color: #1e293b;
            border-radius: 9999px;
            height: 6px;
            width: 100%;
            overflow: hidden;
            margin-bottom: 1.5rem;
          }
          .progress-bar-fill {
            background: #58cc02;
            height: 100%;
            width: 0%;
            border-radius: 9999px;
            transition: width 0.2s ease-out;
          }
          .log {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #64748b;
            background-color: #0d111d;
            border-radius: 0.5rem;
            padding: 0.75rem;
            text-align: left;
            height: 90px;
            overflow-y: auto;
            border: 1px solid #1e293b;
          }
          .log-entry {
            margin: 0.25rem 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🧹</div>
          <h1>Session Reset Command</h1>
          <p>Wiping server cookies, local state registries, and Firebase profiles...</p>
          <div class="progress-bar-bg">
            <div id="progress" class="progress-bar-fill"></div>
          </div>
          <div id="logs" class="log">
            <div class="log-entry">Booting clean-up subroutines...</div>
          </div>
        </div>

        <script>
          const prg = document.getElementById('progress');
          const logs = document.getElementById('logs');

          function log(text) {
            const div = document.createElement('div');
            div.className = 'log-entry';
            div.innerText = '⚙️ ' + text;
            logs.appendChild(div);
            logs.scrollTop = logs.scrollHeight;
          }

          async function startWipe() {
            // STEP 1: Storage clear
            prg.style.width = '25%';
            await new Promise(r => setTimeout(r, 300));
            try {
              localStorage.clear();
              sessionStorage.clear();
              log('Client localStorage storage purged.');
              log('Client sessionStorage structure cleared.');
            } catch(e) {
              log('Cache clearing failure: ' + e.message);
            }

            // STEP 2: Wipe indexedDB
            prg.style.width = '55%';
            await new Promise(r => setTimeout(r, 300));
            const databases = ['firebaseLocalStorageDb', 'firebase-heartbeat-database'];
            for(const db of databases) {
              try {
                indexedDB.deleteDatabase(db);
                log('Deleted database context: ' + db);
              } catch(e) {}
            }

            // STEP 3: Cookie wipe
            prg.style.width = '80%';
            await new Promise(r => setTimeout(r, 350));
            try {
              const cookies = document.cookie.split(";");
              let cleared = 0;
              for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
                
                const domainParts = window.location.hostname.split('.');
                while (domainParts.length > 1) {
                  const parentDomain = domainParts.join('.');
                  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + parentDomain;
                  domainParts.shift();
                }
                cleared++;
              }
              log('Purged ' + cleared + ' cookie keys.');
            } catch(e) {
              log('Error clearing cookies: ' + e.message);
            }

            // STEP 4: Reset complete
            prg.style.width = '100%';
            log('Wipe complete. Gracefully returning home...');
            await new Promise(r => setTimeout(r, 700));
            window.location.href = '/';
          }

          window.addEventListener('load', startWipe);
        </script>
      </body>
      </html>
    `);
  });

  // Vite integration middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Running server in development mode using integrated Vite core...');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Running server in production mode serving static builds from /dist...');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('CRITICAL: Server boot error', err);
});
