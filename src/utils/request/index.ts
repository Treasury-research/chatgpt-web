import type { AxiosProgressEvent, AxiosResponse, GenericAbortSignal } from 'axios'
import request from './axios'
import { useAuthStore, useAddressStore } from '@/store'
import { createDiscreteApi } from 'naive-ui'

export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: any
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  signal?: GenericAbortSignal
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response<T = any> {
  data: T
  message: string | null
  status: string
}

function http<T = any>(
  { url, data, method, headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    const authStore = useAuthStore()

    if (res.data.status === 'Success' || typeof res.data === 'string')
      return res.data

    if (res.data.status === 'Unauthorized') {
      // const { message } = createDiscreteApi(
      //   ['message']
      // )
      // const appSetting: any = window.localStorage.getItem('appSetting')
      // const language = JSON.parse(appSetting)['data']['language']
      // const languageObj: any = {
      //   noPermision: {
      //     'zh-TW': '未經授權，請聯系管理員。',
      //     'en-US': 'Unauthorized, please contact the administrator。',
      //     'zh-CN': '未经授权，请联系管理员。',
      //   },
      //   loginAgin: {
      //     'zh-TW': '帳號已過期，請重新登入。',
      //     'en-US': 'The account has expired, please log in again。',
      //     'zh-CN': '账号已过期，请重新登录。',
      //   }
      // }
      // if (useAddressStore().address && useAuthStore().token) {
      //   message.error(languageObj['noPermision'][language])
      // } else {
      //   message.error(languageObj['loginAgin'][language])
      // }
      authStore.removeToken()
      window.localStorage.removeItem('signature')
    }

    return Promise.reject(res.data)
  }

  const failHandler = (error: Response<Error>) => {
    afterRequest?.()
    throw new Error(error?.message || 'Error')
  }

  beforeRequest?.()

  method = method || 'GET'

  const params = Object.assign(typeof data === 'function' ? data() : data ?? {}, {})

  return method === 'GET'
    ? request.get(url, { params, signal, onDownloadProgress }).then(successHandler, failHandler)
    : request.post(url, params, { headers, signal, onDownloadProgress }).then(successHandler, failHandler)
}

export function get<T = any>(
  { url, data, method = 'GET', onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })
}

export function post<T = any>(
  { url, data, method = 'POST', headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })
}

export default post
