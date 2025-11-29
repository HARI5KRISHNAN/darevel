import React, { useState } from 'react';
// FIX: Imported StarIcon to fix 'Cannot find name 'StarIcon'' error.
import { DotsVerticalIcon, StarIcon } from '../constants';
import { KeycloakProps } from '../types';
import { useAuth } from '../../contexts/AuthContext';

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const LogOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);


const Header = ({ keycloak }: KeycloakProps) => {
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const isAuthenticated = keycloak?.authenticated || false;
    const username = user?.name || user?.username || user?.email || 'Guest';

    const handleLogin = () => {
        keycloak?.login();
    };

    return (
        <header className="bg-white border-b border-slate-200 flex-shrink-0">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-2">
                             <div className="bg-blue-600 p-2 rounded-lg">
                                <StarIcon className="w-6 h-6 text-white" isFilled={true} />
                            </div>
                            <h1 className="text-xl font-bold text-slate-800">Darevel Mail</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 text-slate-500">
                        {!isAuthenticated ? (
                            <button
                                onClick={handleLogin}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Login
                            </button>
                        ) : (
                            <>
                                <button className="hover:text-slate-800"><BellIcon /></button>
                                <button className="hover:text-slate-800"><CogIcon /></button>
                                <button className="hover:text-slate-800"><MenuIcon /></button>

                                {/* User Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-blue-300 transition-all"
                                    >
                                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                                    </button>

                                    {showProfileMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowProfileMenu(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden">
                                                <div className="p-4 border-b border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white">
                                                            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-slate-900 truncate">
                                                                {user?.name || user?.username || 'User'}
                                                            </div>
                                                            <div className="text-sm text-slate-600 truncate">
                                                                {user?.email || 'No email'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <button
                                                        onClick={logout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                                    >
                                                        <LogOutIcon />
                                                        <span className="font-medium">Sign out</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;