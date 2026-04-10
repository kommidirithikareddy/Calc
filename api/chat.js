export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { message, context } = req.body
  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }
  const apiKey = process.env.COHERE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }
  try {
    const response = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'command-r-plus-08-2024',
        messages: [
          {
            role: 'system',
            content: `You are a helpful financial calculator assistant. 
The user is using a calculator with this context: ${context || 'General financial calculator'}.
Answer clearly and concisely in 2-3 sentences. Focus on practical financial advice.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Cohere API error:', err)
      return res.status(500).json({ error: 'AI service error' })
    }

    const data = await response.json()
    const reply = data?.message?.content?.[0]?.text || 'Sorry, I could not generate a response.'

    return res.status(200).json({ reply })

  } catch (error) {
    console.error('Handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
