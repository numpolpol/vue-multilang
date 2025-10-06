/**
 * Utility functions for detecting special characters in localization values
 */

// Special characters that commonly appear in iOS/Android localization
export const SPECIAL_CHARACTERS = [
  '%@',    // iOS string placeholder
  '%d',    // Integer placeholder
  '%f',    // Float placeholder
  '%s',    // String placeholder
  '%ld',   // Long integer placeholder
  '%lf',   // Long float placeholder
  '\\n',   // Line break
  '\\t',   // Tab character
  '\\r',   // Carriage return
  '{{',    // Template literal start
  '}}',    // Template literal end
  '{',     // Curly brace start
  '}',     // Curly brace end
] as const

export type SpecialCharacter = typeof SPECIAL_CHARACTERS[number]

/**
 * Detect special characters in a string value
 * @param value The string to check
 * @returns Array of detected special characters
 */
export function detectSpecialCharacters(value: string): SpecialCharacter[] {
  if (!value || typeof value !== 'string') {
    return []
  }

  const detected: SpecialCharacter[] = []
  
  for (const specialChar of SPECIAL_CHARACTERS) {
    if (value.includes(specialChar)) {
      detected.push(specialChar)
    }
  }
  
  return detected
}

/**
 * Check if a value contains any special characters
 * @param value The string to check
 * @returns true if special characters are found
 */
export function hasSpecialCharacters(value: string): boolean {
  return detectSpecialCharacters(value).length > 0
}

/**
 * Check if any value in a language data object contains special characters
 * @param languageData Object with key-value pairs
 * @param key Specific key to check (optional)
 * @returns true if special characters are found
 */
export function hasSpecialCharactersInLanguageData(
  languageData: Record<string, string>, 
  key?: string
): boolean {
  if (key) {
    const value = languageData[key]
    return value ? hasSpecialCharacters(value) : false
  }
  
  return Object.values(languageData).some(value => hasSpecialCharacters(value))
}

/**
 * Get all special characters found across all language values for a specific key
 * @param languages Array of language objects
 * @param key The key to check
 * @returns Array of detected special characters
 */
export function getSpecialCharactersForKey(
  languages: Array<{ code: string; data: Record<string, string> }>,
  key: string
): SpecialCharacter[] {
  const allDetected = new Set<SpecialCharacter>()
  
  for (const language of languages) {
    const value = language.data[key]
    if (value) {
      const detected = detectSpecialCharacters(value)
      detected.forEach(char => allDetected.add(char))
    }
  }
  
  return Array.from(allDetected)
}

/**
 * Create a tooltip message showing detected special characters
 * @param specialChars Array of detected special characters
 * @returns Formatted tooltip string
 */
export function createSpecialCharacterTooltip(specialChars: SpecialCharacter[]): string {
  if (specialChars.length === 0) {
    return ''
  }
  
  const descriptions: Record<SpecialCharacter, string> = {
    '%@': 'iOS string placeholder',
    '%d': 'Integer placeholder', 
    '%f': 'Float placeholder',
    '%s': 'String placeholder',
    '%ld': 'Long integer placeholder',
    '%lf': 'Long float placeholder',
    '\\n': 'Line break',
    '\\t': 'Tab character',
    '\\r': 'Carriage return',
    '{{': 'Template literal start',
    '}}': 'Template literal end',
    '{': 'Curly brace start',
    '}': 'Curly brace end'
  }
  
  const charList = specialChars
    .map(char => `${char} (${descriptions[char]})`)
    .join('\n')
    
  return `Special characters detected:\n${charList}`
}