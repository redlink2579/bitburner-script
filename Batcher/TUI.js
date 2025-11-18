import { lazy, proto, shotgun } from "Batcher/libs/module.js"
/** @param {NS} ns */
export async function main(ns) {
  const refreshrate = 1000;
  const port = ns.getPortHandle(ns.pid);
  const working = ns.args[1] ?? false
  let timer = 0
  let info = port.peek()
  let mode = info.mode ?? 0;
  let target = info.target ?? `home`;
  let yoink = info.yoink ?? 0.20;
  let data = new Data(ns, target);

  function updateinfo() {
    if (working) {
      info = port.peek();
      mode = info.mode;
      yoink = info.yoink;
      target = info.target;
      data = new Data(ns, target);
    }
  }

  const thedot = [`.`, `..`, `...`]
  let dot = 0

  const name = [`Nothing happening`, `Batching ${target}`, `Shotgunning ${target}`]
  const uiwidth = [385, 372]
  const uiheight = [455, 250]
  const selection = ns.args[0] ?? 0

  function display() {
    if (selection == 0) {
      lazy(ns, thedot, dot, timer)
    } else if (selection == 1) {
      proto(ns, mode, target, data, yoink, timer, thedot, dot)
    }
  }

  ns.disableLog(`ALL`)
  ns.ui.openTail()
  ns.ui.resizeTail(uiwidth[selection], uiheight[selection])
  ns.ui.setTailTitle(name[selection])
  while (true) {
    ns.clearLog();
    //ns.print(ns.self().tailProperties)
    display()
    await ns.asleep(refreshrate)
    updateinfo()
    timer = timer + refreshrate
    debugger
    dot++
    if (dot > 2) {
      dot = 0
    }
  }
}

class Data {
  /** @param {NS} ns */
  constructor(ns, target) {
    this.target = target;
    this.maxMoney = ns.getServerMaxMoney(target);
    this.money = Math.max(ns.getServerMoneyAvailable(target), 1);
    this.minSec = ns.getServerMinSecurityLevel(target);
    this.sec = ns.getServerSecurityLevel(target);
  }
}