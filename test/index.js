const myConfig = require('../.gtokens.json').web
const GoogleDocToJSON = require('./../index')
const gDocToJSON = new GoogleDocToJSON(myConfig)

const fileId = '1gTERIVPV_0yoMXc6mlBtBpNvaoH5pIU2IC-75V_Qcas'
const { oAuthTokens } = myConfig

gDocToJSON.getArchieML({ fileId, oAuthTokens }, (err, aml) => {
  console.log('## AML', err, aml)
})
