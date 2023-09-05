import { all } from "function.js"
/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    if (issecurityprep(target)) {
      let currentsec = ns.getServerSecurityLevel(target);
      let money = ns.getServerMoneyAvailable(target);
      await weakensecurity(target)
    } else if (ismoneyprep(target)) {
      await growmoney(target)
    } else {
      await makeitrain(target)
    }
  }
}
