# Yodel Chrome Extension

## Installation

```sh
npm install
```

## Usage

```sh
npm start
npm run build
```

## Publish a new version

```sh
npm version patch # can be minor or major as well
npm run build:chrome
npm run build:firefox
```

Upload the `dist.zip` to [Chrome Webstore](https://chrome.google.com/webstore/developer/dashboard)
Upload the `.zip` from `web-ext-artifacts` to [Mozilla Addons](https://addons.mozilla.org/en-US/developers/addon/yodel-phone-system/versions/submit/)
