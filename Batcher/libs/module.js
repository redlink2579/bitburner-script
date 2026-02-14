/** @param {NS} ns */
export async function main(ns) {
  ns.tprint(`This is module library for my TUI script, You are not supposed to run this`)
}

/**Note to self:If you going to add more module make sure it's include all info 
 * even if you are not using it shit will break if you don't include it*/

/** @param {NS} ns */
export function lazy(ns, info, dot, timer = 0) {
  ns.print(`======================================`);
  ns.print(`Nothing happening${dot.thedot[dot.index]}`);
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
export function proto(ns, info, dot, timer = 0) {
  ns.print(`======================================`);
  switch (info.mode) {
    case 0:
      ns.print(`Nothing happening${dot.thedot[dot.index]}`);
      break;
    case 1:
      ns.print(`Running Batch on ${info.target}${dot.thedot[dot.index]}`);
      break;
    case 2:
      ns.print(`Preparing ${info.target} for batching${dot.thedot[dot.index]}`);
  }
  ns.print(`--------------------------------------`);
  if (info.target === `none`) {
    ns.print(`Target not found${dot.thedot[dot.index]}`)
  }
  else {
    ns.print(`Target: ${info.target}`)
    ns.print(`┣━ Money: ${ns.formatNumber(info.data.money, 2, 1e3, true)}\$ / ${ns.formatNumber(info.data.maxMoney, 2, 1e3, true)}\$`)
    ns.print(`┃  ┗━ Actual gain: ${ns.formatNumber(((info.data.maxMoney * info.yoink) * ns.getBitNodeMultipliers().ScriptHackMoney) * (ns.getPlayer().mults.hacking_money * ns.getBitNodeMultipliers().ScriptHackMoneyGain))}\$ (${ns.formatPercent(info.yoink, 0)})`)
    ns.print(`┗━ Security: + ${(info.data.sec - info.data.minSec).toFixed(2)}`)
    //ns.print(`┗━ Batch count:`)
  }
  ns.print(`Runtime:${ns.tFormat(timer)}`)
  ns.print(`======================================`);
}

export function shotgun(ns) {

}
