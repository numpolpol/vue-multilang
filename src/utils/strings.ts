// Utility to parse iOS .strings file into JS object
export function parseStrings(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  // Remove comments and blank lines
  const lines = content
    .replace(/\/\*[^]*?\*\//g, '') // block comments
    .replace(/\/\/.*$/gm, '') // line comments
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && /=/g.test(l))
  for (const line of lines) {
    // Support quoted or unquoted keys
    const match = line.match(/^"?(.*?)"?\s*=\s*"([\s\S]*?)";/)
    if (match) {
      const [, key, value] = match
      result[key] = value
    }
  }
  return result
}

// Utility to stringify JS object to iOS .strings format
export function toStrings(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${k} = "${v.replace(/"/g, '\\"')}";`)
    .join('\n')
}

// Utility to parse Android string.xml file into JS object
export function parseXmlStrings(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  // Simple regex for <string name="key">value</string>
  const regex = /<string\s+name=["']([^"']+)["']>([\s\S]*?)<\/string>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content))) {
    const key = match[1]
    // Remove leading/trailing whitespace and decode XML entities
    let value = match[2].trim()
    value = value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    result[key] = value
  }
  return result
}

// Utility to stringify JS object to Android string.xml format
export function toXmlStrings(obj: Record<string, string>): string {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
  for (const [k, v] of Object.entries(obj)) {
    let value = v
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
    xml += `  <string name="${k}">${value}</string>\n`
  }
  xml += '</resources>\n'
  return xml
}
