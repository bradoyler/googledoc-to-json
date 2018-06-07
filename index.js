const archieml = require('archieml')
const htmlparser = require('htmlparser2')
const { AllHtmlEntities } = require('html-entities')
const url = require('url')
const { google } = require('googleapis')

function gDocToJSON ({ redirect_uris: redirects, client_id: id, client_secret: secret }) {
  if (!id || !secret) {
    throw new Error('Missing client_id or client_secret')
  }

  const redirectUrls = (redirects && redirects[0]) ? redirects[0] : ['']
  this.oAuth2Client = new google.auth.OAuth2(id, secret, redirectUrls)
  this.gDrive = google.drive({ version: 'v3', auth: this.oAuth2Client })
}

gDocToJSON.prototype.getArchieML = function ({ fileId, oAuthTokens, mimeType = 'text/html' }, callback) {
  this.oAuth2Client.setCredentials(oAuthTokens)
  this.gDrive.files.export({ fileId, mimeType }, (err, response) => {
    if (err) {
      return callback(err)
    }

    const docHtml = response.data

    const handler = new htmlparser.DomHandler((error, dom) => {
      if (error) {
        console.error('(DomHandler)', error)
      }
      const tagHandlers = {
        _base: (tag) => {
          let str = ''
          tag.children.forEach(function (child) {
            const transform = tagHandlers[child.name || child.type]
            if (transform) {
              str += transform(child)
            }
          })
          return str
        },
        text: (textTag) => {
          return textTag.data
        },
        span: (spanTag) => {
          return tagHandlers._base(spanTag)
        },
        p: (pTag) => {
          return tagHandlers._base(pTag) + '\n'
        },
        a: (aTag) => {
          let { href } = aTag.attribs
          if (href === undefined) return ''
          // extract real URLs from Google's tracking
          // from: http://www.google.com/url?q=http%3A%2F%2Fwww.nytimes.com...
          // to: http://www.nytimes.com...
          if (aTag.attribs.href && url.parse(aTag.attribs.href, true).query && url.parse(aTag.attribs.href, true).query.q) {
            href = url.parse(aTag.attribs.href, true).query.q
          }

          let str = '<a href="' + href + '">'
          str += tagHandlers._base(aTag)
          str += '</a>'
          return str
        },
        li: (tag) => {
          return '* ' + tagHandlers._base(tag) + '\n'
        }
      }

      const listTags = ['ul', 'ol']
      listTags.forEach((tag) => {
        tagHandlers[tag] = tagHandlers.span
      })

      const hTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      hTags.forEach((tag) => {
        tagHandlers[tag] = tagHandlers.p
      })

      const body = dom[0].children[1]
      const parsedText = tagHandlers._base(body)

      // Convert html entities into the characters as they exist in the google doc
      const entities = new AllHtmlEntities()
      const decodedText = entities.decode(parsedText)

      // Remove smart quotes from inside tags
      const cleanText = decodedText.replace(/<[^<>]*>/g, (match) => {
        return match.replace(/”|“/g, '"').replace(/‘|’/g, "'")
      })

      const aml = archieml.load(cleanText)
      callback(null, aml)
    })

    const parser = new htmlparser.Parser(handler)
    parser.write(docHtml)
    parser.done()
  })
}

gDocToJSON.prototype.getFileInfo = function getFileInfo ({ oAuthTokens, fileId }, callback) {
  this.oAuth2Client.setCredentials(oAuthTokens)
  this.gDrive.files.get({ fileId }, (err, doc) => callback(err, doc))
}

module.exports = gDocToJSON
