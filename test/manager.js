//My super-controller..... and my worse headache
//By @Greytider(redlink2579)
import { getserver } from "lib/function.js"
/** @param {NS} ns */
export async function main(ns) {
  const overseerport = ns.getPortHandle(ns.pid)
  const debugmode = true // for debugging
  const debugopt = 2 // 1 = to log, 2 = to terminal

  function debug(string) {
    if (debugmode == true) {
      if (debugopt == 1) {
        return ns.print(`[DEBUG]${string}`)
      } else {
        return ns.tprint(`[DEBUG]${string}`)
      }
    }
  }

  const controller = "test/controller.js"
  const yoink = 0.20 //default:0.80
  const oversee = ns.args[0] ?? 4
  const delaybetween = 5
  let reqram = 0
  let servers = getserver(ns)
  servers.sort((x, y) => ns.getServerMaxMoney(y) - ns.getServerMaxMoney(x)) //Sorting targets by money
  let targets = servers.filter(server => Math.floor(ns.getHackingLevel() * 0.5) > ns.getServerRequiredHackingLevel(server)) //filtering targets to only those that we can hack
  let target = ns.args[1] ?? targets[0]
  
  let controllerport = []
  for (let i = 1; i <= oversee; i++) {
    let controldelay = delaybetween * i
    if (i == oversee) {
      let deployedport = ns.exec(controller, "home", 1, yoink, ns.pid, "true", controldelay, target)
      controllerport.push(deployedport)
    } else {
      let deployedport = ns.exec(controller, "home", 1, yoink, ns.pid, "false", controldelay, target)
      controllerport.push(deployedport)
    }
    await overseerport.nextWrite()
    if (overseerport.read == "Prep") {
      await overseerport.nextWrite()
    }
    await ns.sleep(5)
  }
  while (true) {
    await overseerport.nextWrite()
  }
} 
