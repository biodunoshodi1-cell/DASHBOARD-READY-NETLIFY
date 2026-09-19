import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Only needed if the API server is hosted on a different domain than this
// frontend. When using the recommended Netlify /api/* proxy (see
// DEPLOYMENT.md), leave VITE_API_URL unset and requests stay relative
// (same-origin), which is simpler and avoids cross-site cookie issues.
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById('root')!).render(<App />);
