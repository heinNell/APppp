import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { FirebaseProvider } from './contexts/FirebaseContext'
import { AuthProvider } from './components/auth/AuthProvider'
import App from './App.tsx'

// Import Google Fonts using link element instead of CSS @import
document.head.insertAdjacentHTML(
  'beforeend',
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
)

// Import Leaflet CSS files directly in the main file
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Import our main CSS file
import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirebaseProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </FirebaseProvider>
  </StrictMode>
);
