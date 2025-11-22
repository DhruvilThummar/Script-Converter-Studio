import React from 'react';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-container">
      <img
        src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=TOON%20/%20JSON%20Converter%20🚀&fontSize=40&fontAlignY=35&desc=A%20free,%20online,%20and%20open-source%20tool%20to%20convert%20between%20TOON%20and%20JSON%20formats.%20Edit,%20validate,%20and%20convert%20your%20data%20with%20ease.🚀&descAlignY=55&descAlign=50"
        alt="Banner"
        style={{ width: '100%' }}
      />

      <div className="about-section">
        <h2>About This Project</h2>
        <ul>
          <li>This is a free, online, and open-source tool to convert between TOON and JSON formats.</li>
          <li>It provides a simple and intuitive interface to edit, validate, and convert your data with ease.</li>
          <li>The project is built with React, TypeScript, and Monaco Editor to provide a fast and reliable experience.</li>
        </ul>
      </div>

      <div className="about-section">
        <h2>💻 Tech Stack</h2>
        <h3>Languages & Core</h3>
        <p>
          <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
          <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
          <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript" />
          <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
          <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
        </p>
        <h3>Tools & Platforms</h3>
        <p>
          <img src="https://img.shields.io/badge/Monaco%20Editor-007ACC.svg?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Monaco Editor" />
          <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
          <img src="https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white" alt="Git" />
        </p>
      </div>

      <div className="about-section">
        <h2>🚀 Features</h2>
        <ul>
          <li><strong>Live Conversion</strong>: Convert between TOON and JSON in real-time.</li>
          <li><strong>Syntax Highlighting</strong>: The editor supports syntax highlighting for both TOON and JSON.</li>
          <li><strong>Error Highlighting</strong>: The editor will highlight any syntax errors in your TOON or JSON.</li>
          <li><strong>File I/O</strong>: You can upload and download your TOON and JSON files.</li>
          <li><strong>Themes</strong>: The editor supports both light and dark themes.</li>
        </ul>
      </div>

      <div className="about-section">
        <h2>📖 How to Use</h2>
        <ol>
          <li>Go to the website.</li>
          <li>Enter your TOON or JSON in the editor.</li>
          <li>The editor will automatically convert your data to the other format.</li>
          <li>You can then download your converted data.</li>
        </ol>
      </div>

      <div className="about-section">
        <h2>🔑 Key Differences</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>TOON</th>
              <th>JSON</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Syntax</strong></td>
              <td>More relaxed, no quotes required around keys.</td>
              <td>Strict, requires quotes around keys.</td>
            </tr>
            <tr>
              <td><strong>Comments</strong></td>
              <td>Allows for comments.</td>
              <td>Does not allow for comments.</td>
            </tr>
            <tr>
              <td><strong>Data Types</strong></td>
              <td>Supports a wider range of data types.</td>
              <td>Supports a limited range of data types.</td>
            </tr>
            <tr>
              <td><strong>Readability</strong></td>
              <td>Often more human-readable for simple data.</td>
              <td>Can be more verbose but is machine-readable.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <img
        src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=footer"
        alt="Footer"
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default AboutPage;
