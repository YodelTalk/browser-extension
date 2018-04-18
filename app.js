import { findPhoneNumbers, getCountryCallingCode, parseNumber } from 'libphonenumber-js'

function replaceText (node) {
  if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
    if (node.parentNode.nodeName === 'TEXTAREA') {
      return
    }

    let content = node.textContent
    let numbers = findPhoneNumbers(content)

    for (let i = 0; i < numbers.length; i++) {
      let linkText = content.substr(numbers[i]['startsAt'], numbers[i]['endsAt'] - numbers[i]['startsAt'])
      let countryCode = getCountryCallingCode(numbers[i]['country'])

      let link = document.createElement('a')
      link.setAttribute('href', 'https://yodel.io/c/' + countryCode + numbers[i]['phone'])
      link.setAttribute('target', '_blank')
      link.setAttribute('title', 'call via yodel.io')
      link.appendChild(document.createTextNode(linkText))

      let beforeText = content.substr(0, numbers[i]['startsAt'])
      let afterText = content.substr(numbers[i]['endsAt'])

      let replace = document.createElement('span')
      replace.setAttribute('class', 'yodel-replaced-link')
      replace.append(beforeText, link, afterText)
      node.parentNode.insertBefore(replace, node)
      node.parentNode.removeChild(node)
    }
  } else if (
    node.nodeType === Node.ELEMENT_NODE &&
    node.tagName === 'A' && node.getAttribute('href') &&
    node.getAttribute('href').substr(0, 4) === 'tel:'
  ) {
    let number = parseNumber(node.getAttribute('href').substr(4))

    if ('country' in number && 'phone' in number) {
      number = getCountryCallingCode(number['country']) + number['phone']
    } else {
      number = node.getAttribute('href').substr(4).replace(/\D/g, '')
    }

    node.setAttribute('href', 'https://yodel.io/c/' + number)
    node.setAttribute('title', 'call via yodel.io')
    node.setAttribute('target', '_blank')
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i])
    }
  }
}

// Start from body
replaceText(document.body)

// Observe changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (
      mutation.addedNodes &&
      mutation.addedNodes.length > 0 &&
      mutation.addedNodes[0].getAttribute('class') !== 'yodel-replaced-link'
    ) {
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const newNode = mutation.addedNodes[i]
        replaceText(newNode)
      }
    }
  })
})
observer.observe(document.body, {
  childList: true,
  subtree: true
})
