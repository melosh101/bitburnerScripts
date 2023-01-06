/**
 * Version typeDef
 * @typedef {Object} Version
 * @property {Number} version - current scripts version
 * @property {Number} updaterVersion - current version of the updater script
 */



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
var downloadedVersion = 0;

/**
 * 
 * @param {NS} ns 
 * @returns {Version | undefined} the currently installed version in game
 */
function getCurretVersion(ns) {
  try {
    var toReturn = JSON.parse(ns.read("version.txt"));
    ns.tprint(toReturn)
    return toReturn
  } catch (error) {
    return undefined;
  }
} 

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
  
  const currentVersion = getCurretVersion(ns);
  const nextVersion = await fetch(`${baseUrl}version.json`).then((res) => res.json())
  if(nextVersion === undefined) throw Exception("could fetch latest version");
  downloadedVersion = nextVersion.version;
  if(currentVersion === undefined) {
    ns.write("version.txt", nextVersion.toString(), "w");
  }
  if(ns.args[0] && ns.args[0].toLowerCase() === "-f") {
    ns.write("version.txt", nextVersion.toString(), "w");
    return true;
  }
  if(!nextVersion.updaterVersion === undefined || nextVersion.updaterVersion >= currentVersion.updaterVersion) throw Exception("please update the updater by rerunning the start.js script from \"https://github.com/melosh101/bitburnerScripts/blob/master/README.md\"")
  if(currentVersion.version > nextVersion.version) {
    ns.write("version.txt", nextVersion.toString(), "w");
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
  const {commit: {message}} = await fetch("https://api.github.com/repos/melosh101/bitburnerscripts/commits/master").then((res) => res.json())
  ns.tprint(`now downloading script version: ${downloadedVersion}`)
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
