//Custom smartsupply
import { detectWarehouseCongestion, buyOptimalAmountOfInputMaterials, findOptimalAmountOfBoostMaterials, setSmartSupplyData } from "corp/lib/corputils.js"
/** @param {NS} ns */
export async function main(ns) {
  const corp = ns.corporation
  const divisions = corp.getCorporation().divisions
  const useWarehouseSize = false
  const ratio = 1
  let warehouseCongestionData = new Map()

  for (const divisionName of divisions) {
    const division = corp.getDivision(divisionName)
    const industryname = corp.getDivision(division.name).type
    const industryData = corp.getIndustryData(industryname)
    const cities = division.cities
    for (const city of cities) {
      setSmartSupplyData(ns)
      detectWarehouseCongestion(ns, division, industryData, city, warehouseCongestionData)
      buyOptimalAmountOfInputMaterials(ns, warehouseCongestionData)
      await findOptimalAmountOfBoostMaterials(ns, division, industryData, city, useWarehouseSize, ratio)
    }
  }
}
