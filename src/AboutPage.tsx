import React, { useState } from 'react';
import './AboutPage.css';

const Collapsible: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="collapsible">
      <button className="collapsible-header" onClick={toggleOpen}>
        {title}
        <span className={`arrow ${isOpen ? 'open' : ''}`}>&#9660;</span>
      </button>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

const AboutPage: React.FC = () => {
  return (
    <div className="about-container">
      <h1>About This Application</h1>
      <p>This is a converter application that translates between two data formats: JSON and TOON.</p>

      <Collapsible title="JSON (JavaScript Object Notation)">
        <p>JSON is a lightweight, text-based data-interchange format. It is easy for humans to read and write and easy for machines to parse and generate. It is based on a subset of the JavaScript Programming Language, Standard ECMA-262 3rd Edition - December 1999. JSON is a text format that is completely language independent but uses conventions that are familiar to programmers of the C-family of languages, including C, C++, C#, Java, JavaScript, Perl, Python, and many others. These properties make JSON an ideal data-interchange language.</p>
      </Collapsible>

      <Collapsible title="TOON (Typed Object-Oriented Notation)">
        <p>TOON is a configuration file format that is designed to be more human-readable and expressive than JSON. It is a superset of YAML, which means any valid YAML is also valid TOON. TOON adds features such as types, schemas, and references to make it more powerful for defining complex data structures. It is particularly well-suited for configuration files and for defining data that has a clear schema.</p>
      </Collapsible>

      <Collapsible title="Key Differences">
        <ul>
          <li><b>Readability:</b> TOON is generally considered more readable than JSON, especially for large and complex datasets.</li>
          <li><b>Expressiveness:</b> TOON is more expressive than JSON, with support for features like comments, types, and schemas.</li>
          <li><b>Strictness:</b> JSON is stricter than TOON, with a more limited set of data types and a more rigid syntax.</li>
          <li><b>Popularity:</b> JSON is more widely used than TOON, especially in web applications and APIs.</li>
        </ul>
      </Collapsible>
    </div>
  );
};

export default AboutPage;
