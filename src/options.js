/* global URL, chrome */

function saveOptions () {
  chrome.storage.sync.get({
    defaultCountry: '',
    blacklist: []
  }, function (items) {
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
      let url = tabs[0].url
      let domain = new URL(url).hostname
      let blacklist = items.blacklist
      let country = document.getElementById('default-country').value

      if (document.getElementById('blacklist-site').checked && !blacklist.includes(url)) {
        blacklist.push(url)
      }

      if (!document.getElementById('blacklist-site').checked && blacklist.includes(url)) {
        blacklist.splice(blacklist.indexOf(url))
      }

      if (document.getElementById('blacklist-domain').checked && !blacklist.includes(domain)) {
        blacklist.push(domain)
      }

      if (!document.getElementById('blacklist-domain').checked && blacklist.includes(domain)) {
        blacklist.splice(blacklist.indexOf(domain))
      }

      chrome.storage.sync.set({
        defaultCountry: country,
        blacklist: blacklist
      }, function () { })

      document.getElementById('note').style.display = 'block'
      document.getElementById('note').onclick = function () { chrome.tabs.reload(tabs[0].id); window.close() }
    })
  })
}

function restoreOptions () {
  chrome.storage.sync.get({
    defaultCountry: '',
    blacklist: []
  }, function (items) {
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
      let url = tabs[0].url
      let domain = new URL(url).hostname
      let blacklist = items.blacklist
      document.getElementById('default-country').value = items.defaultCountry
      document.getElementById('blacklist-site').checked = blacklist.includes(url)
      document.getElementById('blacklist-domain').checked = blacklist.includes(domain)
    })
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.querySelector('form').addEventListener('change', saveOptions)
