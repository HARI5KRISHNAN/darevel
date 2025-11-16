/**
 * In-Memory Auth Controller
 *
 * Simple authentication without database
 * Perfect for testing multi-user chat
 */

import bcrypt from 'bcryptjs';

// In-memory user store: email -> user
const users: Map<string, any> = new Map();
let userIdCounter = 1;

/**
 * Register a new user
 */
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    try {
        // Check if user already exists
        if (users.has(email)) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const avatar = `https://i.pravatar.cc/80?u=${email}`;

        const newUser = {
            id: userIdCounter++,
            name,
            email,
            password_hash,
            avatar,
            level: 'Elementary'
        };

        users.set(email, newUser);

        // Return user without password hash
        const userPayload = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            level: newUser.level
        };

        console.log(`✅ User registered: ${email} (ID: ${newUser.id})`);

        res.status(201).json({ user: userPayload });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

/**
 * Login existing user
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        const user = users.get(email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const userPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            level: user.level || 'Elementary'
        };

        console.log(`✅ User logged in: ${email} (ID: ${user.id})`);

        res.status(200).json({ user: userPayload });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

/**
 * Get all registered users (for debugging)
 */
export const getAllUsers = async (req, res) => {
    const userList = Array.from(users.values()).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar
    }));

    res.status(200).json({ users: userList, count: userList.length });
};

/**
 * Clear all users (for testing)
 */
export const clearAllUsers = async (req, res) => {
    users.clear();
    userIdCounter = 1;
    console.log('🗑️  All users cleared');
    res.status(200).json({ message: 'All users cleared' });
};
