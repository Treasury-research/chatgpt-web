const { ethers } = require('ethers')
require('dotenv').config()

async function main() {
  // Replace with your own private key
  const privateKey = process.env.PRIVATE_KEY

  // Create a new instance of the ethers Wallet class
  const wallet = new ethers.Wallet(privateKey)

  // The message you want to sign
  const message = '\nlocalhost wants you to sign in with your Ethereum account:\n0xD3420A3be0a1EFc0FBD13e87141c97B2C9AC9dD3\n\nSign in with ethereum to lens\n\nURI: localhost\nVersion: 1\nChain ID: 137\nNonce: hc3S90xS5rTdPmAl\nIssued At: 1681007753\n '

  // Sign the message using the wallet
  const signature = await wallet.signMessage(message)

  console.log(signature)
}
main()
