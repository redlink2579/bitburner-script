import { getserver, isPrepped, GrantRoot, issecurityprep } from "lib/function.js"
/** @param {NS} ns */
export async function main(ns) {
  ns.tail()
  let servers = getserver(ns)
  servers.sort((x, y) => ns.getServerMaxMoney(y) - ns.getServerMaxMoney(x)) //Sorting targets by money
  const targets = servers.filter(server => Math.floor(ns.getHackingLevel() * 0.75) > ns.getServerRequiredHackingLevel(server)) //filtering targets to only those that we can hack
  const target = targets[0]
  let ramhost = servers.filter(server => ns.hasRootAccess(server) == true) //Finding servers that we have access
  ramhost.sort((x, y) => (ns.getServerMaxRam(x) - ns.getServerUsedRam(x)) - (ns.getServerMaxRam(y) - ns.getServerUsedRam(y)))//wait should I sort it's like this?
  JSON.stringify(ramhost)
  if (ns.hasRootAccess(target) != true) {
    GrantRoot(ns, target)
  };
  if (!isPrepped(ns, target)) {
    if (issecurityprep(ns, target) == true) {
      const WT = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1))
      ns.print(WT)
      for (let i = 0; i <= ramhost.lenght; i++) {
        if (10000 * WT < ns.getServerMaxRam(ramhost[i]) == true) {
          let pid = ns.exec(Script[2], ramhost[i], WT, Delay[0], target)
          let port = ns.getPortHandle(pid)
          await port.nextWrite()
        } else {
          throw new Error("Not even enough ram on any to run a single weaken job!, upgrade ram or buy more servers to fix this")
        }
      }
    }
  }
}
