import axios from 'axios'
import { env } from './utils/env'

const api = axios.create({
  baseURL: env.VITE_SHINSEI_MANAGER_URL,
})

export default api
