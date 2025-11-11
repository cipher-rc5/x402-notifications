"use client"

import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"

interface CodeBlockProps {
  code: string
  language: string
  filename?: string
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState<string>("")

  useEffect(() => {
    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki")
        const html = await codeToHtml(code, {
          lang: language,
          theme: "github-dark",
        })
        setHighlightedHtml(html)
      } catch (error) {
        console.error("Error highlighting code:", error)
        setHighlightedHtml(`<pre><code>${code}</code></pre>`)
      }
    }

    highlight()
  }, [code, language])

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg border border-border bg-muted/30 overflow-hidden">
      {filename && (
        <div className="px-4 py-2 border-b border-border bg-muted/50 text-xs text-muted-foreground font-mono">
          {filename}
        </div>
      )}
      <div className="relative">
        <div
          className="overflow-x-auto text-sm [&_pre]:p-4 [&_pre]:m-0 [&_pre]:bg-transparent"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
