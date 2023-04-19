import { ss } from '@/utils/storage'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string
  name: string
  description: string
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: 'https://lens.infura-ipfs.io/ipfs/QmNVX7Pb1Xe46w2FNqBxzNiu56t99TcPNrBBKoGNfrVTqQ',
      name: 'KNN3 Network',
      description: '<a href="https://www.knn3.xyz/" class="text-blue-500" target="_blank" >Learn more</a>',
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
