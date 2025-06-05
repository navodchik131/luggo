import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { UnreadProvider } from './contexts/UnreadContext'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import TaskDetailPage from './pages/TaskDetailPage'
import CreateTaskPage from './pages/CreateTaskPage'
import EditTaskPage from './pages/EditTaskPage'
import MyTasksPage from './pages/MyTasksPage'
import MyJobsPage from './pages/MyJobsPage'
import ProfilePage from './pages/ProfilePage'
import ExecutorsPage from './pages/ExecutorsPage'
import ExecutorProfilePage from './pages/ExecutorProfilePage'
import ChatPage from './pages/ChatPage'
import ChatsPage from './pages/ChatsPage'
import TestAPIPage from './pages/TestAPIPage'
import NotificationsPage from './pages/NotificationsPage'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminTasksPage from './pages/AdminTasksPage'
import AdminReportsPage from './pages/AdminReportsPage'

function App() {
  return (
    <UnreadProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/create-task" element={<CreateTaskPage />} />
          <Route path="/edit-task/:id" element={<EditTaskPage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
          <Route path="/my-jobs" element={<MyJobsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/executors" element={<ExecutorsPage />} />
          <Route path="/executor/:userId" element={<ExecutorProfilePage />} />
          <Route path="/chat/:taskId" element={<ChatPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/test-api" element={<TestAPIPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Routes>
      </Layout>
    </UnreadProvider>
  )
}

export default App 