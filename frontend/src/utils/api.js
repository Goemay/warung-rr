import axios from 'axios'

// Use explicit IPv4 loopback to avoid localhost resolving to IPv6 (::1) on some systems
const base = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api'

const instance = axios.create({
  baseURL: base,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default instance
