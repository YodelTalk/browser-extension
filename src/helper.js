import { getCountryCallingCode, parseNumber } from 'libphonenumber-js'

export function parseNumberOrStripChars (input, country) {
  let number = parseNumber(input, country)

  if ('country' in number && 'phone' in number) {
    number = '+' + getCountryCallingCode(number['country']) + number['phone']
  } else {
    number = input.replace(/\D/g, '')
  }

  return number
}
