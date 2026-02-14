import * as module from "Batcher/libs/module.js"
/** @param {NS} ns */
export async function main(ns) {
  const refreshrate = 1000;
  const port = ns.getPortHandle(ns.pid);
  const working = ns.args[1] ?? false
  let timer = 0
  let portdata = port.peek()
  let mode = portdata.mode ?? 0;
  let target = portdata.target ?? `home`;
  let yoink = portdata.yoink ?? 0.20;
  let data = new Data(ns, target);
  let info = { mode, target, yoink, data };

  function updatedata() {
    if (working) {
      portdata = port.peek();
      mode = portdata.mode;
      yoink = portdata.yoink;
      target = portdata.target;
      data = new Data(ns, target);
      info = { mode, target, yoink, data };
    }
  }

  let dot = { thedot: [`.`, `..`, `...`], index: 0 };
  const name = { lazy: `Nothing happening`, proto: `Batching ${target}`, shotgun: `Shotgunning ${target}` }
  const uiwidth = { lazy: 385, proto: 372 }
  const uiheight = { lazy: 455, proto: 250 }
  const modulePointer = ns.args[0] ?? `lazy`

  function display() {
    module[modulePointer](ns, info, dot, timer)
  }
  ns.disableLog(`ALL`)
  ns.ui.openTail()
  ns.ui.resizeTail(uiwidth[modulePointer], uiheight[modulePointer])
  ns.ui.setTailTitle(name[modulePointer])
  let lastTarget = ""
  debugger
  while (true) {
    ns.clearLog();
    //ns.print(ns.self().tailProperties) //only needed for calibating the ui size
    display()
    await ns.asleep(refreshrate)
    updatedata()
    timer = timer + refreshrate
    debugger
    dot.index++
    if (lastTarget != target) {
      ns.ui.setTailTitle(name[modulePointer])
    } else lastTarget = target
    if (dot.index > 2) {
      dot.index = 0
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
