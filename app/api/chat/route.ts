import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface AttachedFile {
  name: string
  mimeType: string
  data: string
  isImage: boolean
}

interface IncomingMessage {
  role: 'user' | 'assistant'
  content: string
  files?: AttachedFile[]
}

function buildMessageContent(msg: IncomingMessage): Anthropic.MessageParam {
  if (msg.role === 'assistant' || !msg.files || msg.files.length === 0) {
    return { role: msg.role, content: msg.content }
  }

  const blocks: Anthropic.ContentBlockParam[] = []

  for (const file of msg.files) {
    if (file.isImage) {
      blocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: file.mimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
          data: file.data,
        },
      })
    } else {
      blocks.push({
        type: 'text',
        text: `[File: ${file.name}]\n${file.data}`,
      })
    }
  }

  if (msg.content) {
    blocks.push({ type: 'text', text: msg.content })
  }

  return { role: 'user', content: blocks }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt }: { messages: IncomingMessage[]; systemPrompt: string } = await req.json()

    let currentMessages: Anthropic.MessageParam[] = messages.map(buildMessageContent)

    let response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: currentMessages,
      tools: [{ type: 'web_search_20260209', name: 'web_search' }],
    })

    while (response.stop_reason === 'pause_turn') {
      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
      ]
      response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        messages: currentMessages,
        tools: [{ type: 'web_search_20260209', name: 'web_search' }],
      })
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n\n')

    return NextResponse.json({ text })
  } catch (err: unknown) {
    console.error('API Error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
