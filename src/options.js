function saveOptions () {
  var country = document.getElementById('country').checked
  chrome.storage.sync.set({
    defaultCountry: country ? 'US' : null
  }, function () { })
}

function restoreOptions () {
  chrome.storage.sync.get({
    defaultCountry: defaultCountry
  }, function (items) {
    document.getElementById('country').checked = items.defaultCountry === 'US'
  })
}

let defaultCountry = null
if (window.navigator.languages && window.navigator.languages.includes('en-US')) {
  defaultCountry = 'US'
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.querySelector('form').addEventListener('change', saveOptions)
