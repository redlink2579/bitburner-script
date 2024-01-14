//Credits to @CatLover for making Corporation library script accessible to everyone with
//an in-depth Corporation guide document, most of these are just me trying to translate
//some of code to javascript since CatLover use typescript with some modification

import { researchName, upgradeName, employeePosition, unlockName, materialName } from "corp/lib/corpobj.js"

/** @param {NS} ns */
export function isProduct(ns, item) {
  let product = false
  for (const material of Object.keys(materialName)) {
    if (item == material) {
      product = false
    } else {
      product = true
    }
  }
  if (product) {
    return true
  } else {
    return false
  }
}

/** @param {NS} ns */
export function getCorporationUpgradelevel(ns) {
  let corporationUpgradeLevels = {
    [upgradeName.SMART_FACTORIES]: 0,
    [upgradeName.SMART_STORAGE]: 0,
    [upgradeName.DREAM_SENSE]: 0,
    [upgradeName.WILSON_ANALYTICS]: 0,
    [upgradeName.NUOPTIMAL_NOOTROPIC_INJECTOR_IMPLANTS]: 0,
    [upgradeName.SPEECH_PROCESSOR_IMPLANTS]: 0,
    [upgradeName.NEURAL_ACCELERATORS]: 0,
    [upgradeName.FOCUS_WIRES]: 0,
    [upgradeName.ABC_SALES_BOTS]: 0,
    [upgradeName.PROJECT_INSIGHT]: 0
  };
  for (const upgradeName of Object.values(upgradeName)) {
    corporationUpgradeLevels[upgradeName] = ns.corporation.getUpgradeLevel(upgradeName);
  }
  return corporationUpgradeLevels;
}

/** @param {NS} ns */
export function getDivisionResearches(ns, division = Division) {
  let divisionResearches = {
    [researchName.HI_TECH_RND_LABORATORY]: false,
    [researchName.AUTO_BREW]: false,
    [researchName.AUTO_PARTY]: false,
    [researchName.AUTO_DRUG]: false,
    [researchName.CPH4_INJECT]: false,
    [researchName.DRONES]: false,
    [researchName.DRONES_ASSEMBLY]: false,
    [researchName.DRONES_TRANSPORT]: false,
    [researchName.GO_JUICE]: false,
    [researchName.HR_BUDDY_RECRUITMENT]: false,
    [researchName.HR_BUDDY_TRAINING]: false,
    [researchName.MARKET_TA_1]: false,
    [researchName.MARKET_TA_2]: false,
    [researchName.OVERCLOCK]: false,
    [researchName.SELF_CORRECTING_ASSEMBLERS]: false,
    [researchName.STIMU]: false,
    [researchName.UPGRADE_CAPACITY_1]: false,
    [researchName.UPGRADE_CAPACITY_2]: false,
    [researchName.UPGRADE_DASHBOARD]: false,
    [researchName.UPGRADE_FULCRUM]: false
  };
  for (const researchName of Object.values(researchName)) {
    divisionResearches[researchName] = ns.corporation.hasResearched(division, researchName);
  }
  return divisionResearches;
}

/** @param {NS} ns */
export function getLimitedRawProduction(ns, division = Division, city = CityName, corpIndustryData = CorpIndustryData, warehouse = Number, isProduct, productSize = Number) {
  const corp = ns.corporation;
  const office = corp.getOffice(division, city);
  const divisioninfo = corp.getDivision(division)
  let rawProduction = (isProduct,
  {
    "operationsProduction": office.employeeProductionByJob.Operations,
    "engineersProduction": office.employeeProductionByJob.Engineer,
    "managementProduction": office.employeeProductionByJob.Management
  }, divisioninfo.productionMult, getCorporationUpgradelevel, getDivisionResearches)
  rawProduction = rawProduction * 10;

  let requiredStorageSpaceOfEachOutputUnit = 0;
  if (isProduct) {
    requiredStorageSpaceOfEachOutputUnit += productSize;
  } else {
    for (const outputMaterialName of corpIndustryData.producedMaterials) {
      requiredStorageSpaceOfEachOutputUnit += ns.corporation.getMaterialData(outputMaterialName).size;
    }
  }
  for (const [requiredMaterialName, requiredMaterialCoefficient] of getRecordEntries(industrialData.requiredMaterials)) {
    requiredStorageSpaceOfEachOutputUnit -= ns.corporation.getMaterialData(requiredMaterialName).size * requiredMaterialCoefficient;
  }
  if (requiredStorageSpaceOfEachOutputUnit > 0) {
    const maxNumberOfOutputUnits = Math.floor(
      (warehouse.size - warehouse.sizeUsed) / requiredStorageSpaceOfEachOutputUnit
    );
    rawProduction = Math.min(rawProduction, maxNumberOfOutputUnits);
  }

  rawProduction = Math.max(rawProduction, 0);
  return rawProduction;
}

