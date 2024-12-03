import os from "os";

export function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const ifaceName in interfaces) {
    const iface = interfaces[ifaceName];
    if (!iface) continue;

    for (const alias of iface) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address; // Restituisce l'IP della rete locale
      }
    }
  }
  return "127.0.0.1"; // Valore predefinito se non trova un IP
}