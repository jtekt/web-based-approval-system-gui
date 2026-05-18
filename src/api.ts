import axios from 'axios'
import { env } from './utils/env'

const api = axios.create({
  baseURL: env.VITE_SHINSEI_MANAGER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
