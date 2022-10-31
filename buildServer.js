const os = require('os');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const Metro = require('metro');

const noop = () => { };

const getHash = () => {
    const parts = [os.hostname(), process.pid, +(new Date), Math.random()];
    const hash = crypto.createHash('md5').update(parts.join(''));
    return hash.digest('hex');
}

const httpProxyServer = http.createServer((req, res) => {
    if (req.method !== 'PUT') {
        res.end(JSON.stringify({
            error: 'HTTP Method not supported',
        }));
        return;
    }

    const saveBaseName = 'localtmp/temp_' + getHash();
    const file = fs.createWriteStream(`./${saveBaseName}.js`);
    req.pipe(file);

    file.on('finish', async () => {
        setTimeout(() => {
            const metroReq = http.request({
                host: 'localhost',
                port: '3008',
                path: `/${saveBaseName}.bundle?${req.url.split('?')[1]}`
            }, metroResponse => {
                metroResponse.pipe(res);
                res.on('finish', () => {
                    fs.unlink(`./${saveBaseName}.js`, noop);
                });
            });
            metroReq.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
            metroReq.end();
        }, 100);
    });
});

httpProxyServer.listen(3006);

async function initMetro() {
    const config = await Metro.loadConfig();
    const metroBundlerServer = await Metro.runMetro(config);
    const httpServer = http.createServer((req, res) => {
        metroBundlerServer.processRequest(req, res, noop);
    });
    httpServer.listen(3008);
}

initMetro();
