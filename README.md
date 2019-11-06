# Yodel Click to Call Browser Extension

<center>
  <a href="https://chrome.google.com/webstore/detail/yodelio-business-phone-sy/nmhjelifgdhoklhnbpehfigiikmiihjc"><img src=".github/chrome.png" /></a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/yodel-phone-system/"><img src=".github/firefox.png" /></a>
</center>

## Installation

```sh
npm install
```

## Build and publish a new version for Google Chrome

```sh
npm version (patch|minor|major)
npm run build:firefox
```

Upload the `dist.zip` to [Chrome Webstore](https://chrome.google.com/webstore/developer/dashboard).

## Build and publish a new version for Firefox

```sh
npm version (patch|minor|major)
npm run build:firefox
```

Upload the `.zip` from `web-ext-artifacts` to [Mozilla Addons](https://addons.mozilla.org/en-US/developers/addon/yodel-phone-system/versions/submit/).

# License

[The MIT license](./LICENSE)
