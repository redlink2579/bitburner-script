/** @param {NS} ns */
export async function main(ns) {
  ns.tprint(`This is module library for my TUI script, You are not supposed to run this`)
}

/** @param {NS} ns */
export function lazy(ns, thedot, dot, timer) {
  ns.print(`======================================`);
  ns.print(`Nothing happening${thedot[dot]}`);
  ns.print(`--------------------------------------`);
  ns.print(`Please consult the graph`);
  ns.print(`             │                        `);
  ns.print(`             │                        `);
  ns.print(`             │                        `);
  ns.print(`Things that  │                        `);
  ns.print(`   happen    │                        `);
  ns.print(`             │                        `); 
  ns.print(`          0 ─┼────────────────────────`);
  ns.print(`             │                        `);
  ns.print(`         ────┼────────────────────────`);
  ns.print(`             │  Time                  `);
  ns.print(`             │                        `);
  ns.print(`--------------------------------------`);
  ns.print(`Runtime:${ns.tFormat(timer)}`)
  ns.print(`======================================`);
}

/** @param {NS} ns */
export function proto(ns, mode, target, data, yoink, timer, thedot, dot) {
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
    ns.print(`┃  ┗━ Actual gain: ${ns.formatNumber((data.maxMoney * yoink) * ns.getPlayer().mults.hacking_money)}\$ (${ns.formatPercent(yoink, 2)})`)
    ns.print(`┗━ Security: + ${(data.sec - data.minSec).toFixed(2)}`)
    //ns.print(`┗━ Batch count:`)
  }
  ns.print(`Runtime:${ns.tFormat(timer)}`)
  ns.print(`======================================`);
}

export function shotgun(ns) {

}