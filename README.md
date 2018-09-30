# googledoc-to-json

Node.js library to read a Google Drive Doc and convert to JSON (via ArchieML)

## Install
```
npm install googledoc-to-json --save
```

## Examples

### CLI
```
$ npm install -g googledoc-to-json
$ googledoc-to-json <doc-id> -c .gtokens.json -o output.json
```

### API
```javascript
const GoogleDocToJSON = require('googledoc-to-json');
const config = require('./config.json'); // see 'Getting Credentials' below
const gDocToJSON = new GoogleDocToJSON(config);

const options = {
    fileId: '1gTERIVPV_0yoMXc6mlBtBpNvaoH5pIU2IC-75V_Qcas',
    oAuthTokens: config.oAuthTokens
};

gDocToJSON.getArchieML(options, function (err, aml) {
    console.log('## ArchieML output', err, aml);
});
```

## Getting credentials

1. `cp .gtokens.example.json .gtokens.json`
1. Run the amazing [Google-Tokens](https://github.com/bradoyler/google-tokens)
1. Populate `.gtokens.json` with appropriate values

## Todos:
- Add Mocha tests
