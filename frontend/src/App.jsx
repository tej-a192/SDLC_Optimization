import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ProjectWizard from './pages/ProjectWizard'
import ProjectView from './pages/ProjectView'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<ProjectWizard />} />
          <Route path="/project/:projectId" element={<ProjectView />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App
