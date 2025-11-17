/** @param {NS} ns */
export async function main(ns) {
  const refreshrate = 1000;
  const port = ns.getPortHandle(ns.pid);
  const thedot = [".", "..", "..."]
  let dot = 0
  let refreshtimer = 0;
  let timer = 0;
  let info = port.peek()
  let mode = info.mode ?? 0;
  let target = info.target ?? `none`;
  let yoink = info.yoink ?? 0.20;
  let data = new Data(ns, target);
  ns.disableLog(`ALL`)
  ns.ui.openTail()
  ns.ui.resizeTail(384, 265)
  // ns.print(`┣━`)
  ns.ui.setTailTitle(`Batching ${target}`)
  while (true) {
    ns.clearLog();
    //ns.print(ns.self().tailProperties)
    ns.print(`======================================`);
    switch (mode) {
      case 0:
        ns.print(`Nothing happening${thedot[dot]}`);
        break;
      case 1:
        ns.print(`Running Batch on ${target}${thedot[dot]}`);
        break;
      case 2:
        ns.print(`Preparing ${target} for batching${thedot[dot]}`);
    }
    ns.print(`--------------------------------------`);
    if (target === `none`) {
      ns.print(`Target not found${thedot[dot]}`)
    }
    else {
      ns.print(`Target: ${data.target}`)
      ns.print(`┣━ Money: ${ns.formatNumber(data.money, 2, 1e3, true)}\$ / ${ns.formatNumber(data.maxMoney, 2, 1e3, true)}\$`)
      ns.print(`┃  ┗━ Actual gain: ${ns.formatNumber((data.maxMoney * yoink) * ns.getPlayer().mults.hacking_money)}\$`)
      ns.print(`┗━ Security: + ${(data.sec - data.minSec).toFixed(2)}`)
      //ns.print(`┗━ Batch count:`)
    }
    ns.print(`Refresh in ${ns.tFormat(10000 - refreshtimer)}`)
    ns.print(`Runtime:${ns.tFormat(timer)}`)
    ns.print(`======================================`);
    debugger
    if (refreshtimer == 10000) {
      info = port.peek();
      mode = info.mode;
      yoink = info.yoink;
      target = info.target;
      data = new Data(ns, target);
      refreshtimer = 0
    }
    await ns.asleep(refreshrate)
    timer = timer + 1000
    refreshtimer = refreshtimer + 1000
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