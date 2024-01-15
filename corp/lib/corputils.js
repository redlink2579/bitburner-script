//Credits to @CatLover for making Corporation library script accessible to everyone with
//an in-depth Corporation guide document, most of these are just me trying to translate
//some of code to javascript since CatLover use typescript with some modification

import { researchName, upgradeName, employeePosition, unlockName, materialName, corpState } from "corp/lib/corpobj.js"
import { Ceres } from "corp/lib/Ceres.js";

let number = 0

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

export function CeresSolverResult() {
  success: boolean;
  message: string;
  x: number;[]
  report: string;
}

export async function waitUntilAfterStateHappens(ns, state) {
  while (true) {
    if (ns.corporation.getCorporation().nextState === state) {
      await ns.corporation.nextUpdate()
      break
    }
    await ns.corporation.nextUpdate()
  }
}


export let productMarkupData = new Map();
export let getRecordEntries = Object.entries
export let smartSupplyData = new Map();

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

export async function calculateProductMarkup(
  divisionRP = number,
  industryScienceFactor = number,
  product = Product,
  employeeProductionByJob = {
    operationsProduction: number,
    engineerProduction: number,
    businessProduction: number,
    managementProduction: number,
    researchAndDevelopmentProduction: number,
  }
) {
  const designInvestmentMultiplier = 1 + Math.pow(product.designInvestment, 0.1) / 100;
  const researchPointMultiplier = 1 + Math.pow(divisionRP, industryScienceFactor) / 800;
  const k = designInvestmentMultiplier * researchPointMultiplier;
  const balanceMultiplier = function (
    creationJobFactorsEngineer = number,
    creationJobFactorsManagement = number,
    creationJobFactorsRnD = number,
    creationJobFactorsOperations = number,
    creationJobFactorsBusiness = number) {
    const totalCreationJobFactors = creationJobFactorsEngineer + creationJobFactorsManagement + creationJobFactorsRnD + creationJobFactorsOperations + creationJobFactorsBusiness;
    const engineerRatio = creationJobFactorsEngineer / totalCreationJobFactors;
    const managementRatio = creationJobFactorsManagement / totalCreationJobFactors;
    const researchAndDevelopmentRatio = creationJobFactorsRnD / totalCreationJobFactors;
    const operationsRatio = creationJobFactorsOperations / totalCreationJobFactors;
    const businessRatio = creationJobFactorsBusiness / totalCreationJobFactors;
    return 1.2 * engineerRatio + 0.9 * managementRatio + 1.3 * researchAndDevelopmentRatio + 1.5 * operationsRatio + businessRatio;

  };
  const f1 = function ([creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness] = number, number = []) {
    return k
      * balanceMultiplier(creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness)
      * (0.1 * creationJobFactorsEngineer + 0.05 * creationJobFactorsManagement + 0.05 * creationJobFactorsRnD + 0.02 * creationJobFactorsOperations + 0.02 * creationJobFactorsBusiness)
      - product.stats.quality;
  };
  const f2 = function ([creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness] = number, number = []) {
    return k
      * balanceMultiplier(creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness)
      * (0.15 * creationJobFactorsEngineer + 0.02 * creationJobFactorsManagement + 0.02 * creationJobFactorsRnD + 0.02 * creationJobFactorsOperations + 0.02 * creationJobFactorsBusiness)
      - product.stats.performance;
  };
  const f3 = function ([creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness] = number, number = []) {
    return k
      * balanceMultiplier(creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness)
      * (0.05 * creationJobFactorsEngineer + 0.02 * creationJobFactorsManagement + 0.08 * creationJobFactorsRnD + 0.05 * creationJobFactorsOperations + 0.05 * creationJobFactorsBusiness)
      - product.stats.durability;
  };
  const f4 = function ([creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness] = number, number = []) {
    return k
      * balanceMultiplier(creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness)
      * (0.02 * creationJobFactorsEngineer + 0.08 * creationJobFactorsManagement + 0.02 * creationJobFactorsRnD + 0.05 * creationJobFactorsOperations + 0.08 * creationJobFactorsBusiness)
      - product.stats.reliability;
  };
  const f5 = function ([creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness] = number, number = []) {
    return k
      * balanceMultiplier(creationJobFactorsEngineer, creationJobFactorsManagement, creationJobFactorsRnD, creationJobFactorsOperations, creationJobFactorsBusiness)
      * (0.08 * creationJobFactorsManagement + 0.05 * creationJobFactorsRnD + 0.02 * creationJobFactorsOperations + 0.1 * creationJobFactorsBusiness)
      - product.stats.aesthetics;
  };
  let solverResult = CeresSolverResult = {
    success: false,
    message: "",
    x: [],
    report: "string",
  };
  const solver = new Ceres();
  await solver.promise.then(function () {
    solver.add_function(f1);
    solver.add_function(f2);
    solver.add_function(f3);
    solver.add_function(f4);
    solver.add_function(f5);
    // Guess the initial values of the solution
    let guess = [1, 1, 1, 1, 1];
    if (employeeProductionByJob) {
      guess = [
        employeeProductionByJob.engineerProduction,
        employeeProductionByJob.managementProduction,
        employeeProductionByJob.researchAndDevelopmentProduction,
        employeeProductionByJob.operationsProduction,
        employeeProductionByJob.businessProduction
      ];
    }
    solverResult = solver.solve(guess);
    solver.remove();
  });
  if (!solverResult.success) {
    throw new Error(`ERROR: Cannot find hidden stats of product: ${JSON.stringify(product)}`);
  }
  const totalCreationJobFactors = solverResult.x[0] + solverResult.x[1] + solverResult.x[2] + solverResult.x[3] + solverResult.x[4];
  const managementRatio = solverResult.x[1] / totalCreationJobFactors;
  const businessRatio = solverResult.x[4] / totalCreationJobFactors;

  const advertisingInvestmentMultiplier = 1 + Math.pow(product.advertisingInvestment, 0.1) / 100;
  const businessManagementRatio = Math.max(businessRatio + managementRatio, 1 / totalCreationJobFactors);
  return 100 / (advertisingInvestmentMultiplier * Math.pow(product.stats.quality + 0.001, 0.65) * businessManagementRatio);
}

