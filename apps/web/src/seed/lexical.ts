/**
 * Minimal Lexical rich text builder.
 *
 * Payload `richText` fields (product description/craftsmanship, policy body,
 * brand story body) require Lexical editor JSON, not plain strings. These
 * helpers produce the minimal valid root the Payload Lexical field accepts.
 * See seed-payload-cms design.md → Lexical rich text helper. Req 5.7, 7.3, 8.1.
 */

interface SerializedTextNode {
  type: "text"
  detail: number
  format: number
  mode: "normal"
  style: string
  text: string
  version: number
}

interface SerializedParagraphNode {
  type: "paragraph"
  children: SerializedTextNode[]
  direction: "ltr" | null
  format: "" | "left" | "center" | "right" | "justify"
  indent: number
  version: number
  textFormat: number
  textStyle: string
}

interface SerializedRootNode {
  type: "root"
  children: SerializedParagraphNode[]
  direction: "ltr" | null
  format: "" | "left" | "center" | "right" | "justify"
  indent: number
  version: number
}

export interface LexicalRichText {
  root: SerializedRootNode
}

function textNode(text: string): SerializedTextNode {
  return {
    type: "text",
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text,
    version: 1,
  }
}

/** Build a single Lexical paragraph node from plain text. */
export function paragraph(text: string): SerializedParagraphNode {
  return {
    type: "paragraph",
    children: [textNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: "",
  }
}

/** Build a complete Lexical richText value from one or more paragraphs of text. */
export function richText(...paragraphs: string[]): LexicalRichText {
  return {
    root: {
      type: "root",
      children: paragraphs.map(paragraph),
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  }
}
