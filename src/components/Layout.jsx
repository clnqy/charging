import React, { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import Loading from './Loading'
import Sidebar from './Sidebar'

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex flex-col h-full flex-1 transition-all duration-300 min-w-0 overflow-hidden">
        <Header sidebarCollapsed={sidebarCollapsed} />

        <main
          className="flex-1 bg-gray-bg p-4 transition-all duration-300 min-w-0 overflow-y-auto overflow-x-hidden"
          style={{ height: '86%' }}
        >
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default Layout
