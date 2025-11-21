import React from 'react';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page-content">
      <h2>About TOON</h2>
      <p>
        TOON is a simplified, human-readable data notation that feels like a blend of JSON and YAML but is designed to be cleaner and more intuitive.
      </p>
      <p>
        This studio provides a real-time, in-browser converter to bridge the gap between standard JSON and the TOON format.
      </p>
    </div>
  );
};

export default AboutPage;
