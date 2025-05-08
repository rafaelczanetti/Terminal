document.addEventListener('DOMContentLoaded', function() {
    const terminalContent = document.getElementById('terminal-content');
    const currentCommand = document.getElementById('current-command');
    const mobileButtons = document.querySelectorAll('.mobile-button');
    const yearElement = document.getElementById('current-year');
    let commandHistory = [];
    let historyIndex = -1;
    let currentDirectory = "~";
    
    // Lista de todos os comandos disponíveis para navegação com setas
    let allCommands = [];
    let commandNavigationIndex = 0;
    
    // Cache de elementos DOM frequentemente acessados
    const cachedElements = {
        currentLine: null,
        terminalContent: terminalContent
    };
    
    // Função auxiliar para renderizar o ponto verde de forma consistente
    function renderBulletPoint() {
        return '<span style="color: #50fa7b; margin-right: 8px;">•</span>';
    }
    
    // Função de debounce para otimizar eventos repetitivos
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Security measures
    // XSS prevention - Function to sanitize input
    function sanitizeHTML(text) {
        const element = document.createElement('div');
        element.textContent = text;
        return element.innerHTML;
    }

    // Function to sanitize user input before command processing
    function sanitizeInput(input) {
        // Remove any script tags, event handlers, etc.
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                   .replace(/on\w+="[^"]*"/gi, '')
                   .replace(/on\w+='[^']*'/gi, '')
                   .replace(/javascript:/gi, '')
                   .replace(/data:/gi, 'data-safe:');
    }
    
    // Update footer year
    yearElement.textContent = new Date().getFullYear();
    
    // Portfolio content
    const portfolio = {
        about: `# About Me

I am currently studying Computer Science and have an interest in the field of Data Science and CyberSecurity.
Solving Problems with Technology, Offering Efficient and Innovative Solutions.`,

        skills: `# Technical Skills

## Programming Languages
- JavaScript/TypeScript
- HTML5 & CSS3
- Python
- Java
- C

## Tools & Platforms
- Git/GitHub
- Docker
- AWS
- Azure
- GCP
- Firebase
- Linux

## Soft Skills
- Problem Solving
- Team Collaboration
- Continuous Learning`,

        projects: `# My Projects

## Bug Bounty Hunting
- I participated in a bug bounty program where, using automated tools and manual analysis, I discovered a critical vulnerability in subdomains of a system. After thorough investigation and reporting, I was rewarded $2000.
- This process highlighted how automation speeds up discovery, but manual verification is essential to ensure the accuracy of results.
- Link: [Medium Article](https://medium.com/@rafaelczanetti/how-i-earned-2000-automated-bug-bounty-hunting-e46ce02d645d)`,

        education: `# Education

## Computer Science Degree
- Gran Faculdade Ciencia Da Computacao

## CURSOS RELEVANTES
- Linux Fundamentos - FIAP - 2025
- Big Data & Analytics - FIAP - 2025
- Python - FIAP - 2025
- Cloud Computing & Data Science - FIAP - 2025
- Business Intelligence - FIAP - 2025
- Curso de Python 3 do básico ao avançado - com projetos reais - Udemy - 2025
- Docker & Kubernetes: The Practical Guide - Udemy - 2025
- Python-Banco de Dados, ETL Avançado e Automação Web - Udemy - 2025
- Estatística com Linguagem R - Udemy 2025
- Curso de Excel do Básico ao Avançado, Macro e VBA + Power BI - Udemy 2025
- PowerBI + SQLServer - Udemy - 2025
- Complete A.I. & Machine Learning, Data Science Bootcamp - Udemy - 2025
- Iniciante Em Programação - Alura - 2025
- Desenvolvimento Pessoal - Alura - 2025`,

        experience: `# Professional Experience

## Bug Bounty Hunter
- HackerOne Platform, https://hackerone.com/zanettx
- I worked as a bug hunter on the HackerOne platform, participating in Bug Bounty programs where I identified and reported vulnerabilities in corporate systems.
- My experience ranges from analyzing and exploiting security flaws to reporting problems in detail, aiming to contribute to improving digital security and obtaining rewards by fixing these vulnerabilities.

## Senior Frontend Developer
- TechCorp Inc., 2021-Present
- Lead the development of the company's main web application
- Implemented modern UI components and improved performance by 40%
- Technologies: React, TypeScript, GraphQL

## Web Developer
- Digital Solutions Ltd., 2019-2021
- Developed responsive websites for various clients
- Collaborated with design team to implement pixel-perfect interfaces
- Technologies: JavaScript, HTML/CSS, Vue.js`,

        contact: `# Contact Information

- Email: [rafaelczanetti@pm.me](mailto:rafaelczanetti@pm.me)
- LinkedIn: [linkedin.com/in/rafaelczanetti](https://www.linkedin.com/in/rafaelczanetti/)
- GitHub: [github.com/rafaelczanetti](https://github.com/rafaelczanetti)
- Twitter: [@rafaelczanett](https://x.com/rafaelczanett)

Feel free to reach out for collaboration opportunities or just to say hello!`
    };
    
    let commands = {
        'help': function() {
            return `Available commands:
- help: Show this help message
- about: Display information about me
- skills: List my technical and soft skills
- projects: View my portfolio projects
- education: View my educational background
- experience: View my work experience
- contact: Display my contact information
- clear: Clear the terminal screen
- whoami: Show who you are
- ls: List available "files" (commands)
- cat [file]: Display the content of a "file"
- date: Show current date and time
- history: Show command history
- social: Quick links to social profiles`;
        },
        'about': function() {
            return formatMarkdown(portfolio.about);
        },
        'skills': function() {
            const skillsData = {
                "Programming Languages": ["JavaScript/TypeScript", "HTML5 & CSS3", "Python", "Java", "C"],
                "Tools & Platforms": ["Git/GitHub", "Docker", "AWS", "Azure", "GCP", "Firebase", "Linux"],
                "Soft Skills": ["Problem Solving", "Team Collaboration", "Continuous Learning"]
            };
            
            let output = `<div style="color: #ff79c6; font-weight: bold; font-size: 1.4em; margin-bottom: 25px; text-align: center; border-bottom: 2px solid #44475a; padding-bottom: 10px;">Technical Skills</div>`;
            
            for (const category in skillsData) {
                output += `<div style="margin-bottom: 20px;">
                    <div style="color: #bd93f9; font-weight: bold; font-size: 1.1em; margin-bottom: 12px; border-bottom: 1px solid #44475a; padding-bottom: 5px;">${category}</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">`;
                
                skillsData[category].forEach(skill => {
                    output += `<span style="display: inline-block; background-color: #44475a; color: #f8f8f2; padding: 8px 12px; border-radius: 4px; margin-right: 8px; margin-bottom: 8px;">${skill}</span>`;
                });
                
                output += `</div></div>`;
            }
            
            return output;
        },
        'projects': function() {
            let output = `<div class="skills-title" style="color: #ff79c6; font-weight: bold; font-size: 1.4em; margin-bottom: 25px; text-align: center; border-bottom: 2px solid #44475a; padding-bottom: 10px; width: 100%;">My Projects</div>`;
            output += `<div class="skills-container" style="display: flex; flex-direction: column; width: 100%; gap: 30px;">`;
            
            // Bug Bounty Hunting
            output += `<div class="skill-category" style="margin-bottom: 5px; width: 100%;">
                <div class="category-title" style="color: #bd93f9; font-weight: bold; font-size: 1.1em; margin-bottom: 12px; border-bottom: 1px solid #44475a; padding-bottom: 5px;">Bug Bounty Hunting</div>
                <ul style="margin-left: 20px; margin-bottom: 15px; list-style-type: none;">
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">I participated in a bug bounty program where, using automated tools and manual analysis, I discovered a critical vulnerability in subdomains of a system. After thorough investigation and reporting, I was rewarded $2000.</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">This process highlighted how automation speeds up discovery, but manual verification is essential to ensure the accuracy of results.</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Link: <a href="https://medium.com/@rafaelczanetti/how-i-earned-2000-automated-bug-bounty-hunting-e46ce02d645d" target="_blank" style="color: #8be9fd; text-decoration: underline;">Medium Article</a></span></li>
                </ul>
            </div>`;
            
            output += `</div>`;
            return output;
        },
        'education': function() {
            let output = `<div class="skills-title" style="color: #ff79c6; font-weight: bold; font-size: 1.4em; margin-bottom: 25px; text-align: center; border-bottom: 2px solid #44475a; padding-bottom: 10px; width: 100%;">Education</div>`;
            output += `<div class="skills-container" style="display: flex; flex-direction: column; width: 100%; gap: 30px;">`;
            
            // Computer Science Degree
            output += `<div class="skill-category" style="margin-bottom: 5px; width: 100%;">
                <div class="category-title" style="color: #bd93f9; font-weight: bold; font-size: 1.1em; margin-bottom: 12px; border-bottom: 1px solid #44475a; padding-bottom: 5px;">Computer Science Degree</div>
                <ul style="margin-left: 20px; margin-bottom: 15px; list-style-type: none;">
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Gran Faculdade Ciencia Da Computacao</span></li>
                </ul>
            </div>`;
            
            // CURSOS RELEVANTES
            output += `<div class="skill-category" style="margin-bottom: 5px; width: 100%;">
                <div class="category-title" style="color: #bd93f9; font-weight: bold; font-size: 1.1em; margin-bottom: 12px; border-bottom: 1px solid #44475a; padding-bottom: 5px;">CURSOS RELEVANTES</div>
                <ul style="margin-left: 20px; margin-bottom: 15px; list-style-type: none;">
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Linux Fundamentos - FIAP - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Big Data & Analytics - FIAP - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Python - FIAP - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Cloud Computing & Data Science - FIAP - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Business Intelligence - FIAP - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Curso de Python 3 do básico ao avançado - com projetos reais - Udemy - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Docker & Kubernetes: The Practical Guide - Udemy - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Python-Banco de Dados, ETL Avançado e Automação Web - Udemy - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Estatística com Linguagem R - Udemy 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Curso de Excel do Básico ao Avançado, Macro e VBA + Power BI - Udemy 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">PowerBI + SQLServer - Udemy - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Complete A.I. & Machine Learning, Data Science Bootcamp - Udemy - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Iniciante Em Programação - Alura - 2025</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Desenvolvimento Pessoal - Alura - 2025</span></li>
                </ul>
            </div>`;
            
            output += `</div>`;
            return output;
        },
        'experience': function() {
            let output = `<div class="skills-title" style="color: #ff79c6; font-weight: bold; font-size: 1.4em; margin-bottom: 25px; text-align: center; border-bottom: 2px solid #44475a; padding-bottom: 10px; width: 100%;">Professional Experience</div>`;
            output += `<div class="skills-container" style="display: flex; flex-direction: column; width: 100%; gap: 30px;">`;
            
            // Bug Bounty Hunter
            output += `<div class="skill-category" style="margin-bottom: 5px; width: 100%;">
                <div class="category-title" style="color: #bd93f9; font-weight: bold; font-size: 1.1em; margin-bottom: 12px; border-bottom: 1px solid #44475a; padding-bottom: 5px;">Bug Bounty Hunter</div>
                <ul style="margin-left: 20px; margin-bottom: 15px; list-style-type: none;">
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">HackerOne Platform, https://hackerone.com/zanettx</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">I worked as a bug hunter on the HackerOne platform, participating in Bug Bounty programs where I identified and reported vulnerabilities in corporate systems.</span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">My experience ranges from analyzing and exploiting security flaws to reporting problems in detail, aiming to contribute to improving digital security and obtaining rewards by fixing these vulnerabilities.</span></li>
                </ul>
            </div>`;
            
            output += `</div>`;
            return output;
        },
        'contact': function() {
            let output = `<div class="skills-title" style="color: #ff79c6; font-weight: bold; font-size: 1.4em; margin-bottom: 25px; text-align: center; border-bottom: 2px solid #44475a; padding-bottom: 10px; width: 100%;">Contact Information</div>`;
            output += `<div class="skills-container" style="display: flex; flex-direction: column; width: 100%; gap: 30px;">`;
            
            // Contact Information
            output += `<div class="skill-category" style="margin-bottom: 5px; width: 100%;">
                <ul style="margin-left: 20px; margin-bottom: 15px; list-style-type: none;">
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Email: <a href="mailto:rafaelczanetti@pm.me" style="color: #8be9fd; text-decoration: underline;">rafaelczanetti@pm.me</a></span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">LinkedIn: <a href="https://www.linkedin.com/in/rafaelczanetti/" target="_blank" style="color: #8be9fd; text-decoration: underline;">linkedin.com/in/rafaelczanetti</a></span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">GitHub: <a href="https://github.com/rafaelczanetti" target="_blank" style="color: #8be9fd; text-decoration: underline;">github.com/rafaelczanetti</a></span></li>
                    <li style="margin-bottom: 8px;">${renderBulletPoint()}<span style="color: #f8f8f2;">Twitter: <a href="https://x.com/rafaelczanett" target="_blank" style="color: #8be9fd; text-decoration: underline;">@rafaelczanett</a></span></li>
                </ul>
            </div>`;
            
            output += `</div>`;
            output += `<div style="margin-top: 20px;">Feel free to reach out for collaboration opportunities or just to say hello!</div>`;
            return output;
        },
        'clear': function() {
            // This function is handled specially in the processCommand function
            return '';
        },
        'date': function() {
            return new Date().toString();
        },
        'whoami': function() {
            return 'user@system-terminal';
        },
        'history': function() {
            return commandHistory.join('\n');
        },
        'ls': function() {
            return `about.md
skills.md
projects.md
education.md
experience.md
contact.md
help.txt
terminal.js`;
        },
        'social': function() {
            return `<div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 10px;">
  <a href="https://github.com/rafaelczanetti" target="_blank" style="color: #f8f8f2; text-decoration: none;">
    <i class="fab fa-github" style="font-size: 24px;"></i>
  </a>
  <a href="https://www.linkedin.com/in/rafaelczanetti/" target="_blank" style="color: #f8f8f2; text-decoration: none;">
    <i class="fab fa-linkedin" style="font-size: 24px;"></i>
  </a>
  <a href="https://x.com/rafaelczanett" target="_blank" style="color: #f8f8f2; text-decoration: none;">
    <i class="fab fa-twitter" style="font-size: 24px;"></i>
  </a>
  <a href="mailto:rafaelczanetti@pm.me" style="color: #f8f8f2; text-decoration: none;">
    <i class="fas fa-envelope" style="font-size: 24px;"></i>
  </a>
</div>`;
        },
        'cat': function(args) {
            if (!args || args.length === 0) {
                return 'Usage: cat [filename]';
            }
            
            const filename = args[0].toLowerCase();
            
            // Map entre nomes de arquivo e comandos correspondentes
            const fileCommands = {
                'about.md': 'about',
                'skills.md': 'skills',
                'projects.md': 'projects',
                'education.md': 'education',
                'experience.md': 'experience',
                'contact.md': 'contact',
                'help.txt': 'help',
                'terminal.js': function() {
                    return `// This is a simulation of a terminal
// Written in JavaScript
// Version: 1.0

function terminal() {
    console.log("Terminal started");
    // More code would be here...
}`;
                }
            };
            
            // Verifica se o arquivo existe
            if (fileCommands[filename]) {
                if (typeof fileCommands[filename] === 'function') {
                    return fileCommands[filename]();
                } else if (typeof commands[fileCommands[filename]] === 'function') {
                    return commands[fileCommands[filename]]();
                }
            }
            
            return `File not found: ${filename}`;
        }
    };

    // Mobile buttons event handlers - otimizado para usar delegação de eventos
    const mobileButtonsContainer = document.querySelector('.mobile-buttons');
    if (mobileButtonsContainer) {
        mobileButtonsContainer.addEventListener('click', function(e) {
            const button = e.target.closest('.mobile-button');
            if (button) {
                const commandText = button.getAttribute('data-command');
                if (commandText) {
                    // Sanitize command from attribute
                    currentCommand.textContent = sanitizeHTML(commandText);
                    processCommand();
                }
            }
        });
    }

    // Add initial focus
    window.addEventListener('load', initializeTerminal);
    window.addEventListener('click', focusTerminal);

    // Add terminal buttons functionality with improved event handling
    document.querySelector('.terminal-button.close').addEventListener('click', function() {
        alert('This would close the terminal in a real application. Refresh the page to restart.');
    });

    // Current terminal size tracking
    let terminalSizeIndex = 1; // Start with medium size
    const terminalSizes = [
        { height: 'var(--terminal-height-small)', fontSize: '14px' },  // Small
        { height: 'var(--terminal-height-medium)', fontSize: '16px' },  // Medium (default)
        { height: 'var(--terminal-height-large)', fontSize: '18px' }   // Large
    ];
    
    // Terminal sizes específicos para mobile
    const mobileSizes = [
        { height: 'var(--terminal-height-mobile-small)', fontSize: '13px' },  // Small
        { height: 'var(--terminal-height-mobile-medium)', fontSize: '14px' },  // Medium (default)
        { height: 'var(--terminal-height-mobile-large)', fontSize: '16px' }   // Large
    ];

    // Yellow button - Increase terminal size
    document.querySelector('.terminal-button.minimize').addEventListener('click', changeTerminalSize.bind(null, 1));

    // Green button - Decrease terminal size
    document.querySelector('.terminal-button.expand').addEventListener('click', changeTerminalSize.bind(null, -1));

    // Função reutilizável para alterar o tamanho do terminal
    function changeTerminalSize(direction) {
        const terminalContent = document.querySelector('.terminal-content');
        const terminal = document.querySelector('.terminal');
        
        // Verifica se é dispositivo móvel
        const isMobile = window.innerWidth <= 768;
        
        // Use o conjunto de tamanhos apropriado para o dispositivo
        const sizes = isMobile ? mobileSizes : terminalSizes;
        
        // Increase/decrease size (with limits)
        terminalSizeIndex = Math.max(0, Math.min(terminalSizeIndex + direction, sizes.length - 1));
        
        // Apply new size with animation
        terminal.style.transition = 'all 0.3s ease';
        terminalContent.style.transition = 'all 0.3s ease';
        
        // Garantir que não ultrapasse a altura disponível em mobile
        if (isMobile) {
            // Calcular altura máxima disponível considerando a tela
            const maxAvailableHeight = window.innerHeight - 140; // Deduzir espaço para cabeçalho e rodapé
            
            // Definir altura usando CSS var() ou valor calculado, o que for menor
            const computedHeight = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue(sizes[terminalSizeIndex].height.replace('var(', '').replace(')', '')));
                
            terminalContent.style.height = Math.min(computedHeight, maxAvailableHeight) + 'px';
        } else {
            terminalContent.style.height = sizes[terminalSizeIndex].height;
        }
        
        terminalContent.style.fontSize = sizes[terminalSizeIndex].fontSize;
        
        // Visual feedback
        this.classList.add('button-active');
        setTimeout(() => {
            this.classList.remove('button-active');
        }, 300);
        
        // Em dispositivos móveis, ajustar o scroll para manter a visibilidade
        if (isMobile) {
            setTimeout(() => {
                // Garantir que o terminal esteja visível
                const terminalRect = terminal.getBoundingClientRect();
                const isVisible = terminalRect.top >= 0 && 
                                terminalRect.bottom <= window.innerHeight;
                
                if (!isVisible) {
                    terminal.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 350); // Um pouco mais que a duração da animação
        }
        
        // Mostrar notificação de tamanho
        showSizeNotification(terminalSizeIndex, sizes.length - 1);
    }
    
    // Função para mostrar notificação temporária de tamanho
    function showSizeNotification(sizeIndex, maxIndex) {
        // Remove notificação anterior se existir
        const existingNotification = document.querySelector('.size-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = 'size-notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(68, 71, 90, 0.9)';
        notification.style.color = '#f8f8f2';
        notification.style.padding = '8px 16px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '9999';
        notification.style.fontSize = '14px';
        notification.style.fontFamily = "'Courier New', monospace";
        notification.style.transition = 'opacity 0.3s ease';
        
        // Indicador visual de tamanho
        let sizeText = '';
        switch(sizeIndex) {
            case 0: sizeText = 'Small'; break;
            case 1: sizeText = 'Medium'; break;
            case 2: sizeText = 'Large'; break;
        }
        
        // Mostrar barras para representar o tamanho
        let sizeIndicator = '';
        for (let i = 0; i <= maxIndex; i++) {
            sizeIndicator += i <= sizeIndex ? '■' : '□';
        }
        
        notification.textContent = `${sizeText} terminal (${sizeIndicator})`;
        
        // Adicionar à página
        document.body.appendChild(notification);
        
        // Remover após alguns segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Inicialização do terminal com todas as funções necessárias
    function initializeTerminal() {
        showWelcomeMessage();
        focusTerminal();
        initializeCommandsList();
        enhanceCursorBlink();
        addCSPMetaTag();
        
        // Cache do elemento current-line para melhorar performance
        cachedElements.currentLine = document.querySelector('.current-line');
        
        // Otimização: Usar IntersectionObserver para lazy-load se necessário
        setupLazyLoading();
    }
    
    // Setup para lazy loading de conteúdo pesado
    function setupLazyLoading() {
        // Exemplo de lazy loading para imagens ou conteúdo pesado
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Carregar conteúdo quando visível
                    const lazyElement = entry.target;
                    if (lazyElement.dataset.lazySrc) {
                        lazyElement.src = lazyElement.dataset.lazySrc;
                        lazyElement.removeAttribute('data-lazy-src');
                        observer.unobserve(lazyElement);
                    }
                }
            });
        }, { rootMargin: '200px' });
        
        // Observar elementos com data-lazy-src
        document.querySelectorAll('[data-lazy-src]').forEach(el => {
            observer.observe(el);
        });
    }

    function showWelcomeMessage() {
        const welcomeLines = [
            `<span class="welcome">Welcome to my interactive portfolio terminal.</span>`,
            `<span class="welcome">Type <span class="command">help</span> to see available commands.</span>`,
            `<span class="welcome">For mobile users: You can also use the command buttons above.</span>`
        ];
        
        // Otimização: Use documentFragment to reduce reflows
        const fragment = document.createDocumentFragment();
        
        welcomeLines.forEach((line, index) => {
            setTimeout(() => {
                const welcomeLine = document.createElement('div');
                welcomeLine.className = 'terminal-line';
                welcomeLine.innerHTML = line;
                fragment.appendChild(welcomeLine);
                
                // Apenas uma inserção no DOM após todas as linhas estarem prontas
                if (index === welcomeLines.length - 1) {
                    terminalContent.insertBefore(fragment, cachedElements.currentLine);
                    scrollToBottom();
                }
            }, index * 500);
        });
    }

    function focusTerminal() {
        currentCommand.focus();
        
        // Make sure mobile devices can interact with the terminal
        // by making the command visible with a small timeout
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }

    // Função otimizada de rolagem para o final
    function scrollToBottom() {
        requestAnimationFrame(() => {
            terminalContent.scrollTop = terminalContent.scrollHeight;
        });
    }
    
    // Debounce para eventos de rolagem
    const debouncedScroll = debounce(scrollToBottom, 50);

    // Função para inicializar a lista de comandos disponíveis
    function initializeCommandsList() {
        allCommands = Object.keys(commands).sort();
        commandNavigationIndex = 0;
    }

    // Função para navegar entre todos os comandos disponíveis
    function navigateAllCommands(direction) {
        if (allCommands.length === 0) {
            initializeCommandsList();
        }
        
        commandNavigationIndex += direction;
        
        // Loop circular
        if (commandNavigationIndex < 0) {
            commandNavigationIndex = allCommands.length - 1;
        } else if (commandNavigationIndex >= allCommands.length) {
            commandNavigationIndex = 0;
        }
        
        // Atualiza o prompt com o comando atual
        currentCommand.textContent = allCommands[commandNavigationIndex];
    }

    // Enhance the cursor blinking effect
    function enhanceCursorBlink() {
        const cursor = document.querySelector('.cursor');
        cursor.style.transition = 'opacity 0.5s';
        
        setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, 500);
    }
    
    enhanceCursorBlink();

    // Add Content Security Policy meta tag programmatically
    // Note: This is less effective than HTTP headers, but provides a fallback
    function addCSPMetaTag() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; script-src 'self'; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self'";
        document.head.appendChild(meta);
    }
    addCSPMetaTag();

    // Otimização para processamento de comandos
    function processCommand() {
        // Sanitize command before processing
        const commandText = sanitizeInput(currentCommand.textContent.trim());
        
        if (commandText) {
            // Check for potential command injection patterns
            if (/^.*[;&|`()].*$/.test(commandText)) {
                // Log attempted command injection
                console.warn("Potential command injection detected:", commandText);
                const outputLine = document.createElement('div');
                outputLine.className = 'terminal-line';
                outputLine.innerHTML = `<span style="color: #ff5555;">Security warning: Potentially unsafe command detected</span>`;
                terminalContent.insertBefore(outputLine, cachedElements.currentLine);
                currentCommand.textContent = '';
                return;
            }
            
            // Add command to history if it's safe
            commandHistory.push(commandText);
            historyIndex = commandHistory.length;
            
            // Create new line for the command
            const commandLine = document.createElement('div');
            commandLine.className = 'terminal-line';
            
            // Use textContent instead of innerHTML for security
            const promptSpan = document.createElement('span');
            promptSpan.className = 'prompt';
            promptSpan.textContent = `user@system:${currentDirectory}$`;
            
            const commandSpan = document.createElement('span');
            commandSpan.className = 'command';
            commandSpan.textContent = commandText;
            
            commandLine.appendChild(promptSpan);
            commandLine.appendChild(document.createTextNode(' ')); // Space between prompt and command
            commandLine.appendChild(commandSpan);
            
            // Add command to terminal
            terminalContent.insertBefore(commandLine, cachedElements.currentLine);
            
            // Process command
            const parts = commandText.split(' ');
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1).map(arg => sanitizeHTML(arg)); // Sanitize arguments
            
            let output = '';
            if (cmd === 'clear') {
                // Handle clear specially
                while (terminalContent.children.length > 1) {
                    terminalContent.removeChild(terminalContent.firstChild);
                }
            } else if (commands[cmd]) {
                try {
                    // Security: Execute in a try-catch to prevent crashes from malicious input
                    output = commands[cmd](args);
                } catch (error) {
                    console.error("Error executing command:", error);
                    output = `<span style="color: #ff5555;">Error executing command: ${sanitizeHTML(error.message)}</span>`;
                }
            } else {
                output = `Command not found: ${sanitizeHTML(cmd)}. Type 'help' to see available commands.`;
            }
            
            // Usar requestAnimationFrame para operações visuais
            if (output) {
                requestAnimationFrame(() => {
                    const outputLine = document.createElement('div');
                    outputLine.className = 'terminal-line';
                    
                    // Security: Check if output is a trusted HTML from our known commands
                    // or if it needs to be sanitized
                    if (cmd === 'skills' || cmd === 'projects' || cmd === 'education' || 
                        cmd === 'experience' || cmd === 'contact' || cmd === 'social' || 
                        (cmd === 'cat' && args.length > 0 && 
                         ['about.md', 'skills.md', 'projects.md', 'education.md', 
                          'experience.md', 'contact.md', 'help.txt'].includes(args[0]))) {
                        // These commands return trusted HTML that we've created ourselves
                        outputLine.innerHTML = output;
                        
                        // Apply typewriter effect if needed
                        const typewriterElements = outputLine.querySelectorAll('.typewriter');
                        if (typewriterElements.length > 0) {
                            typewriterElements.forEach(element => {
                                const originalContent = element.innerHTML;
                                element.innerHTML = '';
                                
                                const speed = parseInt(element.getAttribute('data-speed')) || 10;
                                let i = 0;
                                
                                function typeWriter() {
                                    if (i < originalContent.length) {
                                        element.innerHTML += originalContent.charAt(i);
                                        i++;
                                        setTimeout(typeWriter, speed);
                                    }
                                }
                                
                                typeWriter();
                            });
                        }
                    } else {
                        // For other outputs, we need to be careful and sanitize
                        if (output.includes('<span') || output.includes('<br>') || output.includes('<a') || 
                            output.includes('<div') || output.includes('<pre')) {
                            // Output contains HTML but it's not from a trusted command
                            // We should sanitize it
                            outputLine.innerHTML = sanitizeInput(output);
                        } else {
                            // Plain text output
                            outputLine.textContent = output.replace(/\n/g, '\n'); // Replace newlines with actual newlines
                            // Use <br> elements for line breaks in a safer way
                            outputLine.innerHTML = outputLine.textContent.replace(/\n/g, '<br>');
                        }
                    }
                    
                    terminalContent.insertBefore(outputLine, cachedElements.currentLine);
                    debouncedScroll();
                });
            }
            
            // Clear current command
            currentCommand.textContent = '';
        }
    }

    // Inicializa o service worker para melhorar o carregamento e capacidade offline
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        }
    }
    
    // Tentar registrar o service worker se disponível
    registerServiceWorker();

    // Format markdown-like text to HTML
    function formatMarkdown(text) {
        // Security: Sanitize the input first
        text = sanitizeHTML(text);
        
        // Handle headings with proper spacing
        text = text.replace(/^# (.*$)/gm, '<div style="color: #ff79c6; font-weight: bold; font-size: 1.4em; margin-bottom: 15px;">$1</div>');
        text = text.replace(/^## (.*$)/gm, '<div style="color: #bd93f9; font-weight: bold; font-size: 1.2em; margin: 15px 0 10px 0;">$1</div>');
        text = text.replace(/^### (.*$)/gm, '<div style="color: #8be9fd; font-weight: bold; margin: 12px 0 8px 0;">$1</div>');
        
        // Process links - be careful with this to avoid XSS
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, function(match, text, url) {
            // Sanitize both text and URL
            const safeText = sanitizeHTML(text);
            // Make sure URL is a safe protocol (http, https, mailto)
            const safeUrl = sanitizeURL(url);
            if (safeUrl) {
                return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color: #8be9fd; text-decoration: underline;">${safeText}</a>`;
            } else {
                return safeText; // If URL is not safe, just display the text
            }
        });
        
        // Remover as marcações de lista "-" e converter para texto normal
        text = text.replace(/^- (.*$)/gm, '$1');
        
        // Split into lines and handle normal paragraphs
        let lines = text.split('\n');
        let formattedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Add the line if it's not empty
            if (line.trim() !== '') {
                formattedLines.push('<div>' + line + '</div>');
            } else {
                formattedLines.push('<div style="height: 10px;"></div>');  // Empty line as spacing
            }
        }
        
        return formattedLines.join('');
    }

    // Security: Function to sanitize URLs to prevent javascript: protocol attacks
    function sanitizeURL(url) {
        // Parse the URL to check its protocol
        try {
            // For relative URLs or those without protocol
            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../') || !url.includes(':')) {
                return url;
            }
            
            // Parse the URL to check protocol
            const parsed = new URL(url);
            const safeProtocols = ['http:', 'https:', 'mailto:'];
            
            if (safeProtocols.includes(parsed.protocol)) {
                return url;
            }
            return null; // Return null for unsafe protocols
        } catch (e) {
            // If URL parsing fails, the URL might be invalid
            return null;
        }
    }

    // Main key press handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            processCommand();
        } else if (e.key === 'Backspace') {
            if (currentCommand.textContent.length > 0) {
                currentCommand.textContent = currentCommand.textContent.slice(0, -1);
            }
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            // Navegar para o comando anterior na lista completa de comandos
            if (e.ctrlKey) {
                navigateAllCommands(-1);
                e.preventDefault();
            }
        } else if (e.key === 'ArrowRight') {
            // Navegar para o próximo comando na lista completa de comandos
            if (e.ctrlKey) {
                navigateAllCommands(1);
                e.preventDefault();
            }
        } else if (e.key === 'ArrowUp') {
            if (e.shiftKey) {
                // Scroll up with Shift+ArrowUp
                terminalContent.scrollTop -= 30;
            } else {
                // Navigate command history
                navigateHistory(-1);
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (e.shiftKey) {
                // Scroll down with Shift+ArrowDown
                terminalContent.scrollTop += 30;
            } else {
                // Navigate command history
                navigateHistory(1);
            }
            e.preventDefault();
        } else if (e.key === 'PageUp') {
            // Scroll up one page
            terminalContent.scrollTop -= terminalContent.clientHeight * 0.8;
            e.preventDefault();
        } else if (e.key === 'PageDown') {
            // Scroll down one page
            terminalContent.scrollTop += terminalContent.clientHeight * 0.8;
            e.preventDefault();
        } else if (e.key === 'Home' && e.ctrlKey) {
            // Scroll to top
            terminalContent.scrollTop = 0;
            e.preventDefault();
        } else if (e.key === 'End' && e.ctrlKey) {
            // Scroll to bottom
            terminalContent.scrollTop = terminalContent.scrollHeight;
            e.preventDefault();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            autoCompleteCommand();
        } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                // Sanitize clipboard content before adding to command
                currentCommand.textContent += sanitizeHTML(text);
            }).catch(err => {
                console.error('Failed to read clipboard contents: ', err);
            });
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            // Add character input validation - only allow safe characters
            // Allow alphanumeric, punctuation, and common special characters
            if (/^[a-zA-Z0-9\s~!@#$%^&*()_+\-=[\]{}|;':",./<>?\\]+$/.test(e.key)) {
                currentCommand.textContent += e.key;
            }
            e.preventDefault();
        }
    });

    function autoCompleteCommand() {
        const commandText = currentCommand.textContent.toLowerCase().trim();
        if (commandText.length === 0) return;
        
        // Verifica se o texto contém espaços (comando com argumentos)
        const parts = commandText.split(' ');
        const command = parts[0];
        
        // Caso 1: Autocompletar comandos
        if (parts.length === 1) {
            const availableCommands = Object.keys(commands);
            const matchingCommands = availableCommands.filter(cmd => cmd.startsWith(command));
            
            if (matchingCommands.length === 1) {
                currentCommand.textContent = matchingCommands[0] + ' ';
            }
        } 
        // Caso 2: Autocompletar argumentos do comando 'cat'
        else if (command === 'cat' && parts.length === 2) {
            const partialFileName = sanitizeHTML(parts[1]);
            const availableFiles = [
                'about.md', 
                'skills.md', 
                'projects.md', 
                'education.md', 
                'experience.md', 
                'contact.md',
                'help.txt',
                'terminal.js'
            ];
            
            const matchingFiles = availableFiles.filter(file => 
                file.toLowerCase().startsWith(partialFileName.toLowerCase())
            );
            
            if (matchingFiles.length === 1) {
                currentCommand.textContent = `cat ${matchingFiles[0]}`;
            } else if (matchingFiles.length > 1) {
                // Encontrar a parte comum mais longa
                let commonPrefix = partialFileName;
                let continueChecking = true;
                
                while (continueChecking && commonPrefix.length < matchingFiles[0].length) {
                    const nextChar = matchingFiles[0][commonPrefix.length];
                    const allHaveSameNextChar = matchingFiles.every(file => 
                        file[commonPrefix.length] === nextChar
                    );
                    
                    if (allHaveSameNextChar) {
                        commonPrefix += nextChar;
                    } else {
                        continueChecking = false;
                    }
                }
                
                if (commonPrefix !== partialFileName) {
                    currentCommand.textContent = `cat ${commonPrefix}`;
                } else {
                    // Mostrar opções disponíveis
                    let output = `<div style="color: #f1fa8c;">Arquivos disponíveis:</div>`;
                    matchingFiles.forEach(file => {
                        output += `<div>${sanitizeHTML(file)}</div>`;
                    });
                    
                    const outputLine = document.createElement('div');
                    outputLine.className = 'terminal-line';
                    outputLine.innerHTML = output;
                    terminalContent.insertBefore(outputLine, cachedElements.currentLine || document.querySelector('.current-line'));
                    scrollToBottom();
                }
            }
        }
    }

    function navigateHistory(direction) {
        if (commandHistory.length === 0) return;
        
        historyIndex += direction;
        
        if (historyIndex < 0) historyIndex = 0;
        if (historyIndex >= commandHistory.length) {
            historyIndex = commandHistory.length - 1;
            // Allow clearing when reaching end of history
            if (direction > 0) {
                historyIndex = commandHistory.length;
                currentCommand.textContent = '';
                return;
            }
        }
        
        currentCommand.textContent = sanitizeHTML(commandHistory[historyIndex]);
    }
}); 