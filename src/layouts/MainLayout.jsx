import React from 'react'
import './MainLayout.css'
import Sidebar from '../components/Sidebar'

function MainLayout() {
  return (
    <div className='mainlayout'>
        <Sidebar></Sidebar>
        <div className='mainarea'>
            <div className='header'>HEADER</div>
            <div className='content'>CONTEXT</div>
        </div>
    </div>
  )
}

export default MainLayout