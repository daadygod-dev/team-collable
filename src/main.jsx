import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signin from './components/Signin'
import { AuthProvider } from './context/AuthContext'
import Signup from './components/Signup'
import TaskPage from './pages/dashboard/TaskPage'
import TeamPage from './pages/dashboard/Team'
import ProjectPage from './pages/dashboard/Project'
import DashboardLayout from './pages/dashboard/DashbordLayout'
import DashboardHome from './pages/dashboard/DasboardHome'
import './index.css'
import App from './App.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import { ProjectProvider } from './context/ProjectContext'
import { TaskProvider } from './context/TaskContext'
import { TeamProvider } from './context/TeamContext'
import CalendarPage from './pages/dashboard/CalendarPage'
import Settings from './pages/dashboard/Settings'
import Help from './pages/dashboard/Help'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ProjectProvider>
        <TeamProvider>
        <TaskProvider>
          
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />

          {/* ✅ Layout is the parent, children render inside its <Outlet /> */}
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />        {/* /dashboard */}
            <Route path='tasks' element={<TaskPage />} />      {/* /dashboard/tasks */}
            <Route path='projects' element={<ProjectPage />} /> {/* /dashboard/project */}
            <Route path='teams' element={<TeamPage />} />       {/* /dashboard/team */}
            <Route path='calendar' element={<CalendarPage />} /> 
            <Route path='settings' element={<Settings />} /> 
             <Route path='help' element={<Help />} /> 
          </Route>

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
      
      </TaskProvider>
      </TeamProvider>
      </ProjectProvider>
    </AuthProvider>
  </StrictMode>
)