export async function getProductMarkup(
  division = Division,
  industryData = CorpIndustryData,
  city = CityName,
  item = Product,
  office = Office
) {
  const productMarkupKey = `${division.name}|${city}|${item.name}`;
  let productMarkup = productMarkupData.get(productMarkupKey);
  if (!productMarkup) {
    productMarkup = await calculateProductMarkup(
      division.researchPoints,
      industryData.scienceFactor,
      item,
      (office) ? {
        operationsProduction: office.employeeProductionByJob.Operations,
        engineerProduction: office.employeeProductionByJob.Engineer,
        businessProduction: office.employeeProductionByJob.Business,
        managementProduction: office.employeeProductionByJob.Management,
        researchAndDevelopmentProduction: office.employeeProductionByJob["Research & Development"],
      } : undefined
    );
    productMarkupData.set(productMarkupKey, productMarkup);
  }
  return productMarkup;
}

/** @param {NS} ns */
export function detectWarehouseCongestion(
  ns,
  division,
  industrialData,
  city,
  warehouseCongestionData
) {
  const requiredMaterials = getRecordEntries(industrialData.requiredMaterials)
  let isWarehouseCongested = false
  const warehouseCongestionDataKey = `${division.name}|${city}`
  const items = []
  if (industrialData.producedMaterials) {
    for (const materialName of industrialData.producedMaterials) {
      items.push(ns.corporation.getMaterial(division.name, city, materialName))
    }
  }
  if (industrialData.makesProducts) {
    for (const productName of division.products) {
      const product = ns.corporation.getProduct(
        division.name,
        city,
        productName
      )
      if (product.developmentProgress < 100) {
        continue
      }
      items.push(product)
    }
  }
  for (const item of items) {
    if (item.productionAmount !== 0) {
      warehouseCongestionData.set(warehouseCongestionDataKey, 0)
      continue
    }
    // item.productionAmount === 0 means that division does not produce material/product last cycle.
    let numberOfCongestionTimes =
      warehouseCongestionData.get(warehouseCongestionDataKey) + 1
    if (Number.isNaN(numberOfCongestionTimes)) {
      numberOfCongestionTimes = 0
    }
    warehouseCongestionData.set(
      warehouseCongestionDataKey,
      numberOfCongestionTimes
    )
    break
  }
  // If that happens more than 5 times, the warehouse is very likely congested.
  if (warehouseCongestionData.get(warehouseCongestionDataKey) > 5) {
    isWarehouseCongested = true
  }
  // We need to mitigate this situation. Discarding stored input material is the simplest solution.
  if (isWarehouseCongested) {
    showWarning(
      ns,
      `Warehouse may be congested. Division: ${divisioninfo.name}, city: ${city}.`
    )
    for (const [materialName] of requiredMaterials) {
      // Clear purchase
      ns.corporation.buyMaterial(division.name, city, materialName, 0)
      // Discard stored input material
      ns.corporation.sellMaterial(division.name, city, materialName, "MAX", "0")
    }
    warehouseCongestionData.set(warehouseCongestionDataKey, 0)
  } else {
    for (const [materialName] of requiredMaterials) {
      const material = ns.corporation.getMaterial(
        division.name,
        city,
        materialName
      )
      if (material.desiredSellAmount !== 0) {
        // Stop discarding input material
        ns.corporation.sellMaterial(division.name, city, materialName, "0", "0")
      }
    }
  }
  return isWarehouseCongested
}


