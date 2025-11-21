import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  theme = localStorage.getItem('theme') || 'dark';
  sidebarOpen = false;
  activeNav = '#converter';
  mode = 'json';

  jsonInput = localStorage.getItem('jsonInput') || `{
  "title": "Project Alpha",
  "setting": "Lab 42",
  "characters": [
    { "name": "Alice", "role": "Admin" },
    { "name": "Bob", "role": "User" }
  ]
}`;
  toonInput = localStorage.getItem('toonInput') || `🎬 Title: Project Alpha\n📍 Setting: Lab 42\n\n👥 Characters:\n  - name: Alice\n    role: Admin\n  - name: Bob\n    role: User`;
  output = 'Waiting for input...';

  ngOnInit(): void {
    this.applyTheme(this.theme);
    this.jsonInput = localStorage.getItem('jsonInput') || this.jsonInput;
    this.toonInput = localStorage.getItem('toonInput') || this.toonInput;
  }

  applyTheme(theme: string): void {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
    this.theme = theme;
  }

  toggleTheme(): void {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  handleNavClick(target: string): void {
    this.activeNav = target;
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.sidebarOpen = false;
  }

  handleJsonToToon(): void {
    try {
      const data = JSON.parse(this.jsonInput);
      const out = this.jsonToToon(data).trim();
      this.toonInput = out;
      this.output = out;
      this.handleNavClick('#output-section');
    } catch (e: any) {
      this.output = `❌ Invalid JSON: ${e.message}`;
    }
    localStorage.setItem('jsonInput', this.jsonInput);
  }

  handleToonToJson(): void {
    try {
      const obj = this.toonToJason(this.toonInput);
      const result = JSON.stringify(obj, null, 2);
      this.jsonInput = result;
      this.output = result;
      this.handleNavClick('#output-section');
    } catch (e: any) {
      this.output = `❌ Invalid TOON: ${e.message}`;
    }
    localStorage.setItem('toonInput', this.toonInput);
  }

  fillSampleToon(): void {
    this.toonInput = `🎬 Title: Project Alpha\n📍 Setting: Lab 42\n\n👥 Characters:\n  - name: Alice\n    role: Admin\n  - name: Bob\n    role: User`;
  }

  handleCopy(): void {
    navigator.clipboard.writeText(this.output).then(() => {
      // You can add a visual confirmation here if you want
    });
  }

  // --- Helper Functions for TOON Conversion ---
  jsonToToon(obj: any, indent = ''): string {
    let toon = '';
    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        toon += `${indent}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            toon += `${indent}  - \n${this.jsonToToon(item, indent + '    ')}`;
          } else {
            toon += `${indent}  - ${item}\n`;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        toon += `${indent}${key}:\n${this.jsonToToon(value, indent + '  ')}`;
      } else {
        toon += `${indent}${key}: ${value}\n`;
      }
    }
    return toon;
  }

  toonToJason(toon: string): any {
    const lines = toon.trim().split('\n');
    let obj: any = {};
    const parentStack: any[] = [];

    for (const line of lines) {
      const indent = line.match(/^\s*/)?.[0].length || 0;
      const content = line.trim();

      if (!content) continue;

      let level = indent / 2;
      while (level < parentStack.length) {
        parentStack.pop();
      }

      const currentObj = parentStack.length > 0 ? parentStack[parentStack.length - 1] : obj;

      if (content.startsWith('-')) { // Array item
        const itemContent = content.substring(1).trim();
        if (!Array.isArray(currentObj)) {
          // This case needs more robust handling depending on expected TOON structure
        } else {
          currentObj.push(itemContent); // Simplified, assumes simple values
        }
      } else {
        const [key, ...valueParts] = content.split(':');
        const value = valueParts.join(':').trim();

        if (value === '') { // Likely a new object
          const newObj = {};
          if (Array.isArray(currentObj)) {
            const wrapper: any = {};
            wrapper[key.trim()] = newObj;
            currentObj.push(wrapper);
            parentStack.push(newObj);
          } else {
            currentObj[key.trim()] = newObj;
            parentStack.push(newObj);
          }
        } else {
          currentObj[key.trim()] = value;
        }
      }
    }

    return obj;
  }
}
