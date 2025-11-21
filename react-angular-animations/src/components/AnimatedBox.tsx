import { motion } from 'framer-motion';
import React from 'react';

const AnimatedBox: React.FC = () => {
  return (
    <motion.div
      style={{
        width: 150,
        height: 150,
        borderRadius: '30px',
        backgroundColor: '#fff',
        margin: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      whileHover={{ scale: 1.1, rotate: 90 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <h2 style={{ color: '#333' }}>Hover me</h2>
    </motion.div>
  );
};

export default AnimatedBox;
