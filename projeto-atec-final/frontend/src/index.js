import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google'; // P/ Login com Google
import 'bootstrap/dist/css/bootstrap.min.css';

//ID Google cloud
const CLIENT_ID = "397906887380-9ttt83tonfjenm6rl7vgfulgs2dqj99h.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GoogleOAuthProvider>
);