import { getOptimalSellingPrice } from "corp/lib/corputils.js"
/** @param {NS} ns */
export async function main(ns) {
  const corp = ns.corporation;
  const divisions = corp.getCorporation().divisions;
  
  while (true) {
    for (const division of divisions) {
      const industryname = corp.getDivision(division).type
      const industryData = corp.getIndustryData(industryname)
      const cities = corp.getDivision(division).cities
      let product = "NAN"
      if (industryData.makesProducts == true) {
        const productname = industryData.product.name
        product = productname
      }
      for (const city of cities) {
        if (industryData.makesProducts) {
          const items = industryData.producedMaterials | corp.getProduct(division, city, product)
          for (const item of items) {
            getOptimalSellingPrice(ns, division, industryData, city, item)
          }
        } else {
          const items = industryData.producedMaterials
          for (const item of items) {
            await getOptimalSellingPrice(ns, division, industryData, city, item)
          }
        }
      }
    }
    await corp.nextUpdate()
  }
}
