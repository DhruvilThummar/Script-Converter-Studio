import React from 'react';

interface FileInputProps {
  onFileContent: (content: string) => void;
  label: string;
}

const FileInput: React.FC<FileInputProps> = ({ onFileContent, label }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileContent(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <label>
      {label}
      <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
    </label>
  );
};

export default FileInput;
