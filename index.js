const archieml = require('archieml')
const htmlparser = require('htmlparser2')
const { AllHtmlEntities } = require('html-entities')
const url = require('url')
const google = require('googleapis')

function gDocToJSON ({ redirect_urls: redirects, client_id: id, client_secret: secret }) {
  if (!id || !secret) {
    throw new Error('Missing client_id or client_secret')
  }

  const { OAuth2 } = google.auth
  const redirectUrls = (redirects && redirects[0]) ? redirects[0] : ['']
  this.oauth2Client = new OAuth2(id, secret, redirectUrls)
  this.gDrive = google.drive({ version: 'v3', auth: this.oauth2Client })
}

gDocToJSON.prototype.getArchieML = function ({ fileId, oAuthTokens }, callback) {
  this.oauth2Client.setCredentials(oAuthTokens)

  this.gDrive.files.export({
    fileId,
    mimeType: 'text/html'
  }, function (err, docHtml) {
    if (err) {
      return callback(err)
    }

    const handler = new htmlparser.DomHandler(function (error, dom) {
      if (error) {
        console.error('(DomHandler)', error)
      }
      const tagHandlers = {
        _base: function (tag) {
          let str = ''
          tag.children.forEach(function (child) {
            const transform = tagHandlers[child.name || child.type]
            if (transform) {
              str += transform(child)
            }
          })
          return str
        },
        text: function (textTag) {
          return textTag.data
        },
        span: function (spanTag) {
          return tagHandlers._base(spanTag)
        },
        p: function (pTag) {
          return tagHandlers._base(pTag) + '\n'
        },
        a: function (aTag) {
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
        li: function (tag) {
          return '* ' + tagHandlers._base(tag) + '\n'
        }
      };

      ['ul', 'ol'].forEach(function (tag) {
        tagHandlers[tag] = tagHandlers.span
      });
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function (tag) {
        tagHandlers[tag] = tagHandlers.p
      })

      const body = dom[0].children[1]
      let parsedText = tagHandlers._base(body)

      // Convert html entities into the characters as they exist in the google doc
      const entities = new AllHtmlEntities()
      parsedText = entities.decode(parsedText)

      // Remove smart quotes from inside tags
      parsedText = parsedText.replace(/<[^<>]*>/g, function (match) {
        return match.replace(/”|“/g, '"').replace(/‘|’/g, "'")
      })

      const parsed = archieml.load(parsedText)
      callback(null, parsed)
    })

    const parser = new htmlparser.Parser(handler)
    parser.write(docHtml)
    parser.done()
  })
}

gDocToJSON.prototype.getFileInfo = function getFileInfo ({ oAuthTokens, fileId }, callback) {
  this.oauth2Client.setCredentials(oAuthTokens)
  this.gDrive.files.get({ fileId }, function (err, doc) {
    callback(err, doc)
  })
}

module.exports = gDocToJSON
