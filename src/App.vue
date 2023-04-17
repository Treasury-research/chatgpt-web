<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { NConfigProvider } from "naive-ui";
import { NaiveProvider } from "@/components/common";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import Web3 from "web3";
import { getChallenge, login } from "@/api";
import { NButton } from "naive-ui";
import { useAuthStore } from "@/store";
import { useAddressStore } from "@/store";

const { language } = useLanguage();
const authStore = useAuthStore();
const addressStore = useAddressStore();
let web3 = ref<any>("");
let connected = ref<boolean>(false);
let message = ref<any>("");
let signature = ref<any>("");
let address = ref<any>("");
let btnDes = ref<any>("");
listenAccountChange();
initLogin();

function listenAccountChange() {
  if (!window.ethereum) {
    console.log("请先安装metamask！");
    return;
  }
  window.ethereum.on("accountsChanged", async (accounts) => {
    btnDes.value = "Connect";
    logOut();
    connectWallet();
  });
}

function initLogin() {
  if (!useAddressStore().address) {
    connectWallet();
  }
}

function setBtnDes() {
  if (useAddressStore().address && useAuthStore().token) {
    btnDes.value = shortenAddr(useAddressStore().address, 3);
  } else if (!useAddressStore().address && !useAuthStore().token) {
    btnDes.value = "Connect";
  } else {
    btnDes.value = "Login";
  }
}

function shortenAddr(res, length = 3) {
  if (!res) return "";
  return `${res.slice(0, length)}...${res.slice(-length)}`;
}

function logOut() {
  authStore.removeToken();
  addressStore.removeAddress();
}

async function connectWallet() {
  // console.log(window.ethereum)
  if (window && window.ethereum) {
    if (!window.ethereum) {
      console.log("请先安装metamask！");
      return;
    }
    await window.ethereum.enable();
    // await window.ethereum.request({ method: "eth_requestAccounts" });
    web3 = await new Web3(window.ethereum);
    address.value = (await web3.eth.getAccounts())[0];
    addressStore.setAddress(address.value);
    window.localStorage.setItem("address", address.value);
    const chainId = 137;
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    const res = await getChallenge(address.value);
    const signature = await web3.eth.personal.sign(res.message, address.value);
    const res1 = await login(address.value, signature);
    // window.localStorage.setItem("signature", res1.message);
    authStore.setToken(res1.message);
    console.log(res1);
    console.log(signature);
    connected.value = true;
  }
}

watch(
  () => useAuthStore().token,
  () => {
    setBtnDes();
  },
  { immediate: true }
);

watch(
  () => useAddressStore().address,
  () => {
    setBtnDes();
  },
  { immediate: true }
);
</script>

<template>
  <NConfigProvider
    class="h-full overflow-hidden"
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="language"
  >
    <NaiveProvider>
      <div>
        <div class="flex w-[fit-content] ml-[auto] mr-[20px] mt-[20px]">
          <div class="w-[120px] mr-[10px] ml-[auto]">
            <NButton block @click="connectWallet">
              {{ btnDes }}
            </NButton>
          </div>
          <div
            class="w-[100px]"
            v-if="useAddressStore().address && useAuthStore().token"
          >
            <NButton block @click="logOut"> Log out </NButton>
          </div>
        </div>
      </div>
      <div class="w-full h-[calc(100%-80px)]">
        <RouterView />
      </div>
    </NaiveProvider>
  </NConfigProvider>
</template>
