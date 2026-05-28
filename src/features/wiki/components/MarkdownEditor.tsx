import { useState } from 'react'
import { MarkdownPreview } from './MarkdownPreview'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

type Tab = 'edit' | 'preview'

export function MarkdownEditor({ value, onChange, placeholder }: Props) {
  const [tab, setTab] = useState<Tab>('edit')

  return (
    <div className="rounded-md border">
      <div className="flex border-b">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'edit'}
          onClick={() => setTab('edit')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'edit'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Bearbeiten
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'preview'}
          onClick={() => setTab('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'preview'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Vorschau
        </button>
      </div>

      {tab === 'edit' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Markdown-Inhalt eingeben…'}
          rows={16}
          className="w-full resize-y p-3 text-sm font-mono bg-transparent outline-none"
        />
      )}

      {tab === 'preview' && (
        <div className="min-h-40 p-3">
          {value.trim() ? (
            <MarkdownPreview content={value} />
          ) : (
            <p className="text-sm text-muted-foreground italic">Noch kein Inhalt zum Anzeigen.</p>
          )}
        </div>
      )}
    </div>
  )
}
