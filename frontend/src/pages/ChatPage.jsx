import { useParams } from 'react-router-dom'

const ChatPage = () => {
  const { taskId } = useParams()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Чат по заявке #{taskId}</h1>
      <div className="card">
        <p className="text-gray-600">Здесь будет чат между заказчиком и исполнителем</p>
      </div>
    </div>
  )
}

export default ChatPage 