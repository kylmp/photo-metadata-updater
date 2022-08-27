import axios from 'axios'

var config = {
  timeout: 30000,
  baseURL: import.meta.env.VITE_BASE_URL || ''
};

export const axiosConfig = axios.create(config);
