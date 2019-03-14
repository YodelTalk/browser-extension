/* global Node, MutationObserver, URL, chrome */

import { findPhoneNumbers, getCountryCallingCode } from 'libphonenumber-js'
import { parseNumberOrStripChars } from './helper'

function openPopup (event, element) {
  event.preventDefault()
  let x = (window.screenX || window.screenLeft || 0) + 50
  let y = (window.screenY || window.screenTop || 0) + 50
  window.open(element.href, 'yodelPhonePopup', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=601,height=700,left=' + x + ',top=' + y)
};

function replaceText (node, country) {
  if (node.nodeType === Node.TEXT_NODE && node.parentNode !== null) {
    const skipNodeNames = [
      'TEXTAREA',
      'STYLE',
      'SCRIPT'
    ]
    if (skipNodeNames.includes(node.parentNode.nodeName)) {
      return
    }

    let content = node.textContent
    const numbers = findPhoneNumbers(content, country)

    if (numbers.length === 0) {
      return
    }

    let position = 0
    let replace = document.createElement('span')
    replace.setAttribute('class', 'yodel-replaced-link')

    for (let i = 0; i < numbers.length; i++) {
      // text before found number
      replace.appendChild(document.createTextNode(content.substr(position, numbers[i]['startsAt'] - position)))

      // replace text with link
      const linkText = content.substr(numbers[i]['startsAt'], numbers[i]['endsAt'] - numbers[i]['startsAt'])
      if (node.parentNode.nodeName === 'A' && linkText === content) {
        replace.appendChild(document.createTextNode(linkText))
      } else {
        const countryCode = '+' + getCountryCallingCode(numbers[i]['country'])

        let link = document.createElement('a')
        link.setAttribute('href', 'https://yodel.io/c/' + countryCode + numbers[i]['phone'])
        link.setAttribute('target', '_blank')
        link.setAttribute('title', 'call via yodel.io')
        link.onclick = function (e) { openPopup(e, this) }
        link.appendChild(document.createTextNode(linkText))
        replace.appendChild(link)
      }

      position = numbers[i]['endsAt']
    }

    // text after last number
    replace.appendChild(document.createTextNode(content.substr(position)))

    // replace text with new element containing links
    node.parentNode.insertBefore(replace, node)
    node.parentNode.removeChild(node)
  } else if (
    node.nodeType === Node.ELEMENT_NODE &&
    node.nodeName === 'A' && node.getAttribute('href') &&
    node.getAttribute('href').substr(0, 4) === 'tel:'
  ) {
    node.setAttribute('href', 'https://yodel.io/c/' + parseNumberOrStripChars(node.getAttribute('href').substr(4), country))
    node.setAttribute('title', 'call via yodel.io')
    node.setAttribute('target', '_blank')
    node.onclick = function (e) { openPopup(e, this) }
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i], country)
    }
  }
}

let blacklist = [
  'yodel.io',
  'manage.yodel.io',
  'yodeldev.net',
  'manage.yodeldev.net',
  'localhost',
  '0.0.0.0',
  '127.0.0.1'
]
chrome.storage.sync.get({
  defaultCountry: '',
  blacklist: []
}, (items) => {
  // Context menu
  document.addEventListener('selectionchange', (event) => {
    const selection = window.getSelection().toString()
    const number = parseNumberOrStripChars(selection, items.defaultCountry)
    if (number.length > 0) {
      chrome.runtime.sendMessage({ cmd: 'create_menu', number: number })
    } else {
      chrome.runtime.sendMessage({ cmd: 'delete_menu' })
    }
  }, true)

  const url = window.location.href
  const domain = new URL(url).hostname
  blacklist = blacklist.concat(items.blacklist)
  if (blacklist.includes(url) || blacklist.includes(domain)) {
    return
  }

  // Start from body
  replaceText(document.body, items.defaultCountry)

  // Observe changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.addedNodes &&
        mutation.addedNodes.length > 0 &&
        mutation.addedNodes[0].nodeType === Node.ELEMENT_NODE &&
        mutation.addedNodes[0].getAttribute('class') !== 'yodel-replaced-link'
      ) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const newNode = mutation.addedNodes[i]
          replaceText(newNode, items.defaultCountry)
        }
      }
    })
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})
