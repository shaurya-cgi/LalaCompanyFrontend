import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Buyers from './pages/Buyers'
import './App.css'

function App() {
  return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/buyers" element={<Buyers />} />
        </Route>
      </Routes>
  )
}

export default App
