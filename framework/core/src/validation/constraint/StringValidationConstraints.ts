/**
 * String validation constraints.
 */
export type StringValidationConstraints = {

  /**
   * Checks if the string not longer than given length.
   */
  maxLength?: number

  /**
   * Checks if the string not shorter than given length.
   */
  minLength?: number

  /**
   * Checks if the string is exactly given length.
   */
  length?: number

  /**
   * Checks if the string contains the seed.
   */
  contains?: string

  /**
   * Check if the string matches the comparison.
   */
  equals?: string

  /**
   * Checks if a string is base32 encoded.
   */
  isBase32?: boolean

  /**
   * Checks if a string is base64 encoded.
   */
  isBase64?: boolean

  /**
   * Checks if a string is a BIC (Bank Idenfication Code) or SWIFT code.
   */
  isBIC?: boolean

  /**
   * Checks if the string is a credit card.
   */
  isCreditCard?: boolean

  /**
   * Checks if the string is a valid currency amount.
   */
  isCurrency?: boolean

  /**
   * Checks if the string represents a decimal number, such as 0.1, .3, 1.1, 1.00003, 4.0, etc.
   */
  isDecimal?: boolean

  /**
   * Checks if the string is an email.
   */
  isEmail?: boolean

  /**
   * Checks if the string has a length of zero.
   */
  isEmpty?: boolean

  /**
   * Checks if the string is a fully qualified domain name (e.g. domain.com).
   */
  isFQDN?: boolean

  /**
   * Checks if the string is a hash of type algorithm.
   */
  isHash?: 'md4' | 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'ripemd128' | 'ripemd160' | 'tiger128' | 'tiger160' | 'tiger192' | 'crc32' | 'crc32b'

  /**
   * Checks if the string is a hexadecimal color.
   */
  isHexColor?: boolean

  /**
   * Checks if the string is a hexadecimal number.
   */
  isHexadecimal?: boolean

  /**
   * Checks if the string is a valid identity card code.
   */
  isIdentityCard?: boolean | any[]

  /**
   * Checks if the string is an IP (version 4 or 6).
   */
  isIP?: boolean | 4 | 6

  /**
   * Checks if the string is an IP Range(version 4 only).
   */
  isIPRange?: boolean | 10 | 13

  /**
   * Checks if the string is an ISBN (version 10 or 13).
   */
  isISBN?: boolean

  /**
   * Checks if the string is an ISSN.
   */
    isISSN?: boolean | any[]

  /**
   * Checks if the string is an ISIN (stock/security identifier).
   */
  isISIN?: boolean

  /**
   * Checks if the string is a valid ISO 8601 date
   */
  isISO8601?: boolean

  /**
   * Checks if the string is a valid RFC 3339 date.
   */
  isRFC3339?: boolean

  /**
   * Check if the string is a ISRC.
   */
  isISRC?: boolean

  /**
   * Check if the string is in a array of allowed values.
   */
  isIn?: string[]

  /**
   * Checks if the string is valid JSON.
   */
  isJSON?: boolean

  /**
   * Checks if the string is valid JWT token.
   */
  isJWT?: boolean

  /**
   * Checks if the string is a valid latitude-longitude coordinate in the format lat,long or lat, long.
   */
  isLatLong?: boolean

  /**
   * Checks if the string is lowercase.
   */
  isLowercase?: boolean

  /**
   * Checks if the string is a MAC address.
   */
  isMACAddress?: boolean | any[]

  /**
   * Checks if the string is a MD5 hash.
   */
  isMD5?: boolean

  /**
   * Checks if the string matches to a valid MIME type format.
   */
  isMimeType?: boolean

  /**
   * Checks if the string is a mobile phone number.
   */
  isMobilePhone?: boolean | any[]

  /**
   * Checks if the string is a valid hex-encoded representation of a MongoDB ObjectId.
   */
  isMongoId?: boolean

  /**
   * Checks if the string contains only numbers.
   */
  isNumeric?: boolean | any[]

  /**
   * Checks if the string is a valid port number.
   */
  isPort?: boolean

  /**
   * Checks if the string is a postal code.
   */
  isPostalCode?: boolean | any[]

  /**
   * Checks if the string is an URL.
   */
  isURL?: boolean | any[]

  /**
   * Checks if the string is a UUID (version 3, 4 or 5).
   */
  isUUID?: 3 | 4 | 5

  /**
   * Checks if the string is uppercase.
   */
  isUppercase?: boolean

  /**
   * Checks characters if they appear in the whitelist.
   */
  isWhitelisted?: string

  /**
   * Checks if string matches the pattern.
   */
  matches?: RegExp

}
