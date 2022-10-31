#!/usr/bin/env node

// run this command by
// cat fileToTranspile.js | node build.js > output.js     

// patch logs in node_modules/metro/src/shared/output/bundle.flow.js
// with a noop const log = () => {}; and remove log passed in function saveBundleAndMap
// this should be fixed from metro

const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const Metro = require('metro');

const parts = [os.hostname(), process.pid, +(new Date)];
const hash = crypto.createHash('md5').update(parts.join(''));
const uuid = hash.digest('hex');

const tempInputFileName = `temp_in_${uuid}.js`;
const tempOutputFileName = `temp_out_${uuid}.js`;

fs.writeFileSync(tempInputFileName, fs.readFileSync(0).toString());

async function metroBuild() {
    const config = await Metro.loadConfig();
    await Metro.runBuild(config, { 
        entry: tempInputFileName,
        platform: 'ios',
        minify: false,
        out: tempOutputFileName
    });
}

metroBuild().then(() => {
    console.clear();
    console.log(fs.readFileSync(tempOutputFileName).toString());
    fs.unlinkSync(tempInputFileName);
    fs.unlinkSync(tempOutputFileName);
});
