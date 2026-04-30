import os from 'os'

function isPrivateIPv4(address) {
  return (
    address.startsWith('10.') ||
    address.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(address)
  )
}

export function getLanIPv4Addresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(Boolean)
    .filter((item) => item.family === 'IPv4' && !item.internal && isPrivateIPv4(item.address))
    .map((item) => item.address)
}

export function formatLanUrls(port) {
  return getLanIPv4Addresses().map((address) => `http://${address}:${port}`)
}
