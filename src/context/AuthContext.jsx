import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved user in localStorage
        const savedUser = localStorage.getItem('kd_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (credentials) => {
        // Mock login logic
        const mockUser = {
            id: '1',
            name: 'Chimwemwe Kachali',
            email: 'chimwemwe@kwacha.digital',
            handle: '@chimwemwe_kd',
            role: 'Marketer & Creator',
            avatar: 'CK'
        };
        setUser(mockUser);
        localStorage.setItem('kd_user', JSON.stringify(mockUser));
        toast.success('Successfully logged in!', {
            style: {
                background: 'var(--text-1)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
            }
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('kd_user');
        toast.success('Signed out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
