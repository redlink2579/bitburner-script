import { researchName } from "corp/lib/corpobj.js"
/** @param {NS} ns */
export async function main(ns) {
  const corp = ns.corporation
  let divisions = corp.getCorporation().divisions
  const epsilon = 0.5;
  let minAcceptableEnergy = 99;
  let minAcceptableMorale = 99;
  for (const division of divisions) {
    if (ns.corporation.hasResearched(division, researchName.GO_JUICE)) {
      minAcceptableEnergy = 109;
    }
    if (ns.corporation.hasResearched(division, researchName.STIMU)) {
      minAcceptableMorale = 109;
    }
  }
  while (true) {
    for (const division of divisions) {
      const cities = corp.getDivision(division).cities
      for (const city of cities) {
        const office = ns.corporation.getOffice(division, city);
        if (office.avgEnergy < minAcceptableEnergy + epsilon) {
          ns.corporation.buyTea(division, city);
        }
        if (office.avgMorale < minAcceptableMorale + epsilon) {
          ns.corporation.throwParty(division, city, 500000);
        }
      }
    }
    await ns.corporation.nextUpdate();
  }
}
