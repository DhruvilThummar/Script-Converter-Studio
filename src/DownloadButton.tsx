import React from 'react';

interface DownloadButtonProps {
  content: string;
  filename: string;
  label: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ content, filename, label }) => {
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <button onClick={handleDownload}>{label}</button>;
};

export default DownloadButton;
