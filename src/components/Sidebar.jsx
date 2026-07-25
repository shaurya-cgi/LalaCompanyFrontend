import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <div className='sidebar'>
        <div className='sidebar-header'>
            LALACOMPANY BILLING SOFTWARE
        </div>
        <div className='sidebar-menu'>
            <Link className='sidebarbutton' key='/' to='/' >Generate Bill</Link>
            <Link className='sidebarbutton' key='/buyers' to='/buyers'>Buyers</Link>
            <Link className='sidebarbutton' key='/invoices' to='/invoices'>Invoices</Link>
            <Link className='sidebarbutton' key='/products' to='/products'>Products</Link>
            <Link className='sidebarbutton' key='/categories' to='/categories'>Categories</Link>
            <Link className='sidebarbutton' key='/settings' to='/settings'>Settings</Link>
        </div>
    </div>
  )
}

export default Sidebar
