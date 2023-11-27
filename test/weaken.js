/** @param {NS} ns */
export async function main(ns) {
  const works = ns.args[0]
  const target = ns.args[1]
  let weakentime = ns.args[2]
  let delay = works.delay
  const port = ns.getPortHandle(ns.pid)
  delay = works.delay * 5
  if (weakentime - Date.now < -delay) {
    ns.tprint("!!WARNING!!:", works.job, " was " , ns.tFormat(-delay, true), "ms late, ", weakentime)
    port.write(-delay)
    delay = 0
  } else {
    await ns.weaken(target , { additionalMsec: delay })
    const end = Date.now
  }

  ns.atExit(() => 
  ns.tprint ("Batch ", works.job, " has finished at ", ns.tFormat(end))
  )
}
