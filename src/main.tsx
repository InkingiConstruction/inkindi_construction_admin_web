/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : main.tsx
 * WHAT THIS FILE DOES : Supports the InkingiPro admin web portal
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, mock data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * ============================================================================
 * FUNCTION: renderAdminApplication
 * ============================================================================
 * WHAT IT DOES: Mounts the InkingiPro admin React application
 * PARAMETERS: none
 * RETURNS: void - React renders into the root DOM element
 * WHO CALLS IT: Browser module loader through Vite
 * PRINCIPLE: KISS
 * ============================================================================
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
