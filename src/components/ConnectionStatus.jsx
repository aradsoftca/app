import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ConnectionStatus = ({ connectionId }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!connectionId) {
            setLoading(false);
            return;
        }

        // Fetch status immediately
        fetchStatus();

        // Poll status every 30 seconds
        const interval = setInterval(fetchStatus, 30000);

        return () => clearInterval(interval);
    }, [connectionId]);

    const fetchStatus = async () => {
        try {
            const response = await api.get(`/api/vpn/connection-status/${connectionId}`);
            setStatus(response.data);
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch connection status:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    if (error || !status) {
        return null;
    }

    const isSafeZone = status.position <= 250 || status.position === 0;
    const isGracePeriod = status.position > 250;
    const gracePeriodRemaining = status.gracePeriodRemaining || 0;
    const isAtRisk = status.atRisk;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Connection Status</h3>

            {/* Position Display */}
            {status.position > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Your Position:</span>
                        <span className="text-3xl font-bold text-blue-600">#{status.position}</span>
                    </div>
                    
                    {isSafeZone && (
                        <div className="flex items-center bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                            <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <div className="font-semibold text-green-800">Safe Zone</div>
                                <div className="text-sm text-green-700">No disconnection risk - Unlimited time</div>
                            </div>
                        </div>
                    )}

                    {isGracePeriod && !isAtRisk && (
                        <div className="flex items-center bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                            <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <div className="font-semibold text-yellow-800">Grace Period</div>
                                <div className="text-sm text-yellow-700">
                                    {gracePeriodRemaining} minutes remaining
                                </div>
                            </div>
                        </div>
                    )}

                    {isAtRisk && (
                        <div className="flex items-center bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <div className="font-semibold text-red-800">At Risk</div>
                                <div className="text-sm text-red-700">
                                    May be disconnected if server is full
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Capacity Bar */}
            {status.position > 0 && (
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Server Capacity</span>
                        <span>{Math.min(status.position, 250)} / 250</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-4 rounded-full transition-all duration-500 ${
                                isSafeZone ? 'bg-green-500' : 
                                isAtRisk ? 'bg-red-500' : 'bg-yellow-500'
                            }`}
                            style={{ 
                                width: `${Math.min((status.position / 250) * 100, 100)}%` 
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Grace Period Countdown */}
            {isGracePeriod && gracePeriodRemaining > 0 && (
                <div className="mb-6 text-center">
                    <div className="text-sm text-gray-600 mb-2">Grace Period Remaining:</div>
                    <div className="text-4xl font-bold text-yellow-600">
                        {Math.floor(gracePeriodRemaining)} min
                    </div>
                </div>
            )}

            {/* Connection Time */}
            <div className="text-sm text-gray-600 mb-6">
                <div className="flex justify-between mb-1">
                    <span>Connected for:</span>
                    <span className="font-semibold">
                        {status.minutesConnected} minutes
                    </span>
                </div>
            </div>

            {/* Upgrade Prompt for Grace Period Users */}
            {isGracePeriod && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
                    <div className="font-semibold mb-2">
                        â­ Upgrade to Premium
                    </div>
                    <div className="text-sm mb-3">
                        Never worry about disconnection again!
                    </div>
                    <a 
                        href="/subscribe" 
                        className="block text-center bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Upgrade Now - $6.99/month
                    </a>
                </div>
            )}

            {/* Paid User Badge */}
            {status.position === 0 && (
                <div className="flex items-center bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <div>
                        <div className="font-semibold text-purple-800">Premium Priority</div>
                        <div className="text-sm text-purple-700">Never disconnected - Unlimited access</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConnectionStatus;

