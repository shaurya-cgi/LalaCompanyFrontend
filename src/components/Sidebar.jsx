import React from 'react'
import './Sidebar.css'
import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
    const location = useLocation()
  return (
    <div className='sidebar'>
        <div className='sidebar-header'>
            LALACOMPANY BILLING SOFTWARE
        </div>
        <div className='sidebar-menu'>
            <Link className={`sidebarbutton ${location.pathname === '/' ? 'active' : ''}`} key='/' to='/' >Generate Bill</Link>
            <Link className={`sidebarbutton ${location.pathname === '/buyers' ? 'active' : ''}`} key='/buyers' to='/buyers'>Buyers</Link>
            <Link className={`sidebarbutton ${location.pathname === '/invoices' ? 'active' : ''}`} key='/invoices' to='/invoices'>Invoices</Link>
            <Link className={`sidebarbutton ${location.pathname === '/products' ? 'active' : ''}`} key='/products' to='/products'>Products</Link>
            <Link className={`sidebarbutton ${location.pathname === '/categories' ? 'active' : ''}`} key='/categories' to='/categories'>Categories</Link>
            <Link className={`sidebarbutton ${location.pathname === '/settings' ? 'active' : ''}`} key='/settings' to='/settings'>Settings</Link>
        </div>
    </div>
  )
}

export default Sidebar
