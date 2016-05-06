# googledoc-to-json

Node.js library to read a Google Drive Doc and convert to JSON (via ArchieML)

### This is a work-in-progress.

## Install
```
npm install googledoc-to-json --save
```

## Example

see 'test' folder

 or run:
 ```
 $ npm test
 ```

## CLI
```
$ npm install -g googledoc-to-json
$ googledoc-to-json <doc-id> -c config.json -o output.json
```

### Getting credentials

1. Got to https://console.developers.google.com
2. Create an account
3. In the right sidebar click `Credentials`
4. Then click `Create credentials`, select `oAuth client ID`, select `Web application`
6. Name your Web Application
7. Enter `https://developers.google.com/oauthplayground/` as an authorized redirect URLs
8. Have your `Client ID` and `Client secret` ready
9. Go to [https://developers.google.com/oauthplayground/](https://developers.google.com/oauthplayground/)
10. Under `Step 1` authorize all `Dirve API v3`
11. Click the Gear button in upper right of the page and check `Use your own OAuth credentials`
13. Enter your `Client ID` and `Client secret`
14. Click `Authorize APIs`
15. Then request auth tokens, grab generated the refresh token.
16. Create a `config.json` in your project with your info:
```json
{
  "google": {
    "client_id": “yourID”,
    "client_secret": “yourSecret”,
    "oAuthTokens":{"refresh_token": “yourRefreshToken”},
    "redirect_urls":["http://localhost:####"]
  }
} 
```

## Todos:
- Add Mocha tests
