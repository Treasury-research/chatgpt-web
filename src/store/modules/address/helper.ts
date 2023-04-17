import { ss } from '@/utils/storage'

const LOCAL_NAME = 'SECRET_ADDRESS'

export function getAddress() {
  return ss.get(LOCAL_NAME)
}

export function setAddress(address: string) {
  return ss.set(LOCAL_NAME, address)
}

export function removeAddress() {
  return ss.remove(LOCAL_NAME)
}
