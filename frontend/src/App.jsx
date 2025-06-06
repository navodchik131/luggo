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
import NotificationsPage from './pages/NotificationsPage'
import NewsPage from './pages/NewsPage'
import NewsDetailPage from './pages/NewsDetailPage'
import SupportPage from './pages/SupportPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ExecutorsGuidePage from './pages/ExecutorsGuidePage'
import CustomersGuidePage from './pages/CustomersGuidePage'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminTasksPage from './pages/AdminTasksPage'
import AdminReportsPage from './pages/AdminReportsPage'
import AdminNewsPage from './pages/AdminNewsPage'
import AdminNewsFormPage from './pages/AdminNewsFormPage'
import AdminTestsPage from './pages/AdminTestsPage'

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
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetailPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/for-executors" element={<ExecutorsGuidePage />} />
          <Route path="/for-customers" element={<CustomersGuidePage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/news" element={<AdminNewsPage />} />
          <Route path="/admin/news/create" element={<AdminNewsFormPage />} />
          <Route path="/admin/news/edit/:id" element={<AdminNewsFormPage />} />
          <Route path="/admin/tests" element={<AdminTestsPage />} />
        </Routes>
      </Layout>
    </UnreadProvider>
  )
}

export default App 