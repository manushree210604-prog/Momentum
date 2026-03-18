import { Outlet } from 'react-router-dom';
import { Sidebar, HamburgerButton } from './Sidebar';
import { useState } from 'react';

export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Hamburger button — mobile only */}
            <HamburgerButton onClick={() => setSidebarOpen(true)} />

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <main className="flex-1 lg:ml-64 p-6 sm:p-8 pt-16 lg:pt-8 overflow-y-auto min-w-0">
                <div className="max-w-6xl mx-auto pb-12">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
