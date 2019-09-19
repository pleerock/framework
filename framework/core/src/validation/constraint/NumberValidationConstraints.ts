/**
 * Number validation constraints.
 */
export type NumberValidationConstraints = {

  /**
   * Check if the number absolutely matches given number.
   */
  equals?: number

  /**
   * Checks if given number isn't lower as this number.
   */
  min?: number

  /**
   * Checks if given number isn't greater as this number.
   */
  max?: number

  /**
   * Checks if given number is negative.
   */
  negative?: boolean

  /**
   * Checks if given number is positive.
   */
  positive?: boolean

  /**
   * Checks if given number is between two numbers.
   */
  between?: [number, number]

  /**
   * Checks if given number is less than this number.
   */
  lessThan?: number

  /**
   * Checks if given number is less than or equal to this number.
   */
  lessThanOrEqual?: number

  /**
   * Checks if given number is greater than this number.
   */
  greaterThan?: number

  /**
   * Checks if given number is greater than or equal to this number.
   */
  greaterThanOrEqual?: number

  /**
   * Checks if given number is even number.
   */
  even?: number

  /**
   * Checks if given number is odd number.
   */
  odd?: number

}
