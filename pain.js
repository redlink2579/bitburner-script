import * as lib from "function.js"
/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]

  while (true) {
    if (lib.issecurityprep(ns, target)) {
      await lib.weakensecurity(ns, target)
    } else if (lib.ismoneyprep(ns, target)) {
      await lib.growmoney(ns, target)
    } else {
      await lib.makeitrain(ns, target)
    }
  }
}
