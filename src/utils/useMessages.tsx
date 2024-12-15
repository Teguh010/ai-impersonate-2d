import { useToast } from '@apideck/components'
import { ChatCompletionRequestMessage } from 'openai'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { sendMessage } from './sendMessage'
import { SYSTEM_MESSAGE, WELCOME_MESSAGE } from './constants'
import { eventEmitter } from './eventEmitter'

interface ContextProps {
  messages: ChatCompletionRequestMessage[]
  addMessage: (content: string) => Promise<void>
  isLoadingAnswer: boolean
  streamingContent: string | null
}

const ChatsContext = createContext<Partial<ContextProps>>({})

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)

  useEffect(() => {
    const initializeChat = () => {
      setMessages([SYSTEM_MESSAGE, WELCOME_MESSAGE])
    }

    if (!messages?.length) {
      initializeChat()
    }
  }, [messages?.length, setMessages])

  const addMessage = async (content: string) => {
    setIsLoadingAnswer(true)
    setStreamingContent('')

    try {
      const newMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content
      }
      const newMessages = [...messages, newMessage]
      setMessages(newMessages)

      // Emit event saat mulai streaming
      eventEmitter.emit('aiResponse')

      const response = await sendMessage(newMessages)
      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = response.body
      if (!data) {
        throw new Error('No response data')
      }

      const reader = data.getReader()
      const decoder = new TextDecoder()
      let done = false
      let streamedResponse = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              streamedResponse += parsed.content
              setStreamingContent(streamedResponse)
              // Tambahkan delay di sini
              await new Promise((resolve) => setTimeout(resolve, 100)) // 50ms delay
            } catch (error) {
              console.error('Error parsing chunk:', error)
            }
          }
        }
      }

      setMessages([...newMessages, { role: 'assistant', content: streamedResponse }])
    } catch (error) {
      addToast({ title: 'An error occurred', type: 'error' })
    } finally {
      setIsLoadingAnswer(false)
      setStreamingContent(null)
      // Emit event untuk menghentikan kedipan
      eventEmitter.emit('stopBlinking')
    }
  }

  return (
    <ChatsContext.Provider value={{ messages, addMessage, isLoadingAnswer, streamingContent }}>
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext) as ContextProps
}
