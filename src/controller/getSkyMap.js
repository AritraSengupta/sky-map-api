const axios = require('axios');
const sharp = require("sharp");
const fs = require('fs');
var exec = require('child_process').exec;

async function getMetadata(filePath) {
  try {
    const width = 1200;
    const height = width * 1.414;
    const text = "The night sky";

    const svgBackground = `
    <svg>
      <style>
      .title { fill: #ffffff; font-size: 70px; font-weight: bold;}
      </style>
      <g>
        <rect x="0" y="0" width="${width}" height="${height}" fill="black"></rect>
        <text x="0" y="${height - 100}" class="title">The Night Sky</text>
      </g>
    </svg>
    `;

    const svgBackgroundBuffer = Buffer.from(svgBackground);
    const imageBackground = await sharp(svgBackgroundBuffer)
      .composite([
        {
          input: filePath,
          top: 0,
          left: 0,
        },
      ])
      .tint({ r: 255, g: 240, b: 16 })
      .sharpen()
      .toFile("grayscale.png");
  } catch (error) {
    console.log(error);
  }
}

const getSkyMap = async (req, res, next) => {
  console.log(req.query);
  const {
    date,
    jd,
    ns,
    lat,
    lon,
    ew,
  } = req.query;
  // const date = '2022-07-04+12%3A26%3A10';
  // const jd = '2459765.01817';
  // const lat = '5%B012%27';
  // const lon = '4%B030%27';
  const baseUrl = 'https://www.fourmilab.ch';

  // get some posts
  let result = await axios.get(`${
    baseUrl
  }/cgi-bin/Yoursky?date=1
  &utc=${
    date
  }&jd=${
    jd
  }&lat=${
    lat
  }&ns=${
    ns
  }&lon=${
    lon
  }&ew=${
    ew
  }
  &deepm=2.5
  &consto=on
  &limag=5.5
  &starnm=2.0
  &starbm=2.5
  &imgsize=1024
  &fontscale=1.0
  &scheme=2
  &elements=`);
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