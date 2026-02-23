import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  hover = true,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';

  const variantClasses = {
    default: 'bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20',
    solid: 'bg-white shadow-xl',
    gradient: 'bg-gradient-to-br from-blue-600 to-purple-600',
    glass: 'bg-white bg-opacity-5 backdrop-blur-lg border border-white border-opacity-10',
  };

  const hoverClasses = hover
    ? 'hover:shadow-2xl hover:scale-105 cursor-pointer'
    : '';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.div
      className={classes}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -5 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