export function buyOptimalAmountOfInputMaterials(ns, warehouseCongestionData) {
  if (ns.corporation.getCorporation().nextState !== "PURCHASE") {
    return
  }
  // Loop and set buy amount
  loopAllDivisionsAndCities(ns, (Division, city) => {
    const division = ns.corporation.getDivision(Division)
    const industrialData = ns.corporation.getIndustryData(division.type)
    const office = ns.corporation.getOffice(division.name, city)
    const requiredMaterials = getRecordEntries(industrialData.requiredMaterials)

    // Detect warehouse congestion
    let isWarehouseCongested = false
    if (
      !setOfDivisionsWaitingForRP.has(divisionName) &&
      office.employeeJobs["Research & Development"] !== office.numEmployees
    ) {
      isWarehouseCongested = detectWarehouseCongestion(
        ns,
        division,
        industrialData,
        city,
        warehouseCongestionData
      )
    }
    if (isWarehouseCongested) {
      return
    }

    const warehouse = ns.corporation.getWarehouse(division.name, city)
    const inputMaterials = {}
    for (const [materialName, materialCoefficient] of requiredMaterials) {
      inputMaterials[materialName] = {
        requiredQuantity: 0,
        coefficient: materialCoefficient
      }
    }

    // Find required quantity of input materials to produce material/product
    for (const inputMaterialData of Object.values(inputMaterials)) {
      const requiredQuantity =
        (smartSupplyData.get(buildSmartSupplyKey(divisionName, city)) ?? 0) *
        inputMaterialData.coefficient
      inputMaterialData.requiredQuantity += requiredQuantity
    }

    // Limit the input material units to max number of units that we can store in warehouse's free space
    for (const [materialName, inputMaterialData] of getRecordEntries(
      inputMaterials
    )) {
      const materialData = ns.corporation.getMaterialData(materialName)
      const maxAcceptableQuantity = Math.floor(
        (warehouse.size - warehouse.sizeUsed) / materialData.size
      )
      const limitedRequiredQuantity = Math.min(
        inputMaterialData.requiredQuantity,
        maxAcceptableQuantity
      )
      if (limitedRequiredQuantity > 0) {
        inputMaterialData.requiredQuantity = limitedRequiredQuantity
      }
    }

    // Find which input material creates the least number of output units
    let leastAmountOfOutputUnits = Number.MAX_VALUE
    for (const { requiredQuantity, coefficient } of Object.values(
      inputMaterials
    )) {
      const amountOfOutputUnits = requiredQuantity / coefficient
      if (amountOfOutputUnits < leastAmountOfOutputUnits) {
        leastAmountOfOutputUnits = amountOfOutputUnits
      }
    }

    // Align all the input materials to the smallest amount
    for (const inputMaterialData of Object.values(inputMaterials)) {
      inputMaterialData.requiredQuantity =
        leastAmountOfOutputUnits * inputMaterialData.coefficient
    }

    // Calculate the total size of all input materials we are trying to buy
    let requiredSpace = 0
    for (const [materialName, inputMaterialData] of getRecordEntries(
      inputMaterials
    )) {
      requiredSpace +=
        inputMaterialData.requiredQuantity *
        ns.corporation.getMaterialData(materialName).size
    }

    // If there is not enough free space, we apply a multiplier to required quantity to not overfill warehouse
    const freeSpace = warehouse.size - warehouse.sizeUsed
    if (requiredSpace > freeSpace) {
      const constrainedStorageSpaceMultiplier = freeSpace / requiredSpace
      for (const inputMaterialData of Object.values(inputMaterials)) {
        inputMaterialData.requiredQuantity = Math.floor(
          inputMaterialData.requiredQuantity * constrainedStorageSpaceMultiplier
        )
      }
    }

    // Deduct the number of stored input material units from the required quantity
    for (const [materialName, inputMaterialData] of getRecordEntries(
      inputMaterials
    )) {
      const material = ns.corporation.getMaterial(
        divisionName,
        city,
        materialName
      )
      inputMaterialData.requiredQuantity = Math.max(
        0,
        inputMaterialData.requiredQuantity - material.stored
      )
    }

    // Buy input materials
    for (const [materialName, inputMaterialData] of getRecordEntries(
      inputMaterials
    )) {
      ns.corporation.buyMaterial(
        divisionName,
        city,
        materialName,
        inputMaterialData.requiredQuantity / 10
      )
    }
  })
}

