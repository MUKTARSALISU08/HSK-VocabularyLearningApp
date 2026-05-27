import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import App from './App'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" attribute="class">
      <App />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
)