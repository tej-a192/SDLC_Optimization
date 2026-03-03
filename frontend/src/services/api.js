/**
 * SDLC Optimization - API Service
 * Handles all communication with the FastAPI backend.
 */

import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * List all generated projects.
 */
export const getProjects = async () => {
    const response = await api.get('/projects')
    return response.data
}

/**
 * Create a new project by sending SRS text or PDF + LLM provider selection.
 */
export const createProject = async ({ projectName, srsText, srsFile, llmProvider, ollamaUrl }) => {
    const formData = new FormData()
    formData.append('project_name', projectName)

    if (srsText) {
        formData.append('srs_text', srsText)
    }
    if (srsFile) {
        formData.append('srs_file', srsFile)
    }

    formData.append('llm_provider', llmProvider || 'gemini')

    if (ollamaUrl) {
        formData.append('ollama_url', ollamaUrl)
    }

    const response = await api.post('/projects/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
}

/**
 * Get details of a specific project.
 */
export const getProject = async (projectId) => {
    const response = await api.get(`/projects/${projectId}`)
    return response.data
}

/**
 * Delete a project.
 */
export const deleteProject = async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data
}

export default api
