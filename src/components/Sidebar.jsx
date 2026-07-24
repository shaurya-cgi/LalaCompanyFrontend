import React from 'react'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <div className='sidebar'>
        <div className='sidebar-header'>
            LALACOMPANY BILLING SOFTWARE
        </div>
        <div className='sidebar-menu'>
            <div className='sidebarbutton'>Generate Bill</div>
            <div className='sidebarbutton'>Buyers</div>
            <div className='sidebarbutton'>Invoices</div>
            <div className='sidebarbutton'>Products</div>
            <div className='sidebarbutton'>Categories</div>
            <div className='sidebarbutton'>Settings</div>
        </div>
    </div>
  )
}
