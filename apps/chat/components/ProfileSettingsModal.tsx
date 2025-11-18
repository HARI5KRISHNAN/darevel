import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface ProfileSettingsModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser: (updatedUser: User) => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ user, isOpen, onClose, onUpdateUser }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email || '');
    const [avatar, setAvatar] = useState(user.avatar);

    useEffect(() => {
        setName(user.name);
        setEmail(user.email || '');
        setAvatar(user.avatar);
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({
            ...user,
            name,
            email,
            avatar,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-background-panel rounded-2xl shadow-2xl border border-border-color w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-background-panel border-b border-border-color px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-text-primary">Profile Settings</h2>
                                <p className="text-sm text-text-secondary mt-1">Update your personal information</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background-main text-text-secondary hover:text-text-primary transition-colors"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4 pb-6 border-b border-border-color">
                            <img
                                src={avatar}
                                alt="Avatar Preview"
                                className="w-24 h-24 rounded-full object-cover ring-4 ring-accent/20"
                            />
                            <div className="w-full">
                                <label htmlFor="avatar" className="block text-sm font-medium text-text-secondary mb-2">
                                    Avatar URL
                                </label>
                                <input
                                    type="text"
                                    id="avatar"
                                    value={avatar}
                                    onChange={(e) => setAvatar(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-input-field border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition text-text-primary"
                                    placeholder="https://example.com/avatar.png"
                                />
                                <p className="text-xs text-text-secondary mt-1">
                                    Enter a URL to your profile picture
                                </p>
                            </div>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-input-field border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition text-text-primary"
                                placeholder="Your name"
                            />
                        </div>

                        {/* Email Address */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-input-field border border-border-color rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition text-text-primary"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* User Level (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                User Level
                            </label>
                            <div className="w-full px-4 py-2.5 bg-background-main border border-border-color rounded-lg text-text-primary">
                                {user.level || 'Elementary'}
                            </div>
                            <p className="text-xs text-text-secondary mt-1">
                                Contact an administrator to change your user level
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-border-color">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-2.5 bg-background-main border border-border-color text-text-primary font-semibold rounded-lg hover:bg-input-field transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ProfileSettingsModal;
