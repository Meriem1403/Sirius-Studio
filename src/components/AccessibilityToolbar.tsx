import { useEffect, useState } from 'react'
import { Eye, Type } from 'lucide-react'

type TextSize = 'normal' | 'large' | 'xlarge'

const STORAGE_KEY = 'sirius-a11y'

interface A11yPrefs {
  highContrast: boolean
  textSize: TextSize
}

function loadPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as A11yPrefs
  } catch {
    /* ignore */
  }
  return { highContrast: false, textSize: 'normal' }
}

function applyPrefs(prefs: A11yPrefs) {
  const root = document.documentElement
  root.dataset.a11yHighContrast = prefs.highContrast ? 'true' : 'false'
  root.dataset.a11yText = prefs.textSize
}

export function initAccessibility() {
  applyPrefs(loadPrefs())
}

export default function AccessibilityToolbar() {
  const [prefs, setPrefs] = useState<A11yPrefs>(loadPrefs)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    applyPrefs(prefs)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [prefs])

  return (
    <div className="a11y-toolbar">
      <button
        type="button"
        className="a11y-toolbar-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="Options d'accessibilité : contraste et taille du texte"
      >
        <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
        <span className="a11y-toolbar-toggle-label">Accessibilité</span>
      </button>

      {open && (
        <div id="a11y-panel" className="a11y-panel" role="region" aria-label="Réglages d'accessibilité">
          <p className="a11y-panel-title">Confort de lecture</p>

          <label className="a11y-option">
            <input
              type="checkbox"
              checked={prefs.highContrast}
              onChange={(e) => setPrefs((p) => ({ ...p, highContrast: e.target.checked }))}
            />
            <span>Contraste renforcé</span>
          </label>

          <div className="a11y-option-group">
            <span className="a11y-option-label">
              <Type size={14} aria-hidden="true" />
              Taille du texte
            </span>
            <div className="a11y-segment" role="group" aria-label="Taille du texte">
              {(['normal', 'large', 'xlarge'] as TextSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`a11y-segment-btn ${prefs.textSize === size ? 'a11y-segment-btn--active' : ''}`}
                  aria-pressed={prefs.textSize === size}
                  onClick={() => setPrefs((p) => ({ ...p, textSize: size }))}
                >
                  {size === 'normal' ? '100 %' : size === 'large' ? '112 %' : '125 %'}
                </button>
              ))}
            </div>
          </div>

          <p className="a11y-panel-hint">
            Conforme aux recommandations WCAG : contrastes, focus visible et navigation clavier.
          </p>
        </div>
      )}
    </div>
  )
}
