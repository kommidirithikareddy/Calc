import { useState, useCallback } from 'react'

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
      content: `Hi! I\'m CalC AI 👋 I can see you\'re using the **${calculatorName}**. ${calculatorContext ? 'I can see your current inputs and result. ' : ''}Ask me anything about your calculation — I\'ll explain what it means, help you understand the numbers, or suggest next steps.`,
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

    // Build full context string for the backend
    const context = `Calculator: ${calculatorName}. ${calculatorContext || ''}`

    // Build conversation history for multi-turn
    const history = messages
      .filter((_, i) => i > 0) // skip greeting
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))

    // Full prompt including history
    const fullMessage = history.length > 0
      ? history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + `\nUser: ${userMessage}`
      : userMessage

    try {
      // ✅ Call our secure backend — NOT Anthropic directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullMessage,
          context: `${SYSTEM_PROMPT(calculatorName, calculatorContext)}\n\n${context}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage = data.reply || 'Sorry, I could not generate a response.'

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
        content: `Hi! I\'m CalC AI 👋 Ask me anything about the **${calculatorName}**.`,
      },
    ])
  }, [calculatorName])

  return { messages, sendMessage, isLoading, error, clearMessages }
}
