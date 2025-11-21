document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    const themeIcon = document.getElementById('themeIcon');
    const jsonInput = document.getElementById('jsonInput');
    const toonInput = document.getElementById('toonInput');
    const outputBox = document.getElementById('outputBox');
    const btnJsonToToon = document.getElementById('btnJsonToToon');
    const btnToonToJson = document.getElementById('btnToonToJson');
    const btnJsonClear = document.getElementById('btnJsonClear');
    const btnToonClear = document.getElementById('btnToonClear');
    const btnToonSample = document.getElementById('btnToonSample');
    const modeJson = document.getElementById('modeJson');
    const modeToon = document.getElementById('modeToon');
    const btnCopy = document.getElementById('btnCopy');

    // --- Mobile Menu ---
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        mobileMenuBtn.textContent = sidebar.classList.contains('open') ? '✕' : '☰';
    });

    // --- Navigation ---
    navItems.forEach(link => {
        link.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            link.classList.add('active');
            const target = document.querySelector(link.getAttribute('data-target'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
            sidebar.classList.remove('open');
            mobileMenuBtn.textContent = '☰';
        });
    });

    // --- Theme Switcher ---
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            themeLabel.textContent = 'Day Mode';
            themeIcon.textContent = '🌞';
        } else {
            document.body.classList.remove('light-theme');
            themeLabel.textContent = 'Night Mode';
            themeIcon.textContent = '🌙';
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- Mode Switcher ---
    function toggleMode(mode) {
        const isJsonMode = mode === 'json';
        modeJson.classList.toggle('active', isJsonMode);
        modeToon.classList.toggle('active', !isJsonMode);

        document.getElementById('jsonCard').classList.toggle('inactive', !isJsonMode);
        document.getElementById('toonCard').classList.toggle('inactive', isJsonMode);

        btnJsonToToon.disabled = !isJsonMode;
        btnToonToJson.disabled = isJsonMode;
    }

    modeJson.addEventListener('click', () => toggleMode('json'));
    modeToon.addEventListener('click', () => toggleMode('toon'));

    // --- Conversion Logic ---
    function jsonToToon(obj, indent = '') {
        let toon = '';
        for (const key in obj) {
            const value = obj[key];
            if (Array.isArray(value)) {
                toon += `${indent}${key}:\n`;
                value.forEach(item => {
                    if (typeof item === 'object' && item !== null) {
                        toon += `${indent}  - \n${jsonToToon(item, indent + '    ')}`;
                    } else {
                        toon += `${indent}  - ${item}\n`;
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                toon += `${indent}${key}:\n${jsonToToon(value, indent + '  ')}`;
            } else {
                toon += `${indent}${key}: ${value}\n`;
            }
        }
        return toon;
    }

    function toonToJson(toon) {
        const lines = toon.trim().split('\n');
        let obj = {};
        const parentStack = [];

        for (const line of lines) {
            const indent = line.match(/^\s*/)[0].length;
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
                        const wrapper = {};
                        wrapper[key] = newObj;
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

    btnJsonToToon.addEventListener('click', () => {
        try {
            const data = JSON.parse(jsonInput.value);
            const out = jsonToToon(data).trim();
            toonInput.value = out;
            outputBox.textContent = out;
            document.getElementById('output-section').scrollIntoView({ behavior: 'smooth' });
        } catch (e) {
            outputBox.textContent = `❌ Invalid JSON: ${e.message}`;
        }
    });

    btnToonToJson.addEventListener('click', () => {
        try {
            const obj = toonToJson(toonInput.value);
            const result = JSON.stringify(obj, null, 2);
            jsonInput.value = result;
            outputBox.textContent = result;
            document.getElementById('output-section').scrollIntoView({ behavior: 'smooth' });
        } catch (e) {
            outputBox.textContent = `❌ Invalid TOON: ${e.message}`;
        }
    });

    // --- UI Actions ---
    btnJsonClear.addEventListener('click', () => {
        jsonInput.value = '';
        outputBox.textContent = 'Waiting for input...';
        localStorage.removeItem('jsonInput');
    });

    btnToonClear.addEventListener('click', () => {
        toonInput.value = '';
        outputBox.textContent = 'Waiting for input...';
        localStorage.removeItem('toonInput');
    });

    btnToonSample.addEventListener('click', () => {
        toonInput.value = `🎬 Title: Project Alpha\n📍 Setting: Lab 42\n\n👥 Characters:\n  - name: Alice\n    role: Admin\n  - name: Bob\n    role: User`;
    });

    btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(outputBox.textContent).then(() => {
            btnCopy.textContent = '✅ Copied';
            setTimeout(() => (btnCopy.textContent = '📋 Copy Output'), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    // --- Persistence --
    window.addEventListener('load', () => {
        const savedJson = localStorage.getItem('jsonInput');
        if (savedJson !== null) jsonInput.value = savedJson;

        const savedToon = localStorage.getItem('toonInput');
        if (savedToon !== null) toonInput.value = savedToon;
    });

    jsonInput.addEventListener('input', () => {
        localStorage.setItem('jsonInput', jsonInput.value);
    });

    toonInput.addEventListener('input', () => {
        localStorage.setItem('toonInput', toonInput.value);
    });
});
