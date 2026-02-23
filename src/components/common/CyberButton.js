import React from 'react';
import { motion } from 'framer-motion';

const CyberButton = ({ children, onClick, variant = 'primary', className = '' }) => {
    const baseStyles = "relative px-8 py-3 font-bold text-sm tracking-wider uppercase transition-all duration-200 clip-path-polygon";

    const variants = {
        primary: "bg-cyber-dark text-cyber-green border border-cyber-green hover:bg-cyber-green hover:text-cyber-dark shadow-[0_0_10px_rgba(0,255,136,0.3)] hover:shadow-[0_0_20px_rgba(0,255,136,0.6)]",
        secondary: "bg-cyber-dark text-cyber-cyan border border-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-dark shadow-[0_0_10px_rgba(0,229,255,0.3)] hover:shadow-[0_0_20px_rgba(0,229,255,0.6)]",
        danger: "bg-cyber-dark text-cyber-red border border-cyber-red hover:bg-cyber-red hover:text-cyber-dark shadow-[0_0_10px_rgba(255,0,85,0.3)] hover:shadow-[0_0_20px_rgba(255,0,85,0.6)]",
    };

    return (
        <motion.button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
            {/* Glitch Effect Overlay */}
            <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-100" />
        </motion.button>
    );
};

export default CyberButton;
