import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ServerCapacityDisplay = () => {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCapacity();
        const interval = setInterval(fetchCapacity, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchCapacity = async () => {
        try {
            const response = await api.get('/api/vpn/server-capacity');
            setServers(response.data.servers || []);
        } catch (error) {
            console.error('Failed to fetch server capacity:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                    <div key={i} className="bg-white bg-opacity-5 rounded-xl p-5 animate-pulse">
                        <div className="h-5 bg-white bg-opacity-10 rounded w-1/2 mb-3"></div>
                        <div className="h-3 bg-white bg-opacity-10 rounded w-full mb-2"></div>
                        <div className="h-6 bg-white bg-opacity-10 rounded w-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (servers.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {servers.map(server => (
                <ServerCard key={server.server_id} server={server} />
            ))}
        </div>
    );
};

const ServerCard = ({ server }) => {
    const maxCapacity = server.max_safe_capacity || 250;
    const capacityPercent = (server.active_free_connections / maxCapacity) * 100;
    const isAvailable = server.status === 'available';
    const isGracePeriod = server.status === 'grace_period';
    const isFull = server.status === 'full';
    const slotsLeft = Math.max(0, maxCapacity - server.active_free_connections);

    const getFlag = (location) => {
        if (!location) return '\u{1F30D}';
        if (location.includes('Canada')) return '\u{1F1E8}\u{1F1E6}';
        if (location.includes('France')) return '\u{1F1EB}\u{1F1F7}';
        if (location.includes('Germany')) return '\u{1F1E9}\u{1F1EA}';
        if (location.includes('Netherlands')) return '\u{1F1F3}\u{1F1F1}';
        return '\u{1F30D}';
    };

    return (
        <div className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-5 hover:bg-opacity-10 transition-all">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{getFlag(server.location)}</span>
                    <div>
                        <h4 className="text-white font-semibold text-sm">{server.server_name}</h4>
                        <p className="text-gray-400 text-xs">{server.location}</p>
                    </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isAvailable ? 'bg-green-500 bg-opacity-20 text-green-400' :
                    isGracePeriod ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                    'bg-red-500 bg-opacity-20 text-red-400'
                }`}>
                    {isAvailable ? '\u25CF Available' : isGracePeriod ? '\u25CF Busy' : '\u25CF Full'}
                </span>
            </div>

            <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Free slots</span>
                    <span className="font-medium text-white">{slotsLeft} / {maxCapacity}</span>
                </div>
                <div className="w-full bg-white bg-opacity-10 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                            capacityPercent < 80 ? 'bg-green-500' :
                            capacityPercent < 100 ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                    />
                </div>
            </div>

            <p className={`text-xs mt-2 ${
                isAvailable ? 'text-green-400' : isGracePeriod ? 'text-yellow-400' : 'text-red-400'
            }`}>
                {isAvailable && `\u2713 ${slotsLeft} safe slots available`}
                {isGracePeriod && '\u23F3 Server busy \u2014 new connections get 20 min grace period'}
                {isFull && '\u2717 Server full \u2014 try again shortly'}
            </p>
        </div>
    );
};

export default ServerCapacityDisplay;

