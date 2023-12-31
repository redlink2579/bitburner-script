/** @param {NS} ns */
export async function main(ns) {
  const works = JSON.parse(ns.args[0])
  const target = ns.args[1]
  let weakentime = ns.args[2]
  let endtime = ns.args[3]
  const dataport = ns.getPortHandle(ns.args[4])
  const port = ns.getPortHandle(ns.pid)
  let delay = endtime - Date.now() - weakentime

  if (delay < 0) {
    ns.tprint(`WARN: ${works.job} was ${-delay} ms late, expect runing time was:, ${ns.tFormat(weakentime)}`)
    port.write(-delay)
    delay = 0
  } else {
    ns.tprint(`INFO: Running ${works.job} at ${target} for: ${ns.tFormat(weakentime + delay)}`)
    port.write(0)
  }
  const secreduce = await ns.weaken(target, { additionalMsec: delay })
  ns.write("logging.txt", "sec-reduce = " + secreduce + "\n", "a")

  const end = Date.now
  ns.atExit(() => {
    if (works.report) { dataport.write(works.job, end) }
    ns.tprint(`SUCCESS: Batch ${works.job} has finished at  ${new Date().toLocaleTimeString()}`)
  })
}
