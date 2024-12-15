import MessageForm from '@/components/MessageForm'
import MessagesList from '@/components/MessageList'
import { NextPage } from 'next'
import { MessagesProvider } from '@/utils/useMessages'
import Layout from '../components/Layout'

const IndexPage: NextPage = () => {
  return (
    <MessagesProvider>
      <div className="fixed inset-0">
        <Layout>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <MessagesList />
            </div>
            <div className="flex-shrink-0">
              <MessageForm />
            </div>
          </div>
        </Layout>
      </div>
    </MessagesProvider>
  )
}

export default IndexPage
