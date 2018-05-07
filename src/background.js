/* global chrome */

import { parseNumberOrStripChars } from './helper'

let country = ''

function call (item) {
  const number = parseNumberOrStripChars(item.selectionText, country)
  chrome.tabs.create({ url: 'https://yodel.io/c/' + number })
}

chrome.extension.onRequest.addListener(function (request) {
  if (request.cmd === 'create_menu') {
    chrome.contextMenus.removeAll(function () {
      chrome.contextMenus.create({
        title: 'Call ' + request.number + ' with yodel.io',
        id: 'call-yodel',
        contexts: ['selection'],
        onclick: call
      })
    })
  } else if (request.cmd === 'delete_menu') {
    chrome.contextMenus.removeAll()
  }
})

chrome.storage.sync.get({
  defaultCountry: '',
  blacklist: []
}, function (items) {
  country = items.defaultCountry
})
