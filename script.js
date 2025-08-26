        const MODULES_OFPPT = [
            { id: 1, code: 'EGTS202', title: 'Français', hours: 115, coefficient: 2, efm: false },
            { id: 2, code: 'EGTS203', title: 'Anglais technique', hours: 50, coefficient: 2, efm: false },
            { id: 3, code: 'EGTS204', title: 'Culture entrepreneuriale', hours: 45, coefficient: 2, efm: false },
            { id: 4, code: 'EGTS205', title: 'Compétences comportementales', hours: 30, coefficient: 2, efm: false },
            { id: 5, code: 'EGTS208', title: 'Entrepreneuriat-PIE 2', hours: 80, coefficient: 2, efm: false },
            { id: 6, code: 'EGTSA206', title: 'Culture et techniques avancées du numérique', hours: 30, coefficient: 1, efm: false },
            { id: 7, code: 'M201', title: 'Préparation d\'un projet web', hours: 60, coefficient: 1, efm: false },
            { id: 8, code: 'M202', title: 'Approche agile', hours: 120, coefficient: 2, efm: false },
            { id: 9, code: 'M203', title: 'Gestion des données', hours: 90, coefficient: 2, efm: false },
            { id: 10, code: 'M204', title: 'Développement front-end', hours: 90, coefficient: 3, efm: true },
            { id: 11, code: 'M205', title: 'Développement back-end', hours: 120, coefficient: 3, efm: true },
            { id: 12, code: 'M206', title: 'Création d\'une application Cloud native', hours: 90, coefficient: 2, efm: false },
            { id: 13, code: 'M207', title: 'Projet de synthèse', hours: 60, coefficient: 2, efm: false },
            { id: 14, code: 'M208', title: 'Intégration du milieu professionnel', hours: 160, coefficient: 2, efm: false }
        ];

        // ===== ÉTAT DE L'APPLICATION =====
        let currentTab = 'dashboard';
        let currentDate = new Date();

        let appData = {
            tasks: [],
            grades: [],
            settings: {
                wakeUpTime: '07:00',
                bedTime: '23:00',
                studyGoal: 8,
                hasLunchBreak: true,
                lunchStart: '12:00',
                lunchEnd: '13:00',
                hasSchool: true,
                schoolStartTime: '08:00',
                schoolEndTime: '17:00'
            },
            modules: MODULES_OFPPT
        };

        // ===== GESTIONNAIRE DE DONNÉES =====
        class DataManager {
            static STORAGE_KEYS = {
                tasks: 'offpt_tasks',
                grades: 'offpt_grades',
                settings: 'offpt_settings'
            };

            static save(key, data) {
                try {
                    localStorage.setItem(this.STORAGE_KEYS[key], JSON.stringify(data));
                    return true;
                } catch (error) {
                    console.error(`Erreur sauvegarde ${key}:`, error);
                    showToast('❌ Erreur de sauvegarde', 'error');
                    return false;
                }
            }

            static load(key, defaultValue = []) {
                try {
                    const data = localStorage.getItem(this.STORAGE_KEYS[key]);
                    return data ? JSON.parse(data) : defaultValue;
                } catch (error) {
                    console.error(`Erreur chargement ${key}:`, error);
                    return defaultValue;
                }
            }

            static initializeData() {
                appData.tasks = this.load('tasks', []);
                appData.grades = this.load('grades', []);
                appData.settings = { ...appData.settings, ...this.load('settings', {}) };
                showToast('✅ Données chargées avec succès', 'success');
            }

            static exportAllData() {
                try {
                    const exportData = {
                        ...appData,
                        exportDate: new Date().toISOString(),
                        version: '1.0'
                    };

                    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                        type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `offpt-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);

                    showToast('✅ Données exportées avec succès!', 'success');
                } catch (error) {
                    console.error('Erreur export:', error);
                    showToast('❌ Erreur lors de l\'export', 'error');
                }
            }

            static importAllData(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);

                        if (importedData.tasks) appData.tasks = importedData.tasks;
                        if (importedData.grades) appData.grades = importedData.grades;
                        if (importedData.settings) appData.settings = { ...appData.settings, ...importedData.settings };

                        this.save('tasks', appData.tasks);
                        this.save('grades', appData.grades);
                        this.save('settings', appData.settings);

                        renderTasks();
                        renderGrades();
                        updateDashboardStats();
                        loadSettings();

                        showToast('✅ Données importées avec succès!', 'success');
                    } catch (error) {
                        console.error('Erreur import:', error);
                        showToast('❌ Erreur lors de l\'import des données', 'error');
                    }
                };
                reader.readAsText(file);
            }

            static resetAllData() {
                if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
                    try {
                        Object.values(this.STORAGE_KEYS).forEach(key => {
                            localStorage.removeItem(key);
                        });

                        appData.tasks = [];
                        appData.grades = [];
                        appData.settings = {
                            wakeUpTime: '07:00',
                            bedTime: '23:00',
                            studyGoal: 8,
                            hasLunchBreak: true,
                            lunchStart: '12:00',
                            lunchEnd: '13:00',
                            hasSchool: true,
                            schoolStartTime: '08:00',
                            schoolEndTime: '17:00'
                        };

                        renderTasks();
                        renderGrades();
                        updateDashboardStats();
                        loadSettings();

                        showToast('🔄 Données réinitialisées', 'info');
                    } catch (error) {
                        console.error('Erreur reset:', error);
                        showToast('❌ Erreur lors de la réinitialisation', 'error');
                    }
                }
            }
        }

        // ===== SYSTÈME DE NOTIFICATIONS =====
        function showToast(message, type = 'info', duration = 3000) {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toast-message');

            // Configuration des styles selon le type
            const styles = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };

            toast.style.backgroundColor = styles[type] || styles.info;
            toastMessage.textContent = message;

            // Affichage avec animation
            toast.classList.add('show');

            // Masquage automatique
            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        }

        // ===== GESTIONNAIRE DE TÂCHES =====
        class TaskManager {
            static validateTask(taskData, isEdit = false) {
                const errors = [];

                if (!taskData.name || taskData.name.trim().length < 3) {
                    errors.push('Le nom doit contenir au moins 3 caractères');
                }

                if (!taskData.moduleId || !MODULES_OFPPT.find(m => m.id === parseInt(taskData.moduleId))) {
                    errors.push('Module invalide');
                }

                if (!['low', 'medium', 'high'].includes(taskData.priority)) {
                    errors.push('Priorité invalide');
                }

                if (!taskData.date) {
                    errors.push('Date requise');
                }

                if (!taskData.time) {
                    errors.push('Heure requise');
                }

                // Vérifier si la tâche est dans le passé (seulement pour les nouvelles tâches)
                if (!isEdit) {
                    const taskDateTime = new Date(`${taskData.date}T${taskData.time}`);
                    const now = new Date();

                    if (taskDateTime < now) {
                        errors.push('Impossible de créer une tâche dans le passé');
                    }
                }

                const duration = parseInt(taskData.duration);
                if (isNaN(duration) || duration < 15 || duration > 480) {
                    errors.push('Durée invalide (15-480 minutes)');
                }

                return errors;
            }

            static createTask(taskData) {
                try {
                    const errors = this.validateTask(taskData, false);
                    if (errors.length > 0) {
                        showToast(`❌ ${errors.join(', ')}`, 'error');
                        return false;
                    }

                    const newTask = {
                        id: Date.now() + Math.random(),
                        name: taskData.name.trim(),
                        moduleId: parseInt(taskData.moduleId),
                        priority: taskData.priority,
                        date: taskData.date,
                        time: taskData.time,
                        duration: parseInt(taskData.duration),
                        completed: false,
                        createdAt: new Date().toISOString()
                    };

                    appData.tasks.push(newTask);
                    DataManager.save('tasks', appData.tasks);

                    showToast('✅ Tâche créée avec succès!', 'success');
                    return true;
                } catch (error) {
                    console.error('Erreur création tâche:', error);
                    showToast('❌ Erreur lors de la création', 'error');
                    return false;
                }
            }

            static updateTask(taskId, taskData) {
                try {
                    const taskIndex = appData.tasks.findIndex(t => t.id === taskId);
                    if (taskIndex === -1) {
                        showToast('❌ Tâche introuvable', 'error');
                        return false;
                    }

                    const errors = this.validateTask(taskData, true);
                    if (errors.length > 0) {
                        showToast(`❌ ${errors.join(', ')}`, 'error');
                        return false;
                    }

                    appData.tasks[taskIndex] = {
                        ...appData.tasks[taskIndex],
                        name: taskData.name.trim(),
                        moduleId: parseInt(taskData.moduleId),
                        priority: taskData.priority,
                        date: taskData.date,
                        time: taskData.time,
                        duration: parseInt(taskData.duration),
                        updatedAt: new Date().toISOString()
                    };

                    DataManager.save('tasks', appData.tasks);
                    showToast('✅ Tâche mise à jour', 'success');
                    return true;
                } catch (error) {
                    console.error('Erreur mise à jour tâche:', error);
                    showToast('❌ Erreur lors de la mise à jour', 'error');
                    return false;
                }
            }

            static toggleTaskStatus(taskId) {
                try {
                    const task = appData.tasks.find(t => t.id === taskId);
                    if (!task) {
                        showToast('❌ Tâche introuvable', 'error');
                        return false;
                    }

                    task.completed = !task.completed;
                    task.completedAt = task.completed ? new Date().toISOString() : null;
                    task.updatedAt = new Date().toISOString();

                    DataManager.save('tasks', appData.tasks);

                    const status = task.completed ? 'terminée' : 'en cours';
                    showToast(`✅ Tâche marquée comme ${status}`, 'success');
                    return true;
                } catch (error) {
                    console.error('Erreur changement statut:', error);
                    showToast('❌ Erreur lors du changement de statut', 'error');
                    return false;
                }
            }

            static deleteTask(taskId) {
                try {
                    const taskIndex = appData.tasks.findIndex(t => t.id === taskId);
                    if (taskIndex === -1) {
                        showToast('❌ Tâche introuvable', 'error');
                        return false;
                    }

                    appData.tasks.splice(taskIndex, 1);
                    DataManager.save('tasks', appData.tasks);
                    showToast('✅ Tâche supprimée', 'success');
                    return true;
                } catch (error) {
                    console.error('Erreur suppression tâche:', error);
                    showToast('❌ Erreur lors de la suppression', 'error');
                    return false;
                }
            }

            static getTaskStats() {
                const total = appData.tasks.length;
                const completed = appData.tasks.filter(t => t.completed).length;
                const pending = total - completed;

                const totalStudyMinutes = appData.tasks
                    .filter(t => t.completed)
                    .reduce((sum, t) => sum + (t.duration || 0), 0);

                const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

                return {
                    total,
                    completed,
                    pending,
                    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                    totalStudyHours,
                    totalStudyMinutes
                };
            }

            static getTasksByFilter(filters = {}) {
                let filteredTasks = [...appData.tasks];

                if (filters.priority) {
                    filteredTasks = filteredTasks.filter(t => t.priority === filters.priority);
                }

                if (filters.completed !== undefined) {
                    filteredTasks = filteredTasks.filter(t => t.completed === filters.completed);
                }

                if (filters.moduleId) {
                    filteredTasks = filteredTasks.filter(t => t.moduleId === parseInt(filters.moduleId));
                }

                // Tri par date et heure
                filteredTasks.sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time}`);
                    const dateB = new Date(`${b.date}T${b.time}`);
                    return dateA - dateB;
                });

                return filteredTasks;
            }
        }

        // ===== GESTIONNAIRE DE NOTES =====
        class GradeManager {
            static validateGrade(gradeData) {
                const errors = [];

                if (!gradeData.moduleId || !MODULES_OFPPT.find(m => m.id === parseInt(gradeData.moduleId))) {
                    errors.push('Module invalide');
                }

                const value = parseFloat(gradeData.value);
                if (isNaN(value) || value < 0 || value > 20) {
                    errors.push('Note invalide (0-20)');
                }

                if (!['controle', 'efm'].includes(gradeData.type)) {
                    errors.push('Type de note invalide');
                }

                return errors;
            }

            static addGrade(gradeData) {
                try {
                    const errors = this.validateGrade(gradeData);
                    if (errors.length > 0) {
                        showToast(`❌ ${errors.join(', ')}`, 'error');
                        return false;
                    }

                    const moduleGrades = appData.grades.filter(g => g.moduleId === parseInt(gradeData.moduleId));
                    const controleCount = moduleGrades.filter(g => g.type === 'controle').length;
                    const efmCount = moduleGrades.filter(g => g.type === 'efm').length;

                    if (gradeData.type === 'controle' && controleCount >= 5) {
                        showToast('⚠️ Maximum 5 contrôles par module', 'warning');
                        return false;
                    }

                    if (gradeData.type === 'efm' && efmCount >= 1) {
                        showToast('⚠️ Un seul EFM autorisé par module', 'warning');
                        return false;
                    }

                    if (gradeData.type === 'efm' && controleCount < 3) {
                        showToast('⚠️ Minimum 3 contrôles requis avant l\'EFM', 'warning');
                        return false;
                    }

                    const newGrade = {
                        id: Date.now() + Math.random(),
                        moduleId: parseInt(gradeData.moduleId),
                        type: gradeData.type,
                        value: parseFloat(gradeData.value),
                        date: new Date().toISOString().split('T')[0],
                        createdAt: new Date().toISOString()
                    };

                    appData.grades.push(newGrade);
                    DataManager.save('grades', appData.grades);

                    showToast('✅ Note ajoutée avec succès!', 'success');
                    return true;
                } catch (error) {
                    console.error('Erreur ajout note:', error);
                    showToast('❌ Erreur lors de l\'ajout', 'error');
                    return false;
                }
            }

            static deleteGrade(gradeId) {
                try {
                    const gradeIndex = appData.grades.findIndex(g => g.id === gradeId);
                    if (gradeIndex === -1) {
                        showToast('❌ Note introuvable', 'error');
                        return false;
                    }

                    appData.grades.splice(gradeIndex, 1);
                    DataManager.save('grades', appData.grades);
                    showToast('✅ Note supprimée', 'success');
                    return true;
                } catch (error) {
                    console.error('Erreur suppression note:', error);
                    showToast('❌ Erreur lors de la suppression', 'error');
                    return false;
                }
            }

            static calculateModuleAverage(moduleId) {
                try {
                    const module = MODULES_OFPPT.find(m => m.id === moduleId);
                    if (!module) return null;

                    const moduleGrades = appData.grades.filter(g => g.moduleId === moduleId && g.value !== null && g.value !== undefined && !isNaN(g.value));
                    if (moduleGrades.length === 0) return null;

                    if (module.efm) {
                        // Calcul spécial EFM: 50% contrôles + 50% EFM
                        const controles = moduleGrades.filter(g => g.type === 'controle');
                        const efm = moduleGrades.find(g => g.type === 'efm');

                        if (controles.length === 0) return null;

                        // Moyenne des contrôles (ignorer les cases vides)
                        const controleAverage = controles.reduce((sum, g) => sum + g.value, 0) / controles.length;

                        if (efm && efm.value !== null && efm.value !== undefined && !isNaN(efm.value)) {
                            // Formule EFM: (Moyenne Contrôles × 50%) + (Note EFM × 50%)
                            return (controleAverage * 0.5) + (efm.value * 0.5);
                        } else {
                            return controleAverage;
                        }
                    } else {
                        // Calcul standard moyenne simple (ignorer les cases vides)
                        const validGrades = moduleGrades.filter(g => g.value !== null && g.value !== undefined && !isNaN(g.value));
                        if (validGrades.length === 0) return null;
                        return validGrades.reduce((sum, grade) => sum + grade.value, 0) / validGrades.length;
                    }
                } catch (error) {
                    console.error('Erreur calcul moyenne module:', error);
                    return null;
                }
            }

            static calculateGeneralAverage() {
                try {
                    const moduleAverages = [];

                    MODULES_OFPPT.forEach(module => {
                        const average = this.calculateModuleAverage(module.id);
                        if (average !== null) {
                            moduleAverages.push({
                                average,
                                coefficient: module.coefficient
                            });
                        }
                    });

                    if (moduleAverages.length === 0) return null;

                    // Calcul moyenne générale pondérée
                    const totalSum = moduleAverages.reduce((sum, m) => sum + (m.average * m.coefficient), 0);
                    const totalCoeff = moduleAverages.reduce((sum, m) => sum + m.coefficient, 0);

                    return totalSum / totalCoeff;
                } catch (error) {
                    console.error('Erreur calcul moyenne générale:', error);
                    return null;
                }
            }
        }

        // ===== GESTIONNAIRE DE PLANNING =====
        class ScheduleManager {
            static generateDailySchedule(date) {
                try {
                    const schedule = [];
                    const settings = appData.settings;
                    const now = new Date();
                    const isToday = date === now.toISOString().split('T')[0];
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();

                    // Générer les créneaux de 30 minutes
                    for (let hour = 0; hour < 24; hour++) {
                        for (let minute = 0; minute < 60; minute += 30) {
                            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                            const currentTime = { hour, minute };

                            // Vérifier s'il y a une tâche programmée à cette heure
                            const task = appData.tasks.find(t =>
                                t.date === date &&
                                t.time === timeString
                            );

                            let slotInfo = this.determineSlotType(currentTime, settings, isToday, currentHour, currentMinute);

                            // Si une tâche est programmée et que c'est du temps libre ou école
                            if (task && (slotInfo.type === 'free' || slotInfo.type === 'school')) {
                                const module = MODULES_OFPPT.find(m => m.id === task.moduleId);
                                const priorityColor = task.priority === 'high' ? '#ef4444' :
                                    task.priority === 'medium' ? '#f59e0b' : '#8b5cf6';

                                schedule.push({
                                    time: timeString,
                                    type: 'task',
                                    title: task.name,
                                    subtitle: `${module ? module.code : 'Module'} - ${Math.floor(task.duration / 60)}h${task.duration % 60 > 0 ? (task.duration % 60).toString().padStart(2, '0') : ''}`,
                                    color: task.completed ? '#10b981' : priorityColor,
                                    task: task,
                                    icon: task.completed ? 'fa-check-circle' : 'fa-tasks',
                                    duration: 30
                                });
                            } else {
                                schedule.push({
                                    time: timeString,
                                    type: slotInfo.type,
                                    title: slotInfo.title,
                                    subtitle: slotInfo.subtitle,
                                    color: slotInfo.color,
                                    icon: slotInfo.icon,
                                    task: null,
                                    duration: 30
                                });
                            }
                        }
                    }

                    return schedule;
                } catch (error) {
                    console.error('Erreur génération planning:', error);
                    showToast('❌ Erreur génération planning', 'error');
                    return [];
                }
            }

            static determineSlotType(currentTime, settings, isToday = false, currentHour = 0, currentMinute = 0) {
                const currentMinutes = currentTime.hour * 60 + currentTime.minute;
                const nowMinutes = currentHour * 60 + currentMinute;

                // Heures de sommeil
                const wakeTime = this.parseTime(settings.wakeUpTime);
                const bedTime = this.parseTime(settings.bedTime);

                if (this.isSleepTime(currentTime, wakeTime, bedTime)) {
                    if (currentTime.hour === wakeTime.hour && currentTime.minute === wakeTime.minute) {
                        return {
                            type: 'wake',
                            title: 'Réveil',
                            subtitle: 'Début de journée',
                            color: '#f59e0b',
                            icon: 'fa-sun'
                        };
                    } else if (currentTime.hour === bedTime.hour && currentTime.minute === bedTime.minute) {
                        return {
                            type: 'bedtime',
                            title: 'Coucher',
                            subtitle: 'Fin de journée',
                            color: '#6366f1',
                            icon: 'fa-moon'
                        };
                    } else {
                        return {
                            type: 'sleep',
                            title: 'Sommeil',
                            subtitle: 'Temps de repos',
                            color: '#6b7280',
                            icon: 'fa-bed'
                        };
                    }
                }

                // Pause déjeuner
                if (settings.hasLunchBreak) {
                    const lunchStart = this.parseTime(settings.lunchStart);
                    const lunchEnd = this.parseTime(settings.lunchEnd);

                    if (this.isTimeBetween(currentTime, lunchStart, lunchEnd)) {
                        return {
                            type: 'lunch',
                            title: 'Pause Déjeuner',
                            subtitle: 'Durée: 60 minutes',
                            color: '#f97316',
                            icon: 'fa-utensils'
                        };
                    }
                }

                // Heures d'école
                if (settings.hasSchool) {
                    const schoolStart = this.parseTime(settings.schoolStartTime);
                    const schoolEnd = this.parseTime(settings.schoolEndTime);

                    if (this.isTimeBetween(currentTime, schoolStart, schoolEnd)) {
                        return {
                            type: 'school',
                            title: 'École',
                            subtitle: 'Cours en présentiel',
                            color: '#3b82f6',
                            icon: 'fa-school'
                        };
                    }
                }

                // Temps libre - vérifier si c'est dans le passé pour aujourd'hui
                if (isToday && currentMinutes < nowMinutes) {
                    return {
                        type: 'past',
                        title: 'Temps écoulé',
                        subtitle: 'Période passée',
                        color: '#4b5563',
                        icon: 'fa-history'
                    };
                }

                // Temps libre par défaut
                return {
                    type: 'free',
                    title: 'Temps libre',
                    subtitle: 'Disponible pour étudier',
                    color: '#10b981',
                    icon: 'fa-clock'
                };
            }

            static isSleepTime(currentTime, wakeTime, bedTime) {
                if (!wakeTime || !bedTime) return false;

                const currentMinutes = currentTime.hour * 60 + currentTime.minute;
                const wakeMinutes = wakeTime.hour * 60 + wakeTime.minute;
                const bedMinutes = bedTime.hour * 60 + bedTime.minute;

                if (bedMinutes > wakeMinutes) {
                    // Normal case: sleep from bedtime to wake time next day
                    return currentMinutes >= bedMinutes || currentMinutes < wakeMinutes;
                } else {
                    // Bedtime is after midnight
                    return currentMinutes >= bedMinutes && currentMinutes < wakeMinutes;
                }
            }

            static parseTime(timeString) {
                if (!timeString) return null;
                const [hour, minute] = timeString.split(':').map(Number);
                return { hour, minute };
            }

            static isTimeBetween(time, start, end) {
                if (!time || !start || !end) return false;

                const timeMinutes = time.hour * 60 + time.minute;
                const startMinutes = start.hour * 60 + start.minute;
                const endMinutes = end.hour * 60 + end.minute;

                return timeMinutes >= startMinutes && timeMinutes < endMinutes;
            }
        }

        // DOM Elements
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const mobileNav = document.getElementById('mobile-nav');
        const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const tabContents = document.querySelectorAll('.tab-content');
        const taskModal = document.getElementById('task-modal');
        const addTaskBtn = document.getElementById('add-task-btn');
        const closeModal = document.getElementById('close-modal');
        const cancelModal = document.getElementById('cancel-modal');
        const taskForm = document.getElementById('task-form');

        // Initialize Application
        document.addEventListener('DOMContentLoaded', function () {
            DataManager.initializeData();
            initializeCharts();
            populateModuleSelects();
            renderTasks();
            renderGrades();
            renderModules();
            updateCurrentDate();
            generateSchedule();
            loadSettings();
            updateDashboardStats();
            setupEventListeners();
        });

        // Event Listeners Setup
        function setupEventListeners() {
            // Mobile menu toggle
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
            mobileOverlay.addEventListener('click', closeMobileMenu);
            if (closeMobileMenuBtn) {
                closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
            }

            // Navigation
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tab = link.dataset.tab;
                    switchTab(tab);
                    closeMobileMenu();
                });
            });

            // Task management
            addTaskBtn.addEventListener('click', () => openModal());
            closeModal.addEventListener('click', () => closeTaskModal());
            cancelModal.addEventListener('click', () => closeTaskModal());
            taskForm.addEventListener('submit', handleTaskSubmit);

            // Filters
            document.getElementById('priority-filter').addEventListener('change', renderTasks);
            document.getElementById('status-filter').addEventListener('change', renderTasks);
            document.getElementById('module-filter').addEventListener('change', renderTasks);

            // Planning navigation
            document.getElementById('prev-day').addEventListener('click', () => changeDate(-1));
            document.getElementById('next-day').addEventListener('click', () => changeDate(1));

            // Settings
            document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
            document.getElementById('has-lunch-break').addEventListener('change', toggleLunchBreakSettings);
            document.getElementById('has-school').addEventListener('change', toggleSchoolSettings);

            // Export/Import functionality
            document.getElementById('export-btn').addEventListener('click', () => DataManager.exportAllData());
            document.getElementById('export-data-btn').addEventListener('click', () => DataManager.exportAllData());
            document.getElementById('import-data-btn').addEventListener('click', () => {
                document.getElementById('import-file').click();
            });
            document.getElementById('import-file').addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    DataManager.importAllData(e.target.files[0]);
                }
            });
            document.getElementById('reset-data-btn').addEventListener('click', () => DataManager.resetAllData());
        }

        // Mobile Menu Functions
        function toggleMobileMenu() {
            if (mobileNav) {
                mobileNav.classList.toggle('open');
            }
            if (mobileOverlay) {
                mobileOverlay.classList.toggle('hidden');
            }
        }

        function closeMobileMenu() {
            if (mobileNav) {
                mobileNav.classList.remove('open');
            }
            if (mobileOverlay) {
                mobileOverlay.classList.add('hidden');
            }
        }

        // Tab Navigation
        function switchTab(tabName) {
            // Update all navigation links (both desktop and mobile)
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.tab === tabName) {
                    link.classList.add('active');
                }
            });

            // Update tab content
            tabContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `${tabName}-tab`) {
                    content.classList.remove('hidden');
                    content.classList.add('fade-in');
                }
            });

            currentTab = tabName;

            // Refresh data when switching tabs
            if (tabName === 'dashboard') {
                updateDashboardStats();
            } else if (tabName === 'notes') {
                renderGrades();
            } else if (tabName === 'planning') {
                generateSchedule();
            }
        }

        // Populate Module Selects
        function populateModuleSelects() {
            const selects = [
                document.getElementById('task-module'),
                document.getElementById('module-filter')
            ];

            selects.forEach(select => {
                if (select) {
                    select.innerHTML = '';
                    if (select.id === 'module-filter') {
                        select.innerHTML = '<option value="">Tous les modules</option>';
                    }

                    MODULES_OFPPT.forEach(module => {
                        const option = document.createElement('option');
                        option.value = module.id;
                        option.textContent = `${module.code} - ${module.title}`;
                        select.appendChild(option);
                    });
                }
            });
        }

        // Charts Initialization
        function initializeCharts() {
            // Tasks Chart
            const tasksCtx = document.getElementById('tasksChart').getContext('2d');
            window.tasksChart = new Chart(tasksCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Terminées', 'En cours', 'En retard'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#10b981', '#6b7280', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#9ca3af',
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });

            // Performance Chart
            const performanceCtx = document.getElementById('performanceChart').getContext('2d');
            window.performanceChart = new Chart(performanceCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Moyennes',
                        data: [],
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 20,
                            grid: { color: '#374151' },
                            ticks: { color: '#9ca3af' }
                        },
                        x: {
                            grid: { color: '#374151' },
                            ticks: {
                                color: '#9ca3af',
                                maxRotation: 45
                            }
                        }
                    }
                }
            });

            // Schedule Chart
            const scheduleCtx = document.getElementById('scheduleChart').getContext('2d');
            window.scheduleChart = new Chart(scheduleCtx, {
                type: 'doughnut',
                data: {
                    labels: ['École', 'Étude', 'Libre', 'Repos'],
                    datasets: [{
                        data: [8, 4, 8, 4],
                        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#9ca3af',
                                padding: 15,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });

            // Sleep Analysis Chart
            const sleepCtx = document.getElementById('sleepChart').getContext('2d');
            window.sleepChart = new Chart(sleepCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Heures de sommeil',
                        data: [],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Recommandé (8h)',
                        data: [],
                        borderColor: '#10b981',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#9ca3af',
                                padding: 15,
                                usePointStyle: true
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 12,
                            grid: { color: '#374151' },
                            ticks: { color: '#9ca3af' }
                        },
                        x: {
                            grid: { color: '#374151' },
                            ticks: { color: '#9ca3af' }
                        }
                    }
                }
            });
        }

        // Update Dashboard Stats
        function updateDashboardStats() {
            try {
                const taskStats = TaskManager.getTaskStats();
                const generalAverage = GradeManager.calculateGeneralAverage();

                document.getElementById('completed-tasks-stat').textContent = taskStats.completed;
                document.getElementById('study-hours-stat').textContent = `${taskStats.totalStudyHours}h`;
                document.getElementById('general-average-stat').textContent =
                    generalAverage ? `${generalAverage.toFixed(1)}/20` : '--/20';
                document.getElementById('active-modules-stat').textContent = MODULES_OFPPT.length;

                // Update tasks chart with overdue tasks
                if (window.tasksChart) {
                    const now = new Date();
                    const overdueTasks = appData.tasks.filter(t => {
                        const taskDate = new Date(`${t.date}T${t.time}`);
                        return taskDate < now && !t.completed;
                    }).length;

                    window.tasksChart.data.datasets[0].data = [
                        taskStats.completed,
                        taskStats.pending - overdueTasks,
                        overdueTasks
                    ];
                    window.tasksChart.update('none');
                }

                if (window.performanceChart) {
                    const moduleAverages = [];
                    const moduleLabels = [];

                    MODULES_OFPPT.forEach(module => {
                        const average = GradeManager.calculateModuleAverage(module.id);
                        if (average !== null) {
                            moduleLabels.push(module.code);
                            moduleAverages.push(average);
                        }
                    });

                    window.performanceChart.data.labels = moduleLabels;
                    window.performanceChart.data.datasets[0].data = moduleAverages;
                    window.performanceChart.update('none');
                }

                // Update sleep chart
                updateSleepChart();

                // Update recent activity
                updateRecentActivity();
            } catch (error) {
                console.error('Erreur mise à jour stats:', error);
                showToast('❌ Erreur mise à jour statistiques', 'error');
            }
        }

        // Update Recent Activity
        function updateRecentActivity() {
            const recentActivityEl = document.getElementById('recent-activity');
            if (!recentActivityEl) return;

            // Combiner toutes les activités avec timestamps
            const allActivities = [];

            // Tâches terminées récemment
            appData.tasks
                .filter(t => t.completed && t.completedAt)
                .forEach(task => {
                    const module = MODULES_OFPPT.find(m => m.id === task.moduleId);
                    allActivities.push({
                        type: 'task_completed',
                        timestamp: new Date(task.completedAt),
                        html: `
                            <div class="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                    <i class="fas fa-check text-white"></i>
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-white">${task.name}</p>
                                    <p class="text-xs text-gray-400">${module?.code || 'Module'} - Tâche terminée</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs text-gray-500">${formatDate(task.completedAt.split('T')[0])}</span>
                                    <p class="text-xs text-gray-600">${new Date(task.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        `
                    });
                });

            // Nouvelles tâches créées
            appData.tasks
                .filter(t => t.createdAt)
                .forEach(task => {
                    const module = MODULES_OFPPT.find(m => m.id === task.moduleId);
                    allActivities.push({
                        type: 'task_created',
                        timestamp: new Date(task.createdAt),
                        html: `
                            <div class="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                    <i class="fas fa-plus text-white"></i>
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-white">${task.name}</p>
                                    <p class="text-xs text-gray-400">${module?.code || 'Module'} - Nouvelle tâche</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs text-gray-500">${formatDate(task.createdAt.split('T')[0])}</span>
                                    <p class="text-xs text-gray-600">${new Date(task.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        `
                    });
                });

            // Notes ajoutées
            appData.grades
                .filter(g => g.createdAt)
                .forEach(grade => {
                    const module = MODULES_OFPPT.find(m => m.id === grade.moduleId);
                    const gradeColor = grade.value >= 16 ? 'text-green-400' : grade.value >= 12 ? 'text-yellow-400' : 'text-red-400';
                    allActivities.push({
                        type: 'grade_added',
                        timestamp: new Date(grade.createdAt),
                        html: `
                            <div class="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                    <i class="fas fa-star text-white"></i>
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-white">Note ${grade.type.toUpperCase()}: <span class="${gradeColor}">${grade.value}/20</span></p>
                                    <p class="text-xs text-gray-400">${module?.code || 'Module'} - Nouvelle note</p>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs text-gray-500">${formatDate(grade.createdAt.split('T')[0])}</span>
                                    <p class="text-xs text-gray-600">${new Date(grade.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        `
                    });
                });

            // Trier par timestamp décroissant et prendre les 8 plus récents
            allActivities.sort((a, b) => b.timestamp - a.timestamp);
            const recentActivities = allActivities.slice(0, 8);

            if (recentActivities.length === 0) {
                recentActivityEl.innerHTML = `
                    <div class="text-center text-gray-400 py-8">
                        <i class="fas fa-history text-4xl mb-4 opacity-50"></i>
                        <p class="text-lg font-medium">Aucune activité récente</p>
                        <p class="text-sm">Créez des tâches ou ajoutez des notes pour voir l'activité ici</p>
                    </div>
                `;
                return;
            }

            recentActivityEl.innerHTML = recentActivities.map(activity => activity.html).join('');
        }

        // Task Management
        function renderTasks() {
            try {
                const filters = {
                    priority: document.getElementById('priority-filter')?.value,
                    completed: document.getElementById('status-filter')?.value === '' ? undefined :
                        document.getElementById('status-filter')?.value === 'true',
                    moduleId: document.getElementById('module-filter')?.value
                };

                const filteredTasks = TaskManager.getTasksByFilter(filters);
                const tasksList = document.getElementById('tasks-list');

                if (!tasksList) return;

                if (filteredTasks.length === 0) {
                    tasksList.innerHTML = '<div class="text-center text-gray-400 py-8"><i class="fas fa-tasks text-4xl mb-4"></i><p>Aucune tâche trouvée</p><p class="text-sm">Créez votre première tâche pour commencer!</p></div>';
                    return;
                }

                const tasksHTML = filteredTasks.map(task => {
                    const module = MODULES_OFPPT.find(m => m.id === task.moduleId);
                    const priorityInfo = getPriorityInfo(task.priority);
                    const isOverdue = new Date(`${task.date}T${task.time}`) < new Date() && !task.completed;

                    return `
                        <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 priority-${task.priority} hover-scale ${isOverdue ? 'border-red-500' : ''}" data-task-id="${task.id}">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="font-semibold ${isOverdue ? 'text-red-400' : ''}">${task.name}</h3>
                                <div class="flex items-center space-x-2">
                                    ${isOverdue ? '<span class="px-2 py-1 rounded text-xs bg-red-600 text-white">En retard</span>' : ''}
                                    <span class="px-2 py-1 rounded text-xs ${priorityInfo.color}">${priorityInfo.text}</span>
                                    <button onclick="toggleTaskStatus(${task.id})" class="text-sm ${task.completed ? 'text-green-400' : 'text-gray-400'} hover:text-white transition-colors" title="${task.completed ? 'Marquer comme en cours' : 'Marquer comme terminé'}">
                                        <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                                    </button>
                                    <button onclick="editTask(${task.id})" class="text-blue-400 hover:text-blue-300 transition-colors" title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteTaskConfirm(${task.id})" class="text-red-400 hover:text-red-300 transition-colors" title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="text-gray-400 text-sm mb-2">
                                <i class="fas fa-book mr-1"></i>
                                ${module ? `${module.code} - ${module.title}` : 'Module inconnu'}
                            </p>
                            <div class="flex justify-between items-center text-xs text-gray-500">
                                <span><i class="fas fa-calendar mr-1"></i>${formatDate(task.date)}</span>
                                <span><i class="fas fa-clock mr-1"></i>${task.time} (${Math.floor(task.duration / 60)}h${task.duration % 60 > 0 ? (task.duration % 60).toString().padStart(2, '0') : ''})</span>
                            </div>
                            ${task.completed && task.completedAt ? `
                                <div class="mt-2 text-xs text-green-400">
                                    <i class="fas fa-check mr-1"></i>Terminé le ${formatDate(task.completedAt.split('T')[0])}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');

                tasksList.innerHTML = tasksHTML;
                updateDashboardStats();
            } catch (error) {
                console.error('Erreur rendu tâches:', error);
                showToast('❌ Erreur affichage tâches', 'error');
            }
        }

        function getPriorityInfo(priority) {
            const priorities = {
                high: { color: 'bg-red-600 text-white', text: 'Haute' },
                medium: { color: 'bg-yellow-600 text-white', text: 'Moyenne' },
                low: { color: 'bg-green-600 text-white', text: 'Basse' }
            };
            return priorities[priority] || priorities.medium;
        }

        function editTask(taskId) {
            try {
                const task = appData.tasks.find(t => t.id === taskId);
                if (!task) {
                    showToast('❌ Tâche introuvable', 'error');
                    return;
                }

                document.getElementById('task-name').value = task.name;
                document.getElementById('task-module').value = task.moduleId;
                document.getElementById('task-priority').value = task.priority;
                document.getElementById('task-date').value = task.date;
                document.getElementById('task-time').value = task.time;
                document.getElementById('task-duration').value = task.duration;

                document.querySelector('#task-modal h3').textContent = 'Modifier la Tâche';
                document.querySelector('#task-form button[type="submit"]').textContent = 'Modifier';
                document.getElementById('task-form').dataset.editId = taskId;

                openModal();
            } catch (error) {
                console.error('Erreur modification tâche:', error);
                showToast('❌ Erreur lors de la modification', 'error');
            }
        }

        function deleteTaskConfirm(taskId) {
            try {
                if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                    if (TaskManager.deleteTask(taskId)) {
                        renderTasks();
                        renderModules(); // Mettre à jour les modules
                        generateSchedule();
                        updateDashboardStats();
                        updateRecentActivity();
                    }
                }
            } catch (error) {
                console.error('Erreur suppression tâche:', error);
                showToast('❌ Erreur lors de la suppression', 'error');
            }
        }

        function openModal() {
            taskModal.classList.remove('hidden');

            if (!document.getElementById('task-form').dataset.editId) {
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('task-date').value = today;
                document.getElementById('task-date').readOnly = true;
                document.getElementById('task-date').style.backgroundColor = '#374151';
                document.getElementById('task-date').style.cursor = 'not-allowed';
                document.querySelector('#task-modal h3').textContent = 'Nouvelle Tâche';
                document.querySelector('#task-form button[type="submit"]').textContent = 'Créer';
            } else {
                // En mode édition, permettre la modification de la date
                document.getElementById('task-date').readOnly = false;
                document.getElementById('task-date').style.backgroundColor = '#4b5563';
                document.getElementById('task-date').style.cursor = 'text';
            }
        }

        function closeTaskModal() {
            taskModal.classList.add('hidden');
            taskForm.reset();
            delete document.getElementById('task-form').dataset.editId;
            document.querySelector('#task-modal h3').textContent = 'Nouvelle Tâche';
            document.querySelector('#task-form button[type="submit"]').textContent = 'Créer';
        }

        function handleTaskSubmit(e) {
            e.preventDefault();

            const taskData = {
                name: document.getElementById('task-name').value,
                moduleId: document.getElementById('task-module').value,
                priority: document.getElementById('task-priority').value,
                date: document.getElementById('task-date').value,
                time: document.getElementById('task-time').value,
                duration: document.getElementById('task-duration').value
            };

            const editId = document.getElementById('task-form').dataset.editId;
            let success = false;

            if (editId) {
                success = TaskManager.updateTask(parseFloat(editId), taskData);
            } else {
                success = TaskManager.createTask(taskData);
            }

            if (success) {
                renderTasks();
                renderModules(); // Mettre à jour les modules
                generateSchedule();
                updateDashboardStats();
                updateRecentActivity();
                closeTaskModal();
            }
        }

        function toggleTaskStatus(taskId) {
            if (TaskManager.toggleTaskStatus(taskId)) {
                renderTasks();
                renderModules(); // Mettre à jour les modules
                generateSchedule();
                updateDashboardStats();
                updateRecentActivity();
            }
        }



        // Notes Management
        function renderGrades() {
            const generalAverageDisplay = document.getElementById('general-average-display');
            const notesTableBody = document.getElementById('notes-table-body');

            if (!generalAverageDisplay || !notesTableBody) return;

            // Update general average
            const generalAverage = GradeManager.calculateGeneralAverage();
            generalAverageDisplay.textContent = generalAverage ? `${generalAverage.toFixed(1)}/20` : '--/20';

            // Render notes table
            notesTableBody.innerHTML = '';

            MODULES_OFPPT.forEach(module => {
                const moduleGrades = appData.grades.filter(g => g.moduleId === module.id);
                const controles = moduleGrades.filter(g => g.type === 'controle').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                const efm = moduleGrades.find(g => g.type === 'efm');
                const average = GradeManager.calculateModuleAverage(module.id);

                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-700 transition-colors';

                // Create controle cells (5 maximum)
                let controlesCells = '';
                for (let i = 0; i < 5; i++) {
                    const controle = controles[i];
                    const value = controle ? controle.value : '';
                    const gradeId = controle ? controle.id : '';

                    controlesCells += `
                        <td class="px-4 py-3 text-center">
                            <input type="number" 
                                   min="0" max="20" step="0.1" 
                                   value="${value}" 
                                   placeholder="--"
                                   class="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center text-sm grade-input"
                                   data-module-id="${module.id}"
                                   data-type="controle"
                                   data-index="${i}"
                                   data-grade-id="${gradeId}"
                                   onchange="handleGradeChange(this)"
                                   onblur="handleGradeChange(this)">
                        </td>
                    `;
                }

                // EFM cell
                let efmCell = '';
                if (module.efm) {
                    const efmValue = efm ? efm.value : '';
                    const efmId = efm ? efm.id : '';

                    efmCell = `
                        <td class="px-4 py-3 text-center">
                            <input type="number" 
                                   min="0" max="20" step="0.1" 
                                   value="${efmValue}" 
                                   placeholder="--"
                                   class="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center text-sm grade-input"
                                   data-module-id="${module.id}"
                                   data-type="efm"
                                   data-grade-id="${efmId}"
                                   onchange="handleGradeChange(this)"
                                   onblur="handleGradeChange(this)">
                        </td>
                    `;
                } else {
                    efmCell = '<td class="px-4 py-3 text-center text-gray-500">--</td>';
                }

                row.innerHTML = `
                    <td class="px-4 py-3 font-medium">${module.code}</td>
                    <td class="px-4 py-3">${module.title}</td>
                    ${controlesCells}
                    ${efmCell}
                    <td class="px-4 py-3 text-center">
                        ${average !== null ? `
                            <span class="font-bold ${average >= 16 ? 'text-green-400' : average >= 12 ? 'text-yellow-400' : 'text-red-400'}">
                                ${average.toFixed(1)}/20
                            </span>
                        ` : '<span class="text-gray-500">--/20</span>'}
                    </td>
                    <td class="px-4 py-3 text-center">
                        <span class="px-2 py-1 bg-gray-600 rounded text-xs">${module.coefficient}</span>
                    </td>
                `;

                notesTableBody.appendChild(row);
            });

            updateDashboardStats();
        }

        function handleGradeChange(input) {
            try {
                const moduleId = parseInt(input.dataset.moduleId);
                const type = input.dataset.type;
                const index = parseInt(input.dataset.index);
                let gradeId = input.dataset.gradeId;
                const value = input.value.trim();

                // Si l'input est vide, supprimer la note existante
                if (value === '') {
                    if (gradeId) {
                        const success = GradeManager.deleteGrade(parseInt(gradeId));
                        if (success) {
                            input.dataset.gradeId = '';
                            setTimeout(() => {
                                renderGrades();
                                renderModules(); // Mettre à jour les modules
                                updateDashboardStats();
                                updateRecentActivity();
                            }, 100);
                        }
                    }
                    return;
                }

                const numValue = parseFloat(value);

                // Validation de la note
                if (isNaN(numValue) || numValue < 0 || numValue > 20) {
                    showToast('❌ Note invalide (0-20)', 'error');
                    const existingGrade = gradeId ? appData.grades.find(g => g.id === parseInt(gradeId)) : null;
                    input.value = existingGrade ? existingGrade.value : '';
                    return;
                }

                // Si c'est une modification d'une note existante
                if (gradeId && gradeId !== '') {
                    const gradeIndex = appData.grades.findIndex(g => g.id === parseInt(gradeId));
                    if (gradeIndex !== -1) {
                        appData.grades[gradeIndex].value = numValue;
                        appData.grades[gradeIndex].updatedAt = new Date().toISOString();
                        DataManager.save('grades', appData.grades);
                        setTimeout(() => {
                            renderGrades();
                            renderModules(); // Mettre à jour les modules
                            updateDashboardStats();
                            updateRecentActivity();
                        }, 100);
                        showToast('✅ Note mise à jour', 'success');
                    }
                } else {
                    // Nouvelle note
                    const newGrade = {
                        id: Date.now() + Math.random(),
                        moduleId: moduleId,
                        type: type,
                        value: numValue,
                        index: type === 'controle' ? index : undefined,
                        date: new Date().toISOString().split('T')[0],
                        createdAt: new Date().toISOString()
                    };

                    // Vérifications spéciales pour les contrôles
                    if (type === 'controle') {
                        const moduleGrades = appData.grades.filter(g => g.moduleId === moduleId && g.type === 'controle');
                        if (moduleGrades.length >= 5) {
                            showToast('⚠️ Maximum 5 contrôles par module', 'warning');
                            input.value = '';
                            return;
                        }
                    }

                    // Vérifications pour l'EFM
                    if (type === 'efm') {
                        const moduleGrades = appData.grades.filter(g => g.moduleId === moduleId);
                        const controleCount = moduleGrades.filter(g => g.type === 'controle').length;
                        const efmCount = moduleGrades.filter(g => g.type === 'efm').length;

                        if (efmCount >= 1) {
                            showToast('⚠️ Un seul EFM autorisé par module', 'warning');
                            input.value = '';
                            return;
                        }

                        if (controleCount < 3) {
                            showToast('⚠️ Minimum 3 contrôles requis avant l\'EFM', 'warning');
                            input.value = '';
                            return;
                        }
                    }

                    appData.grades.push(newGrade);
                    DataManager.save('grades', appData.grades);
                    input.dataset.gradeId = newGrade.id;
                    setTimeout(() => {
                        renderGrades();
                        renderModules(); // Mettre à jour les modules
                        updateDashboardStats();
                        updateRecentActivity();
                    }, 100);
                    showToast('✅ Note ajoutée', 'success');
                }
            } catch (error) {
                console.error('Erreur modification note:', error);
                showToast('❌ Erreur lors de la modification', 'error');
                input.value = '';
            }
        }



        // Modules Management
        function renderModules() {
            const modulesList = document.getElementById('modules-list');
            if (!modulesList) return;

            // Calculer les données pour chaque module
            const modulesData = MODULES_OFPPT.map(module => {
                const average = GradeManager.calculateModuleAverage(module.id);
                const moduleGrades = appData.grades.filter(g => g.moduleId === module.id);
                const moduleTasks = appData.tasks.filter(t => t.moduleId === module.id);
                const completedTasks = moduleTasks.filter(t => t.completed).length;
                const totalStudyHours = moduleTasks
                    .filter(t => t.completed)
                    .reduce((sum, t) => sum + (t.duration || 0), 0) / 60;
                const remainingHours = Math.max(0, module.hours - totalStudyHours);

                return {
                    ...module,
                    average,
                    moduleGrades,
                    moduleTasks,
                    completedTasks,
                    totalStudyHours: Math.round(totalStudyHours * 10) / 10,
                    remainingHours: Math.round(remainingHours * 10) / 10,
                    progress: module.hours > 0 ? Math.min(100, (totalStudyHours / module.hours) * 100) : 0
                };
            });

            // Trier les modules par moyenne (décroissant), puis par EFM, puis par coefficient
            modulesData.sort((a, b) => {
                // Priorité 1: Modules avec moyenne vs sans moyenne
                if (a.average !== null && b.average === null) return -1;
                if (a.average === null && b.average !== null) return 1;

                // Priorité 2: Moyenne décroissante
                if (a.average !== null && b.average !== null) {
                    if (a.average !== b.average) return b.average - a.average;
                }

                // Priorité 3: EFM en premier
                if (a.efm && !b.efm) return -1;
                if (!a.efm && b.efm) return 1;

                // Priorité 4: Coefficient décroissant
                return b.coefficient - a.coefficient;
            });

            // Générer le classement
            modulesList.innerHTML = `
                <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-trophy mr-3 text-yellow-400"></i>
                            Classement des Modules
                        </h3>
                        <p class="text-blue-100 text-sm mt-1">Classés par moyenne, type EFM et coefficient</p>
                    </div>
                    <div class="divide-y divide-gray-700">
                        ${modulesData.map((module, index) => {
                const rankColor = index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-400' : 'text-gray-500';
                const rankIcon = index === 0 ? 'fa-crown' :
                    index === 1 ? 'fa-medal' :
                        index === 2 ? 'fa-award' : 'fa-hashtag';

                return `
                                <div class="p-6 hover:bg-gray-700 transition-colors">
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="flex items-center space-x-4">
                                            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700">
                                                <i class="fas ${rankIcon} ${rankColor} text-xl"></i>
                                            </div>
                                            <div>
                                                <h4 class="text-lg font-bold text-white">${module.code}</h4>
                                                <p class="text-gray-400 text-sm">${module.title}</p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-2xl font-bold ${module.average !== null ?
                        (module.average >= 16 ? 'text-green-400' :
                            module.average >= 12 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-500'}">
                                                ${module.average !== null ? `${module.average.toFixed(1)}/20` : '--/20'}
                                            </div>
                                            <div class="text-xs text-gray-500">Rang #${index + 1}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div class="text-center p-3 bg-gray-700 rounded-lg">
                                            <div class="text-lg font-bold text-blue-400">${module.coefficient}</div>
                                            <div class="text-xs text-gray-400">Coefficient</div>
                                        </div>
                                        <div class="text-center p-3 bg-gray-700 rounded-lg">
                                            <div class="text-lg font-bold text-purple-400">${module.moduleGrades.length}</div>
                                            <div class="text-xs text-gray-400">Notes</div>
                                        </div>
                                        <div class="text-center p-3 bg-gray-700 rounded-lg">
                                            <div class="text-lg font-bold text-green-400">${module.completedTasks}/${module.moduleTasks.length}</div>
                                            <div class="text-xs text-gray-400">Tâches</div>
                                        </div>
                                        <div class="text-center p-3 bg-gray-700 rounded-lg">
                                            <div class="text-lg font-bold text-orange-400">${module.totalStudyHours}h</div>
                                            <div class="text-xs text-gray-400">Étudié</div>
                                        </div>
                                    </div>
                                    
                                    <div class="space-y-3">
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="text-gray-400">Progression du volume horaire</span>
                                            <span class="text-white">${module.totalStudyHours}h / ${module.hours}h</span>
                                        </div>
                                        <div class="w-full bg-gray-700 rounded-full h-2">
                                            <div class="h-2 rounded-full transition-all duration-300 ${module.progress >= 100 ? 'bg-green-500' :
                        module.progress >= 75 ? 'bg-blue-500' :
                            module.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }" style="width: ${Math.min(100, module.progress)}%"></div>
                                        </div>
                                        <div class="flex justify-between text-xs text-gray-500">
                                            <span>${module.progress.toFixed(1)}% complété</span>
                                            <span>${module.remainingHours}h restantes</span>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
                                        <div class="flex space-x-2">
                                            ${module.efm ? '<span class="px-2 py-1 rounded text-xs bg-purple-600 text-white">EFM Régional</span>' : ''}
                                            <span class="px-2 py-1 rounded text-xs ${module.average !== null && module.average >= 10 ? 'bg-green-600' : 'bg-gray-600'} text-white">
                                                ${module.average !== null && module.average >= 10 ? 'Validé' : 'En cours'}
                                            </span>
                                        </div>
                                        <div class="text-xs text-gray-500">
                                            Volume: ${module.hours}h
                                        </div>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }

        // Planning Functions
        function updateCurrentDate() {
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            document.getElementById('current-date').textContent =
                currentDate.toLocaleDateString('fr-FR', options);
        }

        function changeDate(days) {
            currentDate.setDate(currentDate.getDate() + days);
            updateCurrentDate();
            generateSchedule();
        }

        function generateSchedule() {
            const scheduleTimeline = document.getElementById('schedule-timeline');
            const planningAnalysis = document.getElementById('planning-analysis');

            if (!scheduleTimeline) return;

            const dateString = currentDate.toISOString().split('T')[0];
            const schedule = ScheduleManager.generateDailySchedule(dateString);

            // Generate schedule timeline
            scheduleTimeline.innerHTML = '';

            schedule.forEach(slot => {
                const slotElement = document.createElement('div');
                slotElement.className = 'flex items-center p-4 rounded-lg transition-all hover:scale-[1.02] cursor-pointer';
                slotElement.style.background = `linear-gradient(90deg, ${slot.color}20 0%, ${slot.color}10 100%)`;
                slotElement.style.borderLeft = `4px solid ${slot.color}`;

                const isTaskSlot = slot.type === 'task';
                const priorityBadge = isTaskSlot && slot.task ?
                    `<span class="px-2 py-1 rounded-full text-xs font-medium" style="background-color: ${slot.color}20; color: ${slot.color}">
                        ${slot.task.priority === 'high' ? 'Haute' : slot.task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>` : '';

                slotElement.innerHTML = `
                    <div class="flex items-center space-x-4 flex-1">
                        <div class="flex flex-col items-center">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${slot.color}">
                                <i class="fas ${slot.icon || 'fa-clock'}"></i>
                            </div>
                            <span class="text-xs font-mono mt-1 text-gray-400">${slot.time}</span>
                        </div>
                        
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-1">
                                <h4 class="font-semibold text-lg" style="color: ${slot.color}">${slot.title}</h4>
                                <div class="flex items-center space-x-2">
                                    ${priorityBadge}
                                    ${slot.task && slot.task.completed ? '<i class="fas fa-check-circle text-green-400 text-xl"></i>' : ''}
                                    ${isTaskSlot && !slot.task.completed ? '<i class="fas fa-play-circle text-blue-400 text-xl"></i>' : ''}
                                </div>
                            </div>
                            ${slot.subtitle ? `<p class="text-gray-400 text-sm">${slot.subtitle}</p>` : ''}
                            ${isTaskSlot && slot.task ? `
                                <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                    <span><i class="fas fa-calendar mr-1"></i>${formatDate(slot.task.date)}</span>
                                    <span><i class="fas fa-clock mr-1"></i>Durée: ${Math.floor(slot.task.duration / 60)}h${slot.task.duration % 60 > 0 ? (slot.task.duration % 60).toString().padStart(2, '0') : ''}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;

                // Add click handler for task slots
                if (isTaskSlot && slot.task) {
                    slotElement.addEventListener('click', () => {
                        toggleTaskStatus(slot.task.id);
                        setTimeout(() => generateSchedule(), 100);
                    });
                    slotElement.style.cursor = 'pointer';
                }

                scheduleTimeline.appendChild(slotElement);
            });

            // Generate planning analysis
            if (planningAnalysis) {
                const sleepSlots = schedule.filter(s => s.type === 'sleep').length;
                const freeSlots = schedule.filter(s => s.type === 'free').length;
                const studySlots = schedule.filter(s => s.type === 'task').length;
                const schoolSlots = schedule.filter(s => s.type === 'school').length;
                const lunchSlots = schedule.filter(s => s.type === 'lunch').length;

                const sleepHours = (sleepSlots * 0.5).toFixed(1);
                const freeHours = (freeSlots * 0.5).toFixed(1);
                const studyHours = (studySlots * 0.5).toFixed(1);
                const schoolHours = (schoolSlots * 0.5).toFixed(1);

                planningAnalysis.innerHTML = `
                    <div class="text-center p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                        <div class="text-2xl font-bold ${getSleepColorClass(parseFloat(sleepHours))}">${sleepHours}h</div>
                        <div class="text-sm text-gray-200">💤 Sommeil ${getSleepStatus(parseFloat(sleepHours))}</div>
                    </div>
                    <div class="text-center p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                        <div class="text-2xl font-bold text-white">${freeHours}h</div>
                        <div class="text-sm text-gray-200">🕐 Temps libre</div>
                    </div>
                    <div class="text-center p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                        <div class="text-2xl font-bold text-white">${schoolHours}h</div>
                        <div class="text-sm text-gray-200">🏫 École</div>
                    </div>
                    <div class="text-center p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                        <div class="text-2xl font-bold text-white">${studyHours}h</div>
                        <div class="text-sm text-gray-200">📚 Étude planifiée</div>
                    </div>
                `;
            }
        }

        // Settings Management
        function loadSettings() {
            const settings = appData.settings;

            document.getElementById('wake-time').value = settings.wakeUpTime;
            document.getElementById('bed-time').value = settings.bedTime;
            document.getElementById('study-goal').value = settings.studyGoal;
            document.getElementById('has-lunch-break').checked = settings.hasLunchBreak;
            document.getElementById('lunch-start').value = settings.lunchStart;
            document.getElementById('lunch-end').value = settings.lunchEnd;
            document.getElementById('has-school').checked = settings.hasSchool;
            document.getElementById('school-start').value = settings.schoolStartTime;
            document.getElementById('school-end').value = settings.schoolEndTime;

            toggleLunchBreakSettings();
            toggleSchoolSettings();
        }

        function saveSettings() {
            try {
                const newSettings = {
                    wakeUpTime: document.getElementById('wake-time').value || '07:00',
                    bedTime: document.getElementById('bed-time').value || '23:00',
                    studyGoal: parseInt(document.getElementById('study-goal').value) || 8,
                    hasLunchBreak: document.getElementById('has-lunch-break').checked,
                    lunchStart: document.getElementById('lunch-start').value || '12:00',
                    lunchEnd: document.getElementById('lunch-end').value || '13:00',
                    hasSchool: document.getElementById('has-school').checked,
                    schoolStartTime: document.getElementById('school-start').value || '08:00',
                    schoolEndTime: document.getElementById('school-end').value || '17:00'
                };

                // Validation des heures
                if (!newSettings.wakeUpTime || !newSettings.bedTime) {
                    showToast('❌ Veuillez remplir les heures de réveil et coucher', 'error');
                    return;
                }

                if (newSettings.hasLunchBreak && (!newSettings.lunchStart || !newSettings.lunchEnd)) {
                    showToast('❌ Veuillez remplir les heures de pause déjeuner', 'error');
                    return;
                }

                if (newSettings.hasSchool && (!newSettings.schoolStartTime || !newSettings.schoolEndTime)) {
                    showToast('❌ Veuillez remplir les heures d\'école', 'error');
                    return;
                }

                // Sauvegarder les nouveaux paramètres
                appData.settings = { ...appData.settings, ...newSettings };
                DataManager.save('settings', appData.settings);

                // Régénérer le planning avec les nouveaux paramètres
                setTimeout(() => {
                    generateSchedule();
                    updateDashboardStats();
                }, 100);

                showToast('✅ Paramètres sauvegardés et planning mis à jour!', 'success');
            } catch (error) {
                console.error('Erreur sauvegarde paramètres:', error);
                showToast('❌ Erreur sauvegarde paramètres', 'error');
            }
        }

        function toggleLunchBreakSettings() {
            const hasLunchBreak = document.getElementById('has-lunch-break').checked;
            const lunchBreakTime = document.getElementById('lunch-break-time');

            if (hasLunchBreak) {
                lunchBreakTime.classList.remove('hidden');
            } else {
                lunchBreakTime.classList.add('hidden');
            }
        }

        function toggleSchoolSettings() {
            const hasSchool = document.getElementById('has-school').checked;
            const schoolTimes = document.getElementById('school-times');

            if (hasSchool) {
                schoolTimes.classList.remove('hidden');
            } else {
                schoolTimes.classList.add('hidden');
            }
        }

        // Utility Functions
        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        }

        // Sleep Analysis Functions
        function getSleepColorClass(hours) {
            if (hours < 6) return 'text-red-400';
            if (hours < 7) return 'text-orange-400';
            if (hours >= 7 && hours <= 9) return 'text-green-400';
            if (hours > 9) return 'text-blue-400';
            return 'text-white';
        }

        function getSleepStatus(hours) {
            if (hours < 6) return '(Insuffisant)';
            if (hours < 7) return '(Faible)';
            if (hours >= 7 && hours <= 9) return '(Optimal)';
            if (hours > 9) return '(Excessif)';
            return '';
        }

        function calculateSleepHours(wakeTime, bedTime) {
            const wake = ScheduleManager.parseTime(wakeTime);
            const bed = ScheduleManager.parseTime(bedTime);

            if (!wake || !bed) return 8; // Default

            const wakeMinutes = wake.hour * 60 + wake.minute;
            const bedMinutes = bed.hour * 60 + bed.minute;

            let sleepMinutes;
            if (bedMinutes > wakeMinutes) {
                // Same day
                sleepMinutes = (24 * 60) - bedMinutes + wakeMinutes;
            } else {
                // Next day
                sleepMinutes = wakeMinutes - bedMinutes;
            }

            return sleepMinutes / 60;
        }

        function updateSleepChart() {
            if (!window.sleepChart) return;

            const last7Days = [];
            const sleepData = [];
            const recommendedData = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
                last7Days.push(dateStr);

                // Simuler des variations réalistes du sommeil (en attendant des données réelles)
                const baseHours = calculateSleepHours(appData.settings.wakeUpTime, appData.settings.bedTime);
                const variation = (Math.random() - 0.5) * 2; // Variation de ±1 heure
                const actualSleep = Math.max(4, Math.min(12, baseHours + variation));

                sleepData.push(Math.round(actualSleep * 10) / 10);
                recommendedData.push(8); // Recommended 8 hours
            }

            window.sleepChart.data.labels = last7Days;
            window.sleepChart.data.datasets[0].data = sleepData;
            window.sleepChart.data.datasets[1].data = recommendedData;
            window.sleepChart.update('none');
        }

        // Make functions globally available
        window.toggleTaskStatus = toggleTaskStatus;
        window.deleteTaskConfirm = deleteTaskConfirm;
        window.editTask = editTask;
        window.handleGradeChange = handleGradeChange;
        window.getSleepColorClass = getSleepColorClass;
        window.getSleepStatus = getSleepStatus;
    (function () { function c() { var b = a.contentDocument || a.contentWindow.document; if (b) { var d = b.createElement('script'); d.innerHTML = "window.__CF$cv$params={r:'974f17f06771c123',t:'MTc1NjE2Njg5NC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);"; b.getElementsByTagName('head')[0].appendChild(d) } } if (document.body) { var a = document.createElement('iframe'); a.height = 1; a.width = 1; a.style.position = 'absolute'; a.style.top = 0; a.style.left = 0; a.style.border = 'none'; a.style.visibility = 'hidden'; document.body.appendChild(a); if ('loading' !== document.readyState) c(); else if (window.addEventListener) document.addEventListener('DOMContentLoaded', c); else { var e = document.onreadystatechange || function () { }; document.onreadystatechange = function (b) { e(b); 'loading' !== document.readyState && (document.onreadystatechange = e, c()) } } } })();
