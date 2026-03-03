import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ProjectWizard from './pages/ProjectWizard'
import ProjectView from './pages/ProjectView'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<ProjectWizard />} />
        <Route path="/project/:projectId" element={<ProjectView />} />
      </Routes>
    </Layout>
  )
}

export default App
