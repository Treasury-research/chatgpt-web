import { defineStore } from 'pinia'
import { getAddress, removeAddress, setAddress } from './helper'
import { store } from '@/store'

export interface AddressState {
  address: string | undefined
}

export const useAddressStore = defineStore('address-store', {
  state: (): AddressState => ({
    address: getAddress()
  }),

  actions: {
    setAddress(address: string) {
      this.address = address
      setAddress(address)
    },

    removeAddress() {
      this.address = undefined
      removeAddress()
    },
  },
})

export function useAddressStoreWithout() {
  return useAddressStore(store)
}
