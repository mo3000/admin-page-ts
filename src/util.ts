import axios from 'axios';

export const http = axios.create({
  baseURL: 'http://localhost:8000/admin',
  timeout: 10000,
});

