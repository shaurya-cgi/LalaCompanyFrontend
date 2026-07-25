import React from 'react'
import './MainLayout.css'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className='mainlayout'>    
        <Sidebar></Sidebar>
        <div className='mainarea'>
            <Outlet />
        </div>
    </div>
  )
}

export default MainLayout