/**
 * @param {NS} ns
 * @param divisionName
 * @param industryData
 * @param city
 * @param useWarehouseSize If false, function uses unused storage size after PRODUCTION state
 * @param ratio
 */
export async function findOptimalAmountOfBoostMaterials(
  ns,
  division,
  industryData,
  city,
  useWarehouseSize,
  ratio
) {
  const warehouseSize = ns.corporation.getWarehouse(division.name, city).size
  if (useWarehouseSize) {
    return getOptimalBoostMaterialQuantities(
      industryData,
      warehouseSize * ratio
    )
  }
  await waitUntilAfterStateHappens(ns, corpState.PRODUCTION)
  const availableSpace =
    ns.corporation.getWarehouse(division.name, city).size -
    ns.corporation.getWarehouse(division.name, city).sizeUsed
  return getOptimalBoostMaterialQuantities(industryData, availableSpace * ratio)
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
export function setSmartSupplyData(ns) {
  // Only set smart supply data after "PURCHASE" state
  if (ns.corporation.getCorporation().prevState !== corpState.PURCHASE) {
    return
  }
  loopAllDivisionsAndCities(ns, (divisionName, city) => {
    const division = ns.corporation.getDivision(divisionName)
    const industrialData = ns.corporation.getIndustryData(division.type)
    const warehouse = ns.corporation.getWarehouse(division.name, city)
    let totalRawProduction = 0

    if (industrialData.makesMaterials) {
      totalRawProduction += getLimitedRawProduction(
        ns,
        division,
        city,
        industrialData,
        warehouse,
        false
      )
    }

    if (industrialData.makesProducts) {
      for (const productName of division.products) {
        const product = ns.corporation.getProduct(
          divisionName,
          city,
          productName
        )
        if (product.developmentProgress < 100) {
          continue
        }
        totalRawProduction += getLimitedRawProduction(
          ns,
          division,
          city,
          industrialData,
          warehouse,
          true,
          product.size
        )
      }
    }

    smartSupplyData.set(
      buildSmartSupplyKey(divisionName, city),
      totalRawProduction
    )
  })
}


/**
 * Custom Market-TA.II script
 *
 * @param {NS} ns
 * @param {DIVISION} division
 * @param {INDUSTRYDATA} industryData
 * @param {CITY} city
 * @param {ITEM} item
 * @returns
 */
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
  let productMarkup = 0;
  let markupLimit = 0;
  let itemMultiplier = 0;
  let marketPrice = 0;
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
