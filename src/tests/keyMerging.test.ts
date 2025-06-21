import { describe, it, expect } from 'vitest'
import { findMergeableKeys, applyKeyMerging, splitMergedData } from '../utils/strings'

describe('Multi Key Merging Logic', () => {
  it('should detect keys with matching values across all languages (multi key mode)', () => {
    const testData = [
      // English data
      {
        'common_ok': 'OK',
        'android_ok': 'OK',
        'ios_ok': 'OK',
        'home_title': 'Welcome',
        'android_home_title': 'Hello', // Different value - should not merge
        'unique_key': 'Unique'
      },
      // Thai data  
      {
        'common_ok': 'ตกลง',
        'android_ok': 'ตกลง',
        'ios_ok': 'ตกลง',
        'home_title': 'ยินดีต้อนรับ',
        'android_home_title': 'สวัสดี', // Different value - should not merge
        'unique_key': 'เฉพาะ'
      }
    ]

    const keyMappings = findMergeableKeys(testData)
    
    // Should find that common_ok, android_ok, and ios_ok have matching values
    const mergedMapping = keyMappings.find((m: any) => m.shouldMerge && 
      m.allKeys.includes('common_ok') && m.allKeys.includes('android_ok') && m.allKeys.includes('ios_ok'))
    
    expect(mergedMapping).toBeTruthy()
    expect(mergedMapping?.allKeys).toHaveLength(3)
    expect(mergedMapping?.allKeys).toContain('common_ok')
    expect(mergedMapping?.allKeys).toContain('android_ok') 
    expect(mergedMapping?.allKeys).toContain('ios_ok')
    
    // Should not merge keys with different values
    const nonMergedMapping = keyMappings.find((m: any) => 
      m.primaryKey === 'home_title' || m.primaryKey === 'android_home_title')
    expect(nonMergedMapping?.shouldMerge).toBeFalsy()
  })

  it('should apply multi key merging correctly', () => {
    const files = [
      new File([''], 'en.strings'),
      new File([''], 'th.strings')
    ]
    
    const data = [
      { 'common_ok': 'OK', 'android_ok': 'OK', 'ios_ok': 'OK' },
      { 'common_ok': 'ตกลง', 'android_ok': 'ตกลง', 'ios_ok': 'ตกลง' }
    ]

    const keyMappings = findMergeableKeys(data)
    const result = applyKeyMerging(files, data, keyMappings)

    // Should have merged key displayed as "common_ok + android_ok + ios_ok"
    const mergedKeyName = result.mergedKeys.find(k => k.includes('common_ok') && k.includes('android_ok') && k.includes('ios_ok'))
    expect(mergedKeyName).toBeTruthy()
    expect(result.data[0][mergedKeyName!]).toBe('OK')
    expect(result.data[1][mergedKeyName!]).toBe('ตกลง')
  })

  it('should split merged keys correctly for export (multi key mode)', () => {
    const mergedData = {
      'common_ok + android_ok + ios_ok': 'OK',
      'home_title': 'Welcome',
      'android_profile_user': 'User',
      'unique_key': 'Unique'
    }

    // Test iOS export (should get iOS keys or first non-android key)
    const iosData = splitMergedData(mergedData, true)
    expect(iosData).toEqual({
      'ios_ok': 'OK',              // from merged key (iOS preferred)
      'home_title': 'Welcome',      // regular iOS key
      'unique_key': 'Unique'        // neutral key
      // android_profile_user should be excluded for iOS
    })

    // Test Android export (should get Android keys)
    const androidData = splitMergedData(mergedData, false)
    expect(androidData).toEqual({
      'android_ok': 'OK',           // from merged key (Android preferred)
      'android_profile_user': 'User', // regular Android key
      'unique_key': 'Unique'        // neutral key
      // home_title is excluded as it looks like iOS-only
    })
  })
})
