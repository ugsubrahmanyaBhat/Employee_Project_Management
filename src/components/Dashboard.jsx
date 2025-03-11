import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Signout from "./Signout";
import Projects from "./Projects";
import Employee from "./Employee";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'dashboard') navigate('/dashboard');
        else if (tab === 'projects') navigate('/projects');
        else if (tab === 'employees') navigate('/Employees');
    };
    
    return (
        <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white p-2 shadow-xl">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button 
                            className="md:hidden text-white hover:text-blue-400 transition-colors"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                    </div>
                    <Signout />
                </div>
            </header>
            
            {/* Main Content Container */}
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 bg-[#181818] border-r border-[#2d2d2d] p-6">
                    <nav className="space-y-3">
                        {['dashboard', 'projects', 'employees'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === tab 
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg text-white'
                                    : 'text-gray-300 hover:bg-[#2d2d2d] hover:text-white hover:shadow-md'
                                }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {tab === 'dashboard' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                    )}
                                    {tab === 'projects' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                    )}
                                    {tab === 'employees' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    )}
                                </svg>
                                <span className="capitalize font-medium">{tab}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                
                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={toggleMobileMenu}>
                        <div className="w-64 h-full bg-[#181818] p-6 border-r border-[#2d2d2d]" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-semibold text-white">
                                    Navigation
                                </h2>
                                <button onClick={toggleMobileMenu} className="text-white hover:text-blue-400 transition-colors">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                            <nav className="space-y-3">
                                {['dashboard', 'projects', 'employees'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            handleTabChange(tab);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all ${
                                            activeTab === tab 
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg text-white'
                                            : 'text-gray-300 hover:bg-[#2d2d2d] hover:text-white'
                                        }`}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {tab === 'dashboard' && (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                            )}
                                            {tab === 'projects' && (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                            )}
                                            {tab === 'employees' && (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                                            )}
                                        </svg>
                                        <span className="capitalize font-medium">{tab}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}
                
                {/* Content Area */}
                <main className="flex-1 p-6 overflow-auto scrollbar-thin scrollbar-thumb-[#2d2d2d] scrollbar-track-[#0f0f0f]">
                    <div className="bg-[#181818] rounded-2xl p-8 shadow-2xl border border-[#2d2d2d]">
                        {activeTab === 'dashboard' && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                                <div className="text-center space-y-6 max-w-2xl">
                                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                        Welcome to Command Center
                                    </h2>
                                    <p className="text-lg text-gray-300 leading-relaxed">
                                        Streamline your management workflow with real-time insights and powerful control tools.
                                    </p>
                                    <div className="animate-float bg-gradient-to-r from-blue-600 to-cyan-600 p-4 w-14 h-14 ring-2 ring-blue-400/50 shadow-2xl rounded-2xl flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'projects' && <Projects />}
                        {activeTab === 'employees' && <Employee />}
                    </div>
                </main>
            </div>
        </div>
    );
}