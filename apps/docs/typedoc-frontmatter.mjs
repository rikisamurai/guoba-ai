// @ts-check
import { MarkdownPageEvent } from 'typedoc-plugin-markdown'

/**
 * Custom TypeDoc plugin that adds a `title` field to frontmatter
 * for Fumadocs compatibility.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page */
    page => {
      page.frontmatter = {
        ...page.frontmatter,
        title: page.model?.name ?? 'API Reference',
      }
    },
  )
}
