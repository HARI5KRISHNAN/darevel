/**
 * PostgreSQL Auth Controller
 *
 * Production-ready authentication with PostgreSQL database
 */

import bcrypt from 'bcryptjs';
import { db } from '../db';

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
        const existingUserResult = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUserResult.rows.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Generate avatar
        const avatar = `https://i.pravatar.cc/80?u=${email}`;

        // Insert new user
        const result = await db.query(
            'INSERT INTO users (name, email, password_hash, avatar) VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar, level',
            [name, email, password_hash, avatar]
        );

        const newUser = result.rows[0];

        console.log(`✅ User registered: ${email} (ID: ${newUser.id})`);

        res.status(201).json({ user: newUser });

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
        // Find user by email
        const result = await db.query(
            'SELECT id, name, email, avatar, password_hash, level FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Return user without password hash
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
 * Get all registered users (for user discovery)
 */
export const getAllUsers = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, email, avatar, level FROM users ORDER BY created_at DESC'
        );

        res.status(200).json({
            users: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
};

/**
 * Clear all users (for testing only - remove in production)
 */
export const clearAllUsers = async (req, res) => {
    try {
        await db.query('TRUNCATE TABLE users CASCADE');
        console.log('🗑️  All users cleared');
        res.status(200).json({ message: 'All users cleared' });
    } catch (error) {
        console.error('Error clearing users:', error);
        res.status(500).json({ message: 'Server error while clearing users.' });
    }
};
