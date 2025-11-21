document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    const themeIcon = document.getElementById('themeIcon');

    // --- Mobile Menu ---
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            mobileMenuBtn.textContent = sidebar.classList.contains('open') ? '✕' : '☰';
        });
    }

    // --- Theme Switcher ---
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            if (themeLabel) themeLabel.textContent = 'Day Mode';
            if (themeIcon) themeIcon.textContent = '🌞';
        } else {
            document.body.classList.remove('light-theme');
            if (themeLabel) themeLabel.textContent = 'Night Mode';
            if (themeIcon) themeIcon.textContent = '🌙';
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- Converter-specific logic ---
    if (document.getElementById('converter')) {
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
            const parentStack = [{-1: obj}];
            let multiLineKey = null;
            let multiLineValue = '';

            for (const line of lines) {
                const indent = line.match(/^\s*/)[0].length;
                const content = line.trim();
                
                if (multiLineKey && indent > Object.keys(parentStack[parentStack.length - 1])[0]) {
                    multiLineValue += '\n' + content;
                    continue;
                } else if (multiLineKey) {
                    Object.values(parentStack[parentStack.length - 1])[0][multiLineKey] = multiLineValue;
                    multiLineKey = null;
                    multiLineValue = '';
                }

                if (!content) continue;

                while (indent <= Object.keys(parentStack[parentStack.length - 1])[0]) {
                    parentStack.pop();
                }
                
                let parentObj = Object.values(parentStack[parentStack.length - 1])[0];

                if (content.startsWith('-')) {
                    const itemContent = content.substring(1).trim();
                    if (Array.isArray(parentObj)) {
                        if(itemContent.includes(':')){
                            const [key, ...valueParts] = itemContent.split(':');
                            const value = valueParts.join(':').trim();
                            const newObj = {};
                            newObj[key.trim()] = value;
                            parentObj.push(newObj);
                            parentStack.push({[indent]: newObj});
                        } else {
                            parentObj.push(itemContent);
                        }
                    } else {
                        // This case needs more robust handling depending on expected TOON structure
                    }
                } else {
                    const [key, ...valueParts] = content.split(':');
                    const value = valueParts.join(':').trim();

                    if (value === '') {
                        if (line.includes('[]') || line.includes('[2]')) {
                            const newArr = [];
                            parentObj[key.trim().replace('[]', '').replace('[2]','')] = newArr;
                            parentStack.push({[indent]: newArr});
                        } else {
                            multiLineKey = key.trim();
                            multiLineValue = '';
                        }
                    } else {
                        parentObj[key.trim()] = value;
                    }
                }
            }
            if (multiLineKey) {
                Object.values(parentStack[parentStack.length - 1])[0][multiLineKey] = multiLineValue;
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
            fetch('sample.toon')
                .then(response => response.text())
                .then(data => {
                    toonInput.value = data;
                });
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
    }
});
