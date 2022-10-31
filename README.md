# rn-bundle-proxy
React native bundler proxy for testing purpose

Start server by,

`npm start`

And run bundling request by http file upload eg using curl,

```
curl --upload-file ./filetobudle.js "http://localhost:3006/index.bundle?dev=true&platform=ios"
```
