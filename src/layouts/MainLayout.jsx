import React from 'react'
import './MainLayout.css'
import Sidebar from '../components/Sidebar'
import Home from '../components/Home'
import HomeHeader from '../components/HomeHeader'


function MainLayout() {
  return (
    <div className='mainlayout'>    
        <Sidebar></Sidebar>
        <div className='mainarea'>
            <div className='header'><HomeHeader/></div>
            <div className='content'><Home/></div>
        </div>
    </div>
  )
}

export default MainLayout