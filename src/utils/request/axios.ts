import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store'

const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL,
})


// const chatToken = typeof window !== 'undefined' && localStorage.getItem('knn3Token')

// if(chatToken){
 // service.defaults.headers.authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHg4MEM2NDNmQjA1MTU2QzA0OTNmMmIwQWY0RDdiYjcwQzA1OTQ2Rjg1IiwidXJpIjoiMTI3LjAuMC4xIiwiaWF0IjoxNjgxMjA1MTY3LCJleHAiOjE2ODE4MDk5Njd9.u_Oiyx__9_nld47Te2desD4EbdBBlx-GXmcOcaoBc-Y`
// }
// service.defaults.headers.authorization = `Bearer 5353535`

service.interceptors.request.use(
  (config) => {
    const token = useAuthStore().token
    if (token)
      config.headers.Authorization = `Bearer ${token}`
    return config
    // config.headers.Authorization = `Bearer ${window.localStorage.getItem('signature')}`
    // return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200)
      return response
    // throw new Error(response.status.toString())
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service
