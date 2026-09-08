export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export async function readFileAsAttachment(file: File): Promise<{
  name: string
  size: string
  mimeType: string
  dataUrl?: string
}> {
  const maxInline = 800_000
  const base = {
    name: file.name,
    size: formatFileSize(file.size),
    mimeType: file.type || 'application/octet-stream',
  }

  if (file.size > maxInline) {
    return base
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  return { ...base, dataUrl }
}

export function attachmentIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'sheet'
  return 'file'
}
