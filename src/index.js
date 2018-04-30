/* global Node, MutationObserver, URL, chrome */

import { findPhoneNumbers, getCountryCallingCode, parseNumber } from 'libphonenumber-js'

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
    let number = parseNumber(node.getAttribute('href').substr(4), country)

    if ('country' in number && 'phone' in number) {
      number = '+' + getCountryCallingCode(number['country']) + number['phone']
    } else {
      number = node.getAttribute('href').substr(4).replace(/\D/g, '')
    }

    node.setAttribute('href', 'https://yodel.io/c/' + number)
    node.setAttribute('title', 'call via yodel.io')
    node.setAttribute('target', '_blank')
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i], country)
    }
  }
}

chrome.storage.sync.get({
  defaultCountry: '',
  blacklist: []
}, function (items) {
  const url = window.location.href
  const domain = new URL(url).hostname
  if (items.blacklist.includes(url) || items.blacklist.includes(domain)) {
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
