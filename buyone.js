import { getserver } from "lib/function.js"
/** @param {NS} ns */
export async function main(ns) {
  const ram = ns.args[0] ?? 32768
  const name = "pserv"
  let buyram = Math.pow(2, Math.ceil(Math.log2(ram)))
  let cost = ns.getPurchasedServerCost(buyram)
  let servers = getserver(ns)
  let pserver = servers.filter(x => x.startsWith(name))
  ns.tprint(pserver)
  if (cost > ns.getServerMoneyAvailable("home")) {
    throw new Error(`Not enough money to buy server!, require ${ns.formatNumber(cost, 1, 1e4)} for ${ns.formatRam(buyram)}`)
  }

  if (pserver.lenght >= 4) {
    for (let i = 0; i < pserver.length; i++) {
      ns.deleteServer(pserver[i])
    }
  }

  ns.tprint(`Purchasing server for ${ns.formatRam(buyram)}`)
  ns.purchaseServer(name, buyram)
}
