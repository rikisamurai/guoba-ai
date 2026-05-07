'use client'

import { useEffect, useRef } from 'react'

interface SnackEmbedProps {
  /** Saved Snack id, e.g. `@react-navigation/basic-scrollview-tab-v3`. Mutually exclusive with `code`. */
  snackId?: string
  /** Inline JS source. Mutually exclusive with `snackId`. */
  code?: string
  /** Comma-separated npm dependencies, e.g. `expo-constants,lodash@4`. */
  dependencies?: string
  name?: string
  description?: string
  /** Default platform shown in the preview pane. */
  platform?: 'ios' | 'android' | 'web' | 'mydevice'
  /** Comma-separated list of platform tabs to expose. */
  supportedPlatforms?: string
  preview?: boolean
  theme?: 'light' | 'dark'
  /** Pin a specific Expo SDK version, e.g. `52.0.0`. */
  sdkVersion?: string
  loading?: 'lazy' | 'eager'
  height?: number | string
}

const SCRIPT_SRC = 'https://snack.expo.dev/embed.js'

export function SnackEmbed(props: SnackEmbedProps): React.ReactElement {
  const {
    snackId,
    code,
    dependencies,
    name,
    description,
    platform = 'web',
    supportedPlatforms = 'mydevice,ios,android,web',
    preview = true,
    theme,
    sdkVersion,
    loading = 'lazy',
    height = 505,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // embed.js scans the DOM on load; re-injecting it forces a re-scan
    // when navigating between pages in the SPA.
    document.querySelectorAll(`script[src="${SCRIPT_SRC}"]`).forEach(s => s.remove())
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    document.body.appendChild(script)
  }, [snackId, code])

  const dataAttrs: Record<string, string> = {
    'data-snack-platform': platform,
    'data-snack-supported-platforms': supportedPlatforms,
    'data-snack-preview': String(preview),
    'data-snack-loading': loading,
  }
  if (snackId) dataAttrs['data-snack-id'] = snackId
  if (code) dataAttrs['data-snack-code'] = code
  if (dependencies) dataAttrs['data-snack-dependencies'] = dependencies
  if (name) dataAttrs['data-snack-name'] = name
  if (description) dataAttrs['data-snack-description'] = description
  if (theme) dataAttrs['data-snack-theme'] = theme
  if (sdkVersion) dataAttrs['data-snack-sdkversion'] = sdkVersion

  const heightStr = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      ref={containerRef}
      {...dataAttrs}
      style={{
        overflow: 'hidden',
        background: '#fafafa',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 4,
        height: heightStr,
        width: '100%',
        marginBlock: '1.25rem',
      }}
    />
  )
}
