import React from 'react'
import './MainLayout.css'
import Sidebar from '../components/Sidebar'
import Home from '../components/Home'


function MainLayout() {
  return (
    <div className='mainlayout'>
        <Sidebar></Sidebar>
        <div className='mainarea'>
            <div className='header'></div>
            <div className='content'><Home/></div>
        </div>
    </div>
  )
}

export default MainLayout