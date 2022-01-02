const fs = require("fs/promises");
const { buffer } = require("buffer");
const papa = require("papaparse");

const INFO_FILE_PATH = "./signIn.csv";
const EXP_DIR = "D:\\peng cheng\\SDUicloudCache\\王玉春\\可视化-2021秋季";
const OUTPUT_FILE_PATH = "./exp.csv";
const ID_HEADER = "学号";
const NAME_HEADER = "姓名";
const EXP_CHECKER = /^(\d*)_([^_]*)_(.*)/; // "202015081_小明_xxxxxxx"
//const Proj_CHECKER = /^(\d*)_([^_]*)_(.*)/; // "小明 小红 小刚"
//const result = EXP_CHECKER.exec("20201_你好_qweqw");
//console.log(result);

checkExperiments(
  INFO_FILE_PATH,
  EXP_DIR,
  OUTPUT_FILE_PATH,
  ID_HEADER,
  NAME_HEADER,
  EXP_CHECKER
);

/**
 *
 * @param {string} infoFilePath
 * @param {string} expFileDir
 * @param {string} outputFilePath
 * @param {string} idHeader
 * @param {string} nameHeader
 * @param {RegExp} expChecker
 */
async function checkExperiments(
  infoFilePath,
  expFileDir,
  outputFilePath,
  idHeader,
  nameHeader,
  expChecker
) {
  const dataString = await fs.readFile(infoFilePath, { encoding: "utf-8" });
  const signInData = papa.parse(dataString).data;
  let expData = extractBaseInfo(signInData, idHeader, nameHeader);
  const expNames = await fs.readdir(expFileDir);
  for (const expName of expNames) {
    if (!expName.startsWith("大作业"))
      await checkExperiment(
        expData,
        expName,
        `${expFileDir}\\${expName}`,
        expChecker
      );
  }
  saveData(expData, outputFilePath);
}

/**
 * Pure function
 * Extract id and name infomation from data
 * @param {string[][]} data
 */
function extractBaseInfo(data, idHeader, nameHeader) {
  const headers = data[0];
  // const contents = data.slice[1];
  const idPos = headers.indexOf(idHeader);
  const namePos = headers.indexOf(nameHeader);
  return data.map((entry) => [entry[idPos], entry[namePos]]);
}

/**
 *
 * @param {string[][]} data
 * @param {string} expName
 * @param {string} expPath
 * @param {RegExp} stuChecker
 */
async function checkExperiment(data, expName, expDir, stuChecker) {
  const files = await fs.readdir(expDir);
  if (!files) return;
  data[0].push(expName);
  const ids = files
    .map((file) => {
      //console.log(file);
      const groups = stuChecker.exec(file);
      return groups ? (groups.length > 1 ? groups[1] : "-1") : "-1";
    })
    .filter((id) => id !== "-1");
  for (let i = 1; i < data.length; ++i) {
    const entry = data[i];
    const id = entry[0];
    if (ids.indexOf(id) !== -1) entry.push("1");
    else entry.push("");
  }
  //return data;
}

/**
 *
 * @param {string[][]} data
 * @param {string} path
 */
async function saveData(data, path) {
  //console.log(data);
  const dataCSVString = data.map((entry) => entry.join(",")).join(`
`);
  //console.log(dataCSVString);
  fs.writeFile(path, dataCSVString, { encoding: "utf-8" });
}
