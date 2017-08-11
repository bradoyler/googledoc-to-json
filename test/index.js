const myConfig = require('../config.json').google
const GoogleDocToJSON = require('./../index')
const gDocToJSON = new GoogleDocToJSON(myConfig)

const fileId = '1gTERIVPV_0yoMXc6mlBtBpNvaoH5pIU2IC-75V_Qcas'
const { oAuthTokens } = myConfig

gDocToJSON.getArchieML({ fileId, oAuthTokens }, function (err, aml) {
  console.log('## AML', err, aml)
})
