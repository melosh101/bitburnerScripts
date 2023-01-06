const baseUrl = "https://raw.githubusercontent.com/melosh101/bitburnerScripts/master/src/"
const filesToDownload = [
  'common.js',
  'mainHack.js',
  'spider.js',
  'grow.js',
  'hack.js',
  'weaken.js',
  'playerServers.js',
  'killAll.js',
  'runHacking.js',
  'find.js',
]
const valuesToRemove = ['BB_SERVER_MAP']

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}
/**
 * check if updater should update
 * @param {NS} ns
 * @returns {Boolean} true if it should update
 */
async function shouldUpdate(ns) {
  const versionString = ns.read("version.txt");
  if(versionString === "") return true;
  const currentVersion = JSON.parse(versionString);
  const nextVersion = fetch(`${baseUrl}version.json`).then((res) => res.json())
  if(ns.args[0].toLowerCase() === "-f") {
    ns.write("version.txt", nextVersion.toString());
    return true;
  }
  if(!nextVersion.updaterVersion === undefined || nextVersion.updaterVersion > currentVersion.updaterVersion) throw Exception("please update the updater by rerunning the start.js script from \"https://github.com/melosh101/bitburnerScripts/blob/master/README.md\"")
  if(currentVersion.version > nextVersion.version) {
    await ns.write("version.txt", nextVersion.toString());
    return true;
  }
  return false;

}

/**
 * updater function.
 * also installs if files are missing
 * @param {NS} ns
 */
export async function main(ns) {
  ns.tprint(`[${localeHHMMSS()}] Starting updater`)

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }
  
  if(await !shouldUpdate(ns)) return ns.tprint("no need to update. add -f if you want to force an update");

  for (let i = 0; i < filesToDownload.length; i++) {
    const filename = filesToDownload[i]
    const path = baseUrl + filename
    await ns.scriptKill(filename, 'home')
    await ns.rm(filename)
    await ns.sleep(200)
    ns.tprint(`[${localeHHMMSS()}] Trying to download ${path}`)
    await ns.wget(path + '?ts=' + new Date().getTime(), filename)
  }

  valuesToRemove.map((value) => localStorage.removeItem(value))

  ns.tprint(`[${localeHHMMSS()}] Spawning killAll.js`)
  ns.spawn('killAll.js', 1, 'runHacking.js')
}
