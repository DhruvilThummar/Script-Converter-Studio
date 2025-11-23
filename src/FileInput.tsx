import React from 'react';

interface FileInputProps {
  onFileContent: (content: string, filename?: string) => void;
  label: string;
  accept?: string;
  className?: string;
}

const FileInput: React.FC<FileInputProps> = ({
  onFileContent,
  label,
  accept = '.json,.toon,.txt',
  className = 'file-input-label',
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileContent(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <label className={className}>
      {label}
      <input type="file" accept={accept} onChange={handleFileChange} />
    </label>
  );
};

export default FileInput;
