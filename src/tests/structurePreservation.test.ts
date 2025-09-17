import { describe, it, expect } from 'vitest'
import { parseStringsWithStructure, toStringsWithStructure } from '../utils/strings'

describe('Structure Preservation', () => {
  it('should preserve comments and key order when exporting', () => {
    const originalContent = `/*
 * Financial App Localization - English
 * Main Features: Account, Transactions
 */

// MARK: - Account Management Feature
/* Account Management - User accounts */

"account.title" = "My Account";
"account.balance" = "Account Balance";

// MARK: - Transaction Feature  
/* Transactions - Payments */

"transactions.title" = "Transactions";
"transactions.send_money" = "Send Money";`

    // Parse with structure preservation
    const parsed = parseStringsWithStructure(originalContent)
    
    expect(parsed.data).toEqual({
      'account.title': 'My Account',
      'account.balance': 'Account Balance',
      'transactions.title': 'Transactions',
      'transactions.send_money': 'Send Money'
    })
    
    expect(parsed.structure).toBeDefined()
    expect(parsed.originalContent).toBe(originalContent)
    
    // Test export with modified data
    const modifiedData = {
      'account.title': 'My Profile', // Changed value
      'account.balance': 'Available Balance', // Changed value
      'transactions.title': 'Transactions', // Unchanged
      'transactions.send_money': 'Send Money', // Unchanged
      'account.new_key': 'New Value' // New key
    }
    
    const exported = toStringsWithStructure(modifiedData, parsed.structure)
    
    // Should preserve comments and structure
    expect(exported).toContain('/*')
    expect(exported).toContain('Financial App Localization')
    expect(exported).toContain('// MARK: - Account Management Feature')
    expect(exported).toContain('// MARK: - Transaction Feature')
    
    // Should have updated values in original positions
    expect(exported).toContain('"account.title" = "My Profile";')
    expect(exported).toContain('"account.balance" = "Available Balance";')
    expect(exported).toContain('"transactions.title" = "Transactions";')
    expect(exported).toContain('"transactions.send_money" = "Send Money";')
    
    // Should add new keys at the end
    expect(exported).toContain('// New keys added during editing')
    expect(exported).toContain('"account.new_key" = "New Value";')
  })

  it('should handle structure with blank lines', () => {
    const originalContent = `"key1" = "Value 1";

"key2" = "Value 2";


"key3" = "Value 3";`

    const parsed = parseStringsWithStructure(originalContent)
    const exported = toStringsWithStructure(parsed.data, parsed.structure)
    
    // Should preserve blank lines
    expect(exported.split('\n').filter(line => line.trim() === '')).toHaveLength(3)
  })

  it('should fallback to simple export when no structure provided', () => {
    const data = {
      'key1': 'Value 1',
      'key2': 'Value 2'
    }
    
    const exported = toStringsWithStructure(data)
    
    expect(exported).toContain('"key1" = "Value 1";')
    expect(exported).toContain('"key2" = "Value 2";')
    expect(exported).not.toContain('/*')
    expect(exported).not.toContain('//')
  })

  it('should handle removed keys gracefully', () => {
    const originalContent = `"key1" = "Value 1";
"key2" = "Value 2";
"key3" = "Value 3";`

    const parsed = parseStringsWithStructure(originalContent)
    
    // Remove key2 from data
    const modifiedData = {
      'key1': 'Value 1',
      'key3': 'Value 3'
    }
    
    const exported = toStringsWithStructure(modifiedData, parsed.structure)
    
    expect(exported).toContain('"key1" = "Value 1";')
    expect(exported).not.toContain('"key2" = "Value 2";') // Should be removed
    expect(exported).toContain('"key3" = "Value 3";')
  })
})