import { useState, useCallback } from 'react'

/**
 * useChat — manages the CalC AI chatbot
 * Calls Claude API with context about the current calculator
 *
 * Usage:
 *   const { messages, sendMessage, isLoading, clearMessages } = useChat({
 *     calculatorName: 'Compound Interest Calculator',
 *     calculatorContext: 'Principal: $10,000, Rate: 7%, Years: 10, Result: $19,672'
 *   })
 */

const SYSTEM_PROMPT = (calculatorName, calcContext) => `
You are CalC AI — a friendly, knowledgeable assistant built into the CalC calculator app.

The user is currently on the ${calculatorName}.
${calcContext ? `Current calculator inputs and result:\n${calcContext}` : ''}

Your role:
- Explain what the calculation means in plain English
- Answer follow-up questions about the numbers
- Give helpful context (e.g. Rule of 72, healthy BMI ranges, industry benchmarks)
- Suggest related calculators when relevant
- Keep responses concise — 2-4 sentences or a short numbered list

Rules:
- Never give financial, medical or legal advice. Say "consult a professional" when appropriate.
- Never make up numbers. Only work from what the user provides.
- Tone: warm, clear, like a knowledgeable friend — not a textbook.
- Format responses with **bold** for key terms, numbered lists for steps.
`.trim()

export function useChat({ calculatorName = 'Calculator', calculatorContext = '' } = {}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm CalC AI 👋 I can see you're using the **${calculatorName}**. ${calculatorContext ? 'I can see your current inputs and result. ' : ''}Ask me anything about your calculation — I'll explain what it means, help you understand the numbers, or suggest next steps.`,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim() || isLoading) return

    const newUserMsg = { role: 'user', content: userMessage }

    setMessages(prev => [...prev, newUserMsg])
    setIsLoading(true)
    setError(null)

    // Build the message history for Claude (exclude the initial assistant greeting)
    const history = messages
      .filter((_, i) => i > 0) // skip the greeting
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT(calculatorName, calculatorContext),
          messages: [...history, newUserMsg],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage = data.content?.[0]?.text || 'Sorry, I could not generate a response.'

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
    } catch (err) {
      console.error('CalC AI error:', err)
      setError('Something went wrong. Please try again.')
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an issue. Please try your question again!',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, calculatorName, calculatorContext])

  const clearMessages = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I'm CalC AI 👋 Ask me anything about the **${calculatorName}**.`,
      },
    ])
  }, [calculatorName])

  return { messages, sendMessage, isLoading, error, clearMessages }
}
