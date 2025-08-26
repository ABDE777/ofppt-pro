<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OFFPT PRO - Gestion d'Études</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #4361ee;
            --secondary: #3a0ca3;
            --accent: #f72585;
            --success: #4cc9f0;
            --warning: #f9c74f;
            --light: #f8f9fa;
            --dark: #212529;
            --gray: #6c757d;
            --light-gray: #e9ecef;
            --card-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
            --smooth-transition: all 0.3s ease;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: var(--dark);
            line-height: 1.6;
            padding-bottom: 2rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: linear-gradient(to right, var(--primary), var(--secondary));
            color: white;
            padding: 2rem 0;
            text-align: center;
            border-bottom-left-radius: 15px;
            border-bottom-right-radius: 15px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: white;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .tagline {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .version {
            background: rgba(255, 255, 255, 0.2);
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-top: 1rem;
        }
        
        .section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: var(--card-shadow);
            transition: var(--smooth-transition);
        }
        
        .section:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        h2 {
            color: var(--primary);
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--light-gray);
            display: flex;
            align-items: center;
        }
        
        h2 i {
            margin-right: 0.8rem;
            font-size: 1.8rem;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        
        .feature-card {
            background: var(--light);
            border-radius: 10px;
            padding: 1.5rem;
            transition: var(--smooth-transition);
            border-left: 4px solid var(--primary);
        }
        
        .feature-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
            font-size: 2rem;
            color: var(--primary);
            margin-bottom: 1rem;
        }
        
        .feature-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.8rem;
            color: var(--dark);
        }
        
        .feature-desc {
            color: var(--gray);
            font-size: 0.95rem;
        }
        
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .tech-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1.5rem 1rem;
            background: var(--light);
            border-radius: 10px;
            transition: var(--smooth-transition);
        }
        
        .tech-item:hover {
            background: var(--primary);
            color: white;
        }
        
        .tech-item:hover .tech-icon {
            color: white;
        }
        
        .tech-icon {
            font-size: 2.5rem;
            color: var(--primary);
            margin-bottom: 1rem;
        }
        
        .tech-name {
            font-weight: 600;
            text-align: center;
        }
        
        .highlight {
            background: linear-gradient(120deg, rgba(67, 97, 238, 0.1) 0%, rgba(58, 12, 163, 0.1) 100%);
            border-left: 4px solid var(--accent);
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
        }
        
        .btn {
            display: inline-block;
            background: var(--primary);
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            transition: var(--smooth-transition);
            border: none;
            cursor: pointer;
            margin-top: 1rem;
        }
        
        .btn:hover {
            background: var(--secondary);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        
        .contact-item {
            flex: 1;
            min-width: 250px;
            background: var(--light);
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
        }
        
        .contact-icon {
            font-size: 2rem;
            color: var(--primary);
            margin-bottom: 1rem;
        }
        
        footer {
            text-align: center;
            margin-top: 3rem;
            color: var(--gray);
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .features-grid {
                grid-template-columns: 1fr;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .tagline {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <h1>OFFPT PRO - Gestion d'Études</h1>
            <p class="tagline">Application web complète de gestion d'études spécialement conçue pour les étudiants de l'OFPPT au Maroc</p>
            <div class="version">Version 2.1.0</div>
        </div>
    </header>

    <div class="container">
        <section class="section">
            <h2><i class="fas fa-star"></i> Fonctionnalités Principales</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-chart-bar"></i></div>
                    <div class="feature-title">Tableau de Bord Intelligent</div>
                    <div class="feature-desc">Statistiques en temps réel, graphiques interactifs et historique complet de vos activités.</div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-tasks"></i></div>
                    <div class="feature-title">Gestion des Tâches</div>
                    <div class="feature-desc">Créez et organisez vos tâches avec système de priorités et filtres avancés.</div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-calendar-alt"></i></div>
                    <div class="feature-title">Planning Intelligent</div>
                    <div class="feature-desc">Visualisation horaire de votre journée avec analyse automatique du temps.</div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-book"></i></div>
                    <div class="feature-title">Modules OFPPT</div>
                    <div class="feature-desc">Catalogue complet de tous les modules avec coefficients et volumes horaires.</div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="feature-title">Gestion des Notes</div>
                    <div class="feature-desc">Saisie intuitive et calcul automatique des moyennes selon le système OFPPT.</div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-cog"></i></div>
                    <div class="feature-title">Paramètres Personnalisables</div>
                    <div class="feature-desc">Adaptez l'application à votre rythme avec des réglages complets.</div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2><i class="fas fa-laptop-code"></i> Technologies Utilisées</h2>
            <div class="tech-grid">
                <div class="tech-item">
                    <div class="tech-icon"><i class="fab fa-html5"></i></div>
                    <div class="tech-name">HTML5</div>
                </div>
                
                <div class="tech-item">
                    <div class="tech-icon"><i class="fab fa-css3-alt"></i></div>
                    <div class="tech-name">CSS3 / Tailwind</div>
                </div>
                
                <div class="tech-item">
                    <div class="tech-icon"><i class="fab fa-js-square"></i></div>
                    <div class="tech-name">JavaScript Vanilla</div>
                </div>
                
                <div class="tech-item">
                    <div class="tech-icon"><i class="fas fa-chart-pie"></i></div>
                    <div class="tech-name">Chart.js</div>
                </div>
                
                <div class="tech-item">
                    <div class="tech-icon"><i class="fas fa-icons"></i></div>
                    <div class="tech-name">Font Awesome</div>
                </div>
                
                <div class="tech-item">
                    <div class="tech-icon"><i class="fas fa-database"></i></div>
                    <div class="tech-name">LocalStorage</div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2><i class="fas fa-mobile-alt"></i> Design et Expérience Utilisateur</h2>
            <div class="highlight">
                <p>Une interface moderne et intuitive spécialement conçue pour optimiser votre productivité et votre confort d'utilisation.</p>
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-moon"></i></div>
                    <div class="feature-title">Interface Sombre</div>
                    <div class="feature-desc">Confort visuel prolongé et économie d'énergie.</div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-desktop"></i></div>
                    <div class="feature-title">Design Responsive</div>
                    <div class="feature-desc">Adaptation parfaite sur desktop, tablette et mobile.</div>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-paint-brush"></i></div>
                    <div class="feature-title">Animations Fluides</div>
                    <div class="feature-desc">Transitions et effets visuels soignés pour une expérience agréable.</div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2><i class="fas fa-download"></i> Installation et Utilisation</h2>
            <p>OFFPT PRO est une application web qui fonctionne directement dans votre navigateur, sans installation complexe.</p>
            
            <div class="highlight">
                <ol>
                    <li>Téléchargez les fichiers <strong>index.html</strong>, <strong>script.js</strong> et <strong>style.css</strong></li>
                    <li>Ouvrez <strong>index.html</strong> dans votre navigateur</li>
                    <li>Configurez vos paramètres initiaux dans l'onglet ⚙️ Paramètres</li>
                    <li>Commencez par ajouter vos tâches et notes</li>
                </ol>
            </div>
            
            <a href="#" class="btn"><i class="fas fa-download"></i> Télécharger l'Application</a>
        </section>

        <section class="section">
            <h2><i class="fas fa-info-circle"></i> À Propos et Contact</h2>
            <p>OFFPT PRO a été développé spécifiquement pour répondre aux besoins des étudiants de l'OFPPT avec une attention particulière portée à l'expérience utilisateur et aux fonctionnalités pratiques.</p>
            
            <div class="contact-info">
                <div class="contact-item">
                    <div class="contact-icon"><i class="fas fa-user"></i></div>
                    <div class="feature-title">Développeur</div>
                    <p>Abd El Monim Mazgoura</p>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                    <div class="feature-title">Email</div>
                    <p>mazgouraabdalmounim@gmail.com</p>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon"><i class="fab fa-linkedin"></i></div>
                    <div class="feature-title">LinkedIn</div>
                    <p>Abd El Monim Mazgoura</p>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon"><i class="fas fa-globe"></i></div>
                    <div class="feature-title">Portfolio</div>
                    <p>abdelmonim-mazgoura.vercel.app</p>
                </div>
            </div>
        </section>
    </div>

    <footer>
        <div class="container">
            <p>Développé avec ❤️ pour les étudiants OFPPT - © 2023 OFFPT PRO</p>
        </div>
    </footer>
</body>
</html>
