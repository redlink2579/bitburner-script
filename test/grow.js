/** @param {NS} ns */
export async function main(ns) {
  const works =  JSON.parse(ns.args[0])
  const target = ns.args[1]
  let growtime = ns.args[3]
  const port = ns.getPortHandle(ns.pid)
  const startTime = Date.now();
  const endTime = Date.now() + (ns.getWeakenTime(target) * 0.8);
  let timeElapsed = Date.now() - startTime;
  let delay = endTime - growtime + works.delay - Date.now()
  if (delay < 0) {
    ns.tprint("WARNING: ", works.job, " was ", ns.tFormat(-delay), " late ", ns.tFormat(growtime))
    port.write(-delay)
    delay = 0
  } else {
    ns.tprint("Running ", works.job, " at ", target, " for:", ns.tFormat(growtime))
    await ns.grow(target, { additionalMsec: delay })
  }

  const end = Date.now
  ns.atExit(() =>
    port.write(works, end),
    ns.tprint("Successfully run ", works.job, " at:", target)
  )
}
