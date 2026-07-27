import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Buyers from './pages/Buyers'
import './App.css'
import Invoices from './pages/Invoices'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Settings from './pages/Settings'

function App() {
  return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/buyers" element={<Buyers />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
  )
}

export default App
