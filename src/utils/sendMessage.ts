import { ChatCompletionRequestMessage } from 'openai'

export const sendMessage = async (messages: ChatCompletionRequestMessage[]) => {
  try {
    const response = await fetch('/api/createMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    })

    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}
