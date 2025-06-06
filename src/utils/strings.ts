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
