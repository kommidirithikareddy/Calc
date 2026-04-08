import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.scss'

import Home              from './pages/Home'
import BrowseCalculators from './pages/BrowseCalculators'
import Category          from './pages/Category'
import Subcategory       from './pages/Subcategory'
import Calculator        from './pages/Calculator'
import About             from './pages/About'
import Terms             from './pages/Terms'
import Privacy           from './pages/Privacy'

import { ThemeProvider } from './hooks/useTheme'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                                   element={<Home />} />
          <Route path="/calculators"                        element={<BrowseCalculators />} />
          <Route path="/about"                              element={<About />} />
          <Route path="/terms"                              element={<Terms />} />
          <Route path="/privacy"                            element={<Privacy />} />
          <Route path="/:category"                          element={<Category />} />
          <Route path="/:category/:subcategory"             element={<Subcategory />} />
          <Route path="/:category/:subcategory/:calculator" element={<Calculator />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
