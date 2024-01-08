import { isPrepped } from "lib/function.js"

/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]
  const serverminsec = ns.getServerMinSecurityLevel(target)
  const servermaxmoney = ns.getServerMaxMoney(target)
  const brace = "======================================================"
  const line = "------------------------------------------------------"
  const spinners = [" - ", " \ ", " | ", " / "]
  const port = ns.getPortHandle(ns.pid)
  const timestart = Date.now()
  let indexspinner = 0

  function prepped() {
    if (isPrepped(ns, target)) {
      return "[Y]"
    } else {
      return "[N]"
    }
  }

  ns.disableLog("ALL")
  ns.tail()
  ns.resizeTail(530, 270)
  while (true) {
    let time = Date.now() - timestart
    let localetime = new Date().toLocaleString()
    let serversec = ns.getServerSecurityLevel(target)
    let servermoney = ns.getServerMoneyAvailable(target)
    let spinner = spinners[indexspinner]

    ns.print("Runtime: ", ns.tFormat(time))
    ns.print(localetime)
    ns.print(brace)
    ns.print("Server prepared status: ", prepped())
    ns.print(line)
    ns.print("Current Security level: +", (serversec - serverminsec).toFixed(2))
    ns.print("Current Server money: ", ns.formatNumber(servermoney, 2, 1e3), "/", ns.formatNumber(servermaxmoney, 2, 1e3))
    ns.print(line)
    if (port.empty()) {
      ns.print("Currently nothing is happened", spinner)
    } else {
      ns.print("Currently: ", port.peek, spinner)
    }
    ns.print(brace)


    await ns.sleep(1000)

    indexspinner = indexspinner >= spinners.length - 1 ? 0 : indexspinner + 1;
    ns.clearLog()
  }
}
