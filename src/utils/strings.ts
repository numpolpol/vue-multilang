// Utility to parse iOS .strings file into JS object
export function parseStrings(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  
  if (!content || content.trim().length === 0) {
    return result
  }
  
  if (content.trim().startsWith('<?xml')) {
    // Parse Android XML format
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(content, 'text/xml')
      const strings = xmlDoc.getElementsByTagName('string')
      for (const str of strings) {
        const name = str.getAttribute('name')
        if (name) {
          result[name] = str.textContent?.replace(/\\"/g, '"') || ''
        }
      }
    } catch (error) {
      console.warn('Failed to parse XML content:', error)
    }
  } else {
    // Parse iOS .strings format
    try {
      const lines = content
        .replace(/\/\*[^]*?\*\//g, '') // block comments
        .replace(/\/\/.*$/gm, '') // line comments
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && /=/g.test(l))
      
      for (const line of lines) {
        // Support quoted or unquoted keys
        const match = line.match(/^"?(.*?)"?\s*=\s*"([\s\S]*?)"\s*;?\s*$/)
        if (match) {
          const [, key, value] = match
          if (key) {
            result[key] = value || ''
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse .strings content:', error)
    }
  }
  
  return result
}

// Utility to stringify JS object to iOS .strings format
export function toStrings(obj: Record<string, string>): string {
  try {
    return Object.entries(obj)
      .filter(([key, value]) => key && value !== undefined)
      .map(([k, v]) => `"${k}" = "${(v || '').replace(/"/g, '\\"')}";`)
      .join('\n')
  } catch (error) {
    console.warn('Failed to convert to .strings format:', error)
    return ''
  }
}

// Utility to stringify JS object to Android strings.xml format
export function toAndroidStrings(obj: Record<string, string>): string {
  try {
    const xmlContent = Object.entries(obj)
      .filter(([key, value]) => key && value !== undefined)
      .map(([key, value]) => 
        `    <string name="${key}">${(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '\\"')}</string>`)
      .join('\n')
    return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${xmlContent}\n</resources>`
  } catch (error) {
    console.warn('Failed to convert to Android XML format:', error)
    return ''
  }
}
