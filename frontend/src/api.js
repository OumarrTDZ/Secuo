import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Point automatically to backend
  headers: {
    'Content-Type': 'application/json', // default headers
  },
});

export default api;