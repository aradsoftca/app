import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { apiService } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ForgotPassword = () => {
    useDocumentTitle('Forgot Password');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await apiService.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            // Always show success to prevent email enumeration (matches backend behavior)
            setSuccess(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                    animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <motion.div
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link
                    to="/login"
                    className="inline-flex items-center text-white hover:text-blue-300 mb-6 transition"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Login
                </Link>

                <Card className="p-8">
                    <div className="text-center mb-8">
                        <motion.img
                            src="/logos/logo_vpnxo_original.png"
                            alt="VPN XO"
                            className="h-16 mx-auto mb-4"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-gray-300">
                            Enter your email and we'll send you a reset link
                        </p>
                    </div>

                    {success ? (
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <FaCheckCircle className="text-green-400 text-5xl mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
                            <p className="text-gray-300 mb-6">
                                If an account exists with <strong className="text-white">{email}</strong>,
                                you'll receive a password reset link shortly.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                            >
                                Return to Login
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            {error && (
                                <motion.div
                                    className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="text-sm">{error}</p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    placeholder="your@email.com"
                                    icon={<FaEnvelope />}
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Send Reset Link
                                </Button>
                            </form>

                            <div className="text-center mt-6">
                                <p className="text-gray-300">
                                    Remember your password?{' '}
                                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
