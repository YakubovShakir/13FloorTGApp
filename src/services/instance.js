import axios from "axios";

// Create the Axios instance
export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'ngrok-skip-browser-warning': true },
});

// Function to get Telegram initData (assuming Telegram Web App context)
const getTelegramInitData = () => {
  if (window.Telegram && window.Telegram.WebApp) {
    const webApp = window.Telegram.WebApp;
    webApp.ready(); // Ensure Web App is initialized
    const initData = webApp.initData; // Telegram provides this as a query string
    return initData || ''; // Return empty string if not available
  }
  console.warn('Telegram WebApp not available');
  return ''; // Fallback for non-Telegram environments
};

// Add a request interceptor to include Authorization header
instance.interceptors.request.use(
  (config) => {
    const initData = getTelegramInitData();
    if (initData) {
      config.headers['Authorization'] = `Bearer ${initData}`;
    } else {
      console.warn('No initData available for request:', config.url);
      // Optionally throw an error or handle missing initData
      // throw new axios.Cancel('Missing Telegram initData');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);