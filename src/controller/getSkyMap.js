const axios = require('axios');
const sharp = require("sharp");
const fs = require('fs');
var exec = require('child_process').exec;

async function getMetadata(filePath) {
  await sharp(filePath)
    .tint({ r: 255, g: 240, b: 16 })
    .sharpen()
    .toFile("grayscale.png");
}

const getSkyMap = async (req, res, next) => {
  console.log(req.query);
  const date = '2022-07-04+12%3A26%3A10';
  const jd = '2459765.01817';
  const lat = '5%B012%27';
  const lon = '4%B030%27';
  const baseUrl = 'https://www.fourmilab.ch';

  // get some posts
  let result = await axios.get(`${baseUrl}/cgi-bin/Yoursky?date=1&utc=${date}&jd=${jd}&lat=${lat}&ns=North&lon=${lon}&ew=West&deepm=2.5&consto=on&limag=5.5&starnm=2.0&starbm=2.5&imgsize=1024&fontscale=1.0&scheme=2&elements=`);
  const extract = result.data
  const match = extract.match(/"\/cgi-bin\/Yoursky\?di=.*" usemap/);
  const removeFirst = match[0].replace('\"', '');
  const final = removeFirst.replace('" usemap', '');
  exec(`curl ${baseUrl}${final} --output test.gif`, async (error, stdout, stderr) => {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    await getMetadata('test.gif');
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    return res.sendFile('/home/asengupta/Documents/sky-map-api/grayscale.png');
  });
  
};

module.exports = {
  getSkyMap
};