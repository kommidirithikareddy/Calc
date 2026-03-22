import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.scss'
import './styles/calc-colors.css'

// Pages
import Home        from './pages/Home'
import Category    from './pages/Category'
import Subcategory from './pages/Subcategory'
import Calculator  from './pages/Calculator'

// Theme provider — .jsx because it contains JSX
import { ThemeProvider } from './hooks/useTheme'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Home />} />

          {/* Category — e.g. /finance */}
          <Route path="/:category" element={<Category />} />

          {/* Subcategory — e.g. /finance/investment */}
          <Route path="/:category/:subcategory" element={<Subcategory />} />

          {/* Calculator — e.g. /finance/investment/compound-interest */}
          <Route path="/:category/:subcategory/:calculator" element={<Calculator />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