/** @param {NS} ns */
export function smartSupplyData(ns) {
  if (ns.corporation.getCorporation().prevState !== CorpState.PURCHASE) {
    return;
  }
  loopAllDivisionsAndCities(ns, (division, city) => {
    const divisioninfo = ns.corporation.getDivision(division);
    const industrialData = ns.corporation.getIndustryData(division.type);
    const warehouse = ns.corporation.getWarehouse(division.name, city);
    let totalRawProduction = 0;

    if (industrialData.makesMaterials) {
      totalRawProduction += getLimitedRawProduction(
        ns,
        division,
        city,
        industrialData,
        warehouse,
        false
      );
    }

    if (industrialData.makesProducts) {
      for (const productName of divisioninfo.products) {
        const product = ns.corporation.getProduct(division, city, productName);
        if (product.developmentProgress < 100) {
          continue;
        }
        totalRawProduction += getLimitedRawProduction(
          ns,
          division,
          city,
          industrialData,
          warehouse,
          true,
          product.size
        );
      }
    }

    smartSupplyData.set(buildSmartSupplyKey(division, city), totalRawProduction);
  });

}

/** @param {NS} ns */
export async function getOptimalSellingPrice(
  ns,
  division = Division,
  industryData = CorpIndustryData,
  city = CityName,
  item = Material | Product
) {
  const divisioninfo = ns.corporation.getDivision(division)
  const itemIsProduct = isProduct(item);
  if (itemIsProduct && item.developmentProgress < 100) {
    throw new Error(`Product is not finished. Product: ${JSON.stringify(item)}`);
  }
  if (!ns.corporation.hasUnlock(unlockName.MARKET_RESEARCH_DEMAND)) {
    throw new Error(`You must unlock "Market Research - Demand"`);
  }
  if (!ns.corporation.hasUnlock(unlockName.MARKET_DATA_COMPETITION)) {
    throw new Error(`You must unlock "Market Data - Competition"`);
  }

  if (ns.corporation.getCorporation().nextState !== "SALE") {
    return "0";
  }
  const expectedSalesVolume = item.stored / 10;
  // Do not compare with 0, there is case when item.stored is a tiny number.
  if (expectedSalesVolume < 1e-5) {
    return "0";
  }

  const office = ns.corporation.getOffice(divisioninfo.name, city);
  let productMarkup = number;
  let markupLimit = number;
  let itemMultiplier = number;
  let marketPrice = number;
  if (itemIsProduct) {
    productMarkup = await getProductMarkup(
      division,
      industryData,
      city,
      item,
      office
    );
    markupLimit = Math.max(item.effectiveRating, 0.001) / productMarkup;
    itemMultiplier = 0.5 * Math.pow(item.effectiveRating, 0.65);
    marketPrice = item.productionCost;
  } else {
    markupLimit = item.quality / ns.corporation.getMaterialData(item.name).baseMarkup;
    itemMultiplier = item.quality + 0.001;
    marketPrice = item.marketPrice;
  }

  const businessFactor = getBusinessFactor(office.employeeProductionByJob[employeePosition.BUSINESS]);
  const advertisingFactor = getAdvertisingFactors(divisioninfo.awareness, divisioninfo.popularity, industryData.advertisingFactor)[0];
  const marketFactor = getMarketFactor(item.demand, item.competition);
  const salesMultipliers =
    itemMultiplier *
    businessFactor *
    advertisingFactor *
    marketFactor *
    getUpgradeBenefit(upgradeName.ABC_SALES_BOTS, ns.corporation.getUpgradeLevel(upgradeName.ABC_SALES_BOTS)) *
    getResearchSalesMultiplier(getDivisionResearches(ns, divisioninfo.name));
  const optimalPrice = markupLimit / Math.sqrt(expectedSalesVolume / salesMultipliers) + marketPrice;
  // ns.print(`item: ${item.name}, optimalPrice: ${ns.formatNumber(optimalPrice)}`);

  return optimalPrice.toString();
}
