import { describe, it, expect } from 'vitest'
import { isStringsFile } from '../utils/folderProcessor'

// Mock File class for testing
class MockFile implements File {
  public name: string
  public type: string
  public size: number = 100
  public lastModified: number = Date.now()
  public webkitRelativePath: string = ''

  constructor(name: string, type: string = '') {
    this.name = name
    this.type = type
  }

  // Required File interface methods (not used in our tests)
  slice(): Blob { throw new Error('Not implemented') }
  stream(): ReadableStream { throw new Error('Not implemented') }
  text(): Promise<string> { throw new Error('Not implemented') }
  arrayBuffer(): Promise<ArrayBuffer> { throw new Error('Not implemented') }
}

describe('isStringsFile', () => {
  it('should accept valid .strings files', () => {
    const validFiles = [
      new MockFile('en.strings'),
      new MockFile('Localizable.strings'),
      new MockFile('App_en.strings'),
      new MockFile('EN.STRINGS'), // uppercase
      new MockFile('test.strings', 'text/plain'),
      new MockFile('test.strings', 'text/x-strings'),
      new MockFile('test.strings', ''), // empty type is common for .strings
    ]

    validFiles.forEach(file => {
      expect(isStringsFile(file)).toBe(true)
    })
  })

  it('should reject non-.strings files', () => {
    const invalidFiles = [
      new MockFile('test.txt'),
      new MockFile('test.json'),
      new MockFile('test.xml'),
      new MockFile('strings.txt'), // has 'strings' in name but wrong extension
      new MockFile('test'), // no extension
      new MockFile('README.md'),
      new MockFile('config.plist'),
    ]

    invalidFiles.forEach(file => {
      expect(isStringsFile(file)).toBe(false)
    })
  })

  it('should reject .strings files with wrong MIME type', () => {
    const invalidMimeFiles = [
      new MockFile('test.strings', 'application/json'),
      new MockFile('test.strings', 'image/png'),
      new MockFile('test.strings', 'application/octet-stream'),
    ]

    invalidMimeFiles.forEach(file => {
      expect(isStringsFile(file)).toBe(false)
    })
  })

  it('should be case insensitive for file extensions', () => {
    const caseVariations = [
      new MockFile('test.strings'),
      new MockFile('test.STRINGS'), 
      new MockFile('test.Strings'),
      new MockFile('test.StRiNgS'),
    ]

    caseVariations.forEach(file => {
      expect(isStringsFile(file)).toBe(true)
    })
  })
})