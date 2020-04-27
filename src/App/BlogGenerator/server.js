const http = require('http');
const { createFsFromVolume, Volume } = require('memfs');
const helpers = require('./helpers');
const path = require('path');
const internalIp = require('internal-ip');

const ASSETS_EXT_REGEX = /\.(css|js|png|jpg|gif)$/;
const CONTENT_TYPES = {
    html: 'text/html; charset=utf-8',
    css: 'text/css; charset=utf-8',
    js: 'text/javascript; charset=utf-8',
    png: 'image/png',
    jpg: 'image/jpg',
    gif: 'image/gif',
};
const port = process.env.PORT;

const blogFileStructurePromise = helpers.generateBlogFileStructureFromDir(
    __dirname + '/blogSamples/blogWithFiles',
    {
        env: 'development',
    }
);

blogFileStructurePromise.then((blogFileStructure) => {
    const outputBlogDir = '/';
    const memfs = createFsFromVolume(new Volume());

    Object.keys(blogFileStructure).forEach((filePath) => {
        const { encoding, content } = blogFileStructure[filePath];
        const absFilePath = path.join(outputBlogDir, filePath);

        memfs.mkdirSync(
            absFilePath
                .split('/')
                .slice(0, absFilePath.split('/').length - 1)
                .join('/'),
            { recursive: true }
        );

        memfs.writeFileSync(absFilePath, content, encoding);
    });

    http.createServer((req, res) => {
        const reqUrl = req.url;

        if (ASSETS_EXT_REGEX.test(reqUrl)) {
            const ext = reqUrl.match(ASSETS_EXT_REGEX)[1];

            res.writeHead(200, { 'Content-Type': CONTENT_TYPES[ext] });

            try {
                res.write(memfs.readFileSync(reqUrl));
                res.end();
            } catch (e) {
                res.writeHead(500);
                res.end();
            }

            return;
        }

        if (!/\/$/.test(reqUrl)) {
            res.writeHead(302, { Location: reqUrl + '/' });
            res.end();

            return;
        }

        const content = ['/index.html'].reduce((prev, el) => {
            try {
                if (!prev) {
                    return memfs.readFileSync(path.join(reqUrl, el));
                }
            } catch (e) {}

            return prev;
        }, null);

        if (content) {
            res.writeHead(200, {
                'Content-Type': CONTENT_TYPES.html,
            });
            res.write(content);
            res.end();
        } else {
            res.writeHead(404);
            res.write('Not found');
            res.end();
        }
    }).listen(port, () => {
        const internalIPv4 = internalIp.v4.sync();
        console.log(helpers.prettyPrintBlogFileStructure(blogFileStructure));
        console.log(`Listening in localhost:${port}`);
        console.log(`Listening in ${internalIPv4}:${port}`);
    });
});
