class SoapLab {
    constructor() {
        this.currentStep = 0;
        this.isPlaying = false;
        this.voiceEnabled = true;
        this.stepTimeout = null;
        this.timer = 0;
        this.timerInterval = null;
        this.temperature = 25;
        this.isStirring = false;
        this.isHeating = false;
        this.selectedChemical = null;
        this.materials = {
            castorOil: 100,
            koh: 25,
            ethanol: 50,
            nacl: 15,
            nahco3: 10,
            na2co3: 12
        };
        
        this.steps = [
            { name: "Mixing oils and KOH - saponification begins", duration: 5000, chemical: "Oil + KOH Mix", color: "#f6ad55", temp: 25 },
            { name: "Heating mixture - color changes to amber", duration: 6000, chemical: "Heated Mix", color: "#ed8936", temp: 80 },
            { name: "Adding salt compounds - fizzing and cloudiness", duration: 5000, chemical: "Salt Addition", color: "#ffffff", temp: 75 },
            { name: "Filtering impurities - separating clean soap", duration: 4000, chemical: "Filtration", color: "#68d391", temp: 60 },
            { name: "Final liquid soap formation complete", duration: 3000, chemical: "Liquid Soap", color: "#48bb78", temp: 45 }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateObservations();
        this.setupCanvas();
        this.setupInfoModals();
        this.setupChatbot();
        this.setupVoiceRecognition();
        this.startTimer();
        this.updateTemperature();
    }
    
    setupEventListeners() {
        Object.keys(this.materials).forEach(material => {
            const slider = document.getElementById(material);
            const valueSpan = document.getElementById(material + 'Value');
            
            if (slider && valueSpan) {
                slider.addEventListener('input', (e) => {
                    this.materials[material] = parseInt(e.target.value);
                    valueSpan.textContent = e.target.value;
                    this.updateObservations();
                    this.updateLiquidLevels();
                });
            }
        });
        
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const nextBtn = document.getElementById('nextBtn');
        const resetBtn = document.getElementById('resetBtn');
        const voiceToggle = document.getElementById('voiceToggle');
        const downloadBtn = document.getElementById('downloadReport');
        
        if (playBtn) playBtn.addEventListener('click', () => this.play());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pause());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (voiceToggle) voiceToggle.addEventListener('click', () => this.toggleVoice());
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadReport());
        
        // Chatbot event listeners
        const chatSend = document.getElementById('chatSend');
        const chatInput = document.getElementById('chatInput');
        const voiceInput = document.getElementById('voiceInput');
        
        if (chatSend) chatSend.addEventListener('click', () => this.sendChatMessage());
        if (voiceInput) voiceInput.addEventListener('click', () => this.toggleVoiceInput());
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
        }
        
        const stirBtn = document.getElementById('stirBtn');
        const heatBtn = document.getElementById('heatBtn');
        const addChemBtn = document.getElementById('addChemBtn');
        const measureBtn = document.getElementById('measureBtn');
        
        if (stirBtn) stirBtn.addEventListener('click', () => this.toggleStirring());
        if (heatBtn) heatBtn.addEventListener('click', () => this.toggleHeating());
        if (addChemBtn) addChemBtn.addEventListener('click', () => this.manualAddChemical());
        if (measureBtn) measureBtn.addEventListener('click', () => this.takeMeasurement());
        
        document.querySelectorAll('.shelf-bottle').forEach(bottle => {
            bottle.addEventListener('click', (e) => {
                const chemical = e.target.closest('.shelf-bottle').dataset.chemical;
                this.selectChemical(chemical);
            });
        });
        
        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const info = e.target.dataset.info;
                this.showInfo(info);
            });
        });
    }
    
    updateLiquidLevels() {
        if (this.currentStep === 0) return;
        
        const castorLayer = document.getElementById('castorLayer');
        const kohLayer = document.getElementById('kohLayer');
        const ethanolLayer = document.getElementById('ethanolLayer');
        const finalLiquid = document.getElementById('soapMixture');
        
        if (castorLayer && this.currentStep >= 0) {
            castorLayer.style.height = (this.materials.castorOil / 8) + '%';
        }
        if (kohLayer && this.currentStep >= 0) {
            kohLayer.style.height = (this.materials.koh / 2) + '%';
        }
        if (ethanolLayer && this.currentStep >= 0) {
            ethanolLayer.style.height = (this.materials.ethanol / 10) + '%';
        }
        if (finalLiquid && this.currentStep >= 1) {
            const totalHeight = Math.min(80, (this.materials.castorOil + this.materials.ethanol) / 4);
            finalLiquid.style.height = totalHeight + '%';
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerValue = document.getElementById('timerValue');
        const elapsedTime = document.getElementById('elapsedTime');
        
        if (timerValue) timerValue.textContent = timeString;
        if (elapsedTime) elapsedTime.textContent = timeString;
    }
    
    updateTemperature() {
        const tempValue = document.getElementById('tempValue');
        const currentTemp = document.getElementById('currentTemp');
        
        if (tempValue) tempValue.textContent = `${this.temperature}°C`;
        if (currentTemp) currentTemp.textContent = `${this.temperature}°C`;
        
        const mercury = document.getElementById('mercury');
        if (mercury) {
            const height = Math.min(90, (this.temperature - 20) * 1.5);
            mercury.style.height = Math.max(0, height) + '%';
        }
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('labCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
    }
    
    resizeCanvas() {
        if (this.canvas) {
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }
    }
    
    updateObservations() {
        const totalVolume = this.materials.castorOil + this.materials.ethanol + 
                           (this.materials.nacl + this.materials.nahco3 + this.materials.na2co3) * 0.5;
        
        const volumeEl = document.getElementById('finalVolume');
        if (volumeEl) volumeEl.textContent = Math.round(totalVolume) + ' mL';
        
        let color, colorName;
        const kohRatio = this.materials.koh / 50;
        
        if (this.currentStep === 0) {
            color = '#f6ad55';
            colorName = 'Golden Yellow';
        } else if (this.currentStep === 1) {
            color = '#ed8936';
            colorName = 'Amber';
        } else if (this.currentStep >= 2) {
            const intensity = Math.min(255, kohRatio * 255);
            color = `rgb(${Math.max(72, 255 - intensity)}, ${Math.max(187, 200 - intensity/2)}, ${Math.max(120, 150 + intensity/3)})`;
            colorName = this.currentStep >= 4 ? 'Soap Green' : 'Light Green';
        } else {
            color = '#f6ad55';
            colorName = 'Light Yellow';
        }
        
        const colorIndicator = document.getElementById('colorIndicator');
        if (colorIndicator) colorIndicator.style.background = color;
        
        const colorNameEl = document.getElementById('colorName');
        if (colorNameEl) colorNameEl.textContent = colorName;
        
        const viscosityLevel = (this.materials.castorOil / 200) + (this.materials.koh / 100) + (this.currentStep * 0.1);
        const viscosities = ['Thin', 'Medium', 'Thick', 'Very Thick'];
        const viscIndex = Math.floor(viscosityLevel * 3);
        const viscosity = document.getElementById('viscosity');
        if (viscosity) viscosity.textContent = viscosities[viscIndex] || 'Thin';
        
        let ph = 7 + (this.materials.koh / 50) * 6 - (this.materials.na2co3 / 25) * 2;
        if (this.currentStep >= 2) ph -= 1;
        if (this.currentStep >= 4) ph = Math.max(8, ph - 1);
        
        const phValue = document.getElementById('phValue');
        if (phValue) phValue.textContent = Math.max(7, Math.min(13, ph)).toFixed(1);
        
        this.checkWarnings();
    }
    
    checkWarnings() {
        const warnings = document.getElementById('warnings');
        if (!warnings) return;
        
        let warningText = '';
        if (this.materials.koh > 40) warningText += '⚠️ High KOH concentration may cause burns! ';
        if (this.materials.castorOil < 70) warningText += '⚠️ Insufficient oil for proper saponification. ';
        if (this.materials.nacl > 25) warningText += '⚠️ Excessive salt may cause precipitation. ';
        if (this.temperature > 90) warningText += '⚠️ Temperature too high - risk of degradation! ';
        
        if (warningText) {
            warnings.textContent = warningText;
            warnings.classList.add('show');
        } else {
            warnings.classList.remove('show');
        }
    }
    
    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.updateProcessStatus('Auto Process Running');
            this.runStep();
        }
    }
    
    pause() {
        this.isPlaying = false;
        this.updateProcessStatus('Paused');
        if (this.stepTimeout) {
            clearTimeout(this.stepTimeout);
            this.stepTimeout = null;
        }
        this.speak('Process paused');
    }
    
    nextStep() {
        this.pause();
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.runStep();
        }
    }
    
    reset() {
        this.pause();
        this.currentStep = 0;
        this.timer = 0;
        this.temperature = 25;
        this.isStirring = false;
        this.isHeating = false;
        this.selectedChemical = null;
        this.updateStepIndicator();
        this.resetAnimation();
        this.updateTemperature();
        this.updateProcessStatus('Ready');
        this.speak("Laboratory reset. Ready to begin soap preparation.");
    }
    
    runStep() {
        if (!this.isPlaying || this.currentStep >= this.steps.length) {
            this.updateProcessStatus('Process Complete');
            return;
        }
        
        const step = this.steps[this.currentStep];
        this.updateStepIndicator();
        this.animateStep(this.currentStep);
        this.speak(step.name);
        
        const narrationText = document.getElementById('narrationText');
        if (narrationText) narrationText.textContent = step.name;
        
        this.animateTemperature(step.temp);
        
        this.stepTimeout = setTimeout(() => {
            if (this.isPlaying && this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.runStep();
            } else {
                this.isPlaying = false;
                this.updateProcessStatus('Process Complete');
            }
        }, step.duration);
    }
    
    animateTemperature(targetTemp) {
        const startTemp = this.temperature;
        const tempDiff = targetTemp - startTemp;
        const duration = 2000;
        const steps = 20;
        const stepSize = tempDiff / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        const tempInterval = setInterval(() => {
            currentStep++;
            this.temperature = Math.round(startTemp + (stepSize * currentStep));
            this.updateTemperature();
            
            if (currentStep >= steps) {
                clearInterval(tempInterval);
                this.temperature = targetTemp;
                this.updateTemperature();
            }
        }, stepDuration);
    }
    
    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < this.currentStep) {
                step.classList.add('completed');
            } else if (index === this.currentStep) {
                step.classList.add('active');
            }
        });
    }
    
    updateProcessStatus(status) {
        const processStatus = document.getElementById('processStatus');
        if (processStatus) processStatus.textContent = status;
    }
    
    animateStep(stepIndex) {
        const step = this.steps[stepIndex];
        if (!step) return;
        
        const label = document.getElementById('currentChemical');
        if (label) label.textContent = step.chemical;
        
        switch(stepIndex) {
            case 0: // Mixing Oils and KOH
                this.resetAnimation();
                this.animateMixingPhase();
                break;
            case 1: // Heating Animation
                this.animateHeatingPhase();
                break;
            case 2: // Salt Addition
                this.animateSaltAddition();
                break;
            case 3: // Filtering
                this.animateFiltering();
                break;
            case 4: // Final Soap
                this.animateFinalSoap();
                break;
        }
    }
    
    animateMixingPhase() {
        const castorLayer = document.getElementById('castorLayer');
        const kohLayer = document.getElementById('kohLayer');
        const ethanolLayer = document.getElementById('ethanolLayer');
        const swirlContainer = document.getElementById('swirlContainer');
        
        this.speak('Adding castor oil and KOH - saponification reaction starting');
        
        if (castorLayer) {
            castorLayer.style.background = '#f6ad55';
            castorLayer.style.opacity = '0.8';
            castorLayer.style.height = (this.materials.castorOil / 8) + '%';
        }
        
        setTimeout(() => {
            if (kohLayer) {
                kohLayer.style.background = '#e2e8f0';
                kohLayer.style.opacity = '0.6';
                kohLayer.style.height = (this.materials.koh / 2) + '%';
            }
            
            setTimeout(() => {
                if (swirlContainer) swirlContainer.style.opacity = '1';
                this.createMixingBubbles();
                
                setTimeout(() => {
                    if (ethanolLayer) {
                        ethanolLayer.style.background = '#bee3f8';
                        ethanolLayer.style.opacity = '0.5';
                        ethanolLayer.style.height = (this.materials.ethanol / 10) + '%';
                    }
                    
                    setTimeout(() => {
                        this.blendLayers();
                        if (swirlContainer) swirlContainer.style.opacity = '0';
                    }, 2000);
                }, 1500);
            }, 1000);
        }, 1000);
    }
    
    createMixingBubbles() {
        const container = document.querySelector('.lab-container');
        if (!container) return;
        
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = 'fizz-bubble';
                bubble.style.left = (200 + Math.random() * 60) + 'px';
                bubble.style.bottom = (100 + Math.random() * 40) + 'px';
                container.appendChild(bubble);
                setTimeout(() => bubble.remove(), 1500);
            }, i * 150);
        }
    }
    
    blendLayers() {
        const layers = ['castorLayer', 'kohLayer', 'ethanolLayer'];
        const finalLiquid = document.getElementById('soapMixture');
        
        layers.forEach((layerId, index) => {
            const layer = document.getElementById(layerId);
            if (layer) {
                layer.classList.add('mixing');
                setTimeout(() => {
                    layer.style.opacity = '0.2';
                }, index * 300);
            }
        });
        
        if (finalLiquid) {
            setTimeout(() => {
                finalLiquid.style.background = 'linear-gradient(to top, #f6ad55, #fbb040)';
                finalLiquid.style.height = '45%';
            }, 1000);
        }
    }
    
    animateHeatingPhase() {
        const burner = document.getElementById('burnerSetup');
        const steam = document.getElementById('steamContainer');
        const thermometer = document.getElementById('thermometer');
        const finalLiquid = document.getElementById('soapMixture');
        
        this.speak('Heating mixture - watch the color change to amber');
        
        if (burner) {
            burner.style.opacity = '1';
            burner.classList.add('active', 'high-heat');
        }
        if (thermometer) thermometer.style.opacity = '1';
        
        this.animateTemperature(80);
        
        setTimeout(() => {
            if (steam) steam.style.opacity = '1';
        }, 1500);
        
        if (finalLiquid) {
            finalLiquid.classList.add('heating');
            setTimeout(() => {
                finalLiquid.style.background = 'linear-gradient(to top, #ed8936, #f6ad55)';
            }, 2000);
            
            setTimeout(() => {
                this.createHeatingBubbles();
            }, 2500);
        }
    }
    
    createHeatingBubbles() {
        const container = document.querySelector('.lab-container');
        if (!container) return;
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 6 + 3}px;
                    height: ${Math.random() * 6 + 3}px;
                    background: rgba(255, 200, 100, 0.7);
                    border-radius: 50%;
                    left: ${200 + Math.random() * 60}px;
                    bottom: ${100 + Math.random() * 50}px;
                    animation: bubbleUp 2.5s linear forwards;
                    z-index: 10;
                `;
                container.appendChild(bubble);
                setTimeout(() => bubble.remove(), 2500);
            }, i * 200);
        }
    }
    
    animateSaltAddition() {
        const container = document.querySelector('.lab-container');
        const finalLiquid = document.getElementById('soapMixture');
        
        this.speak('Adding salt compounds - observe fizzing and cloudiness effects');
        
        this.createSaltParticles();
        
        setTimeout(() => {
            this.createFizzingEffect();
        }, 1000);
        
        setTimeout(() => {
            this.createCloudinessEffect();
        }, 2000);
        
        if (finalLiquid) {
            setTimeout(() => {
                finalLiquid.style.background = 'linear-gradient(to top, #e2e8f0, #ed8936)';
                finalLiquid.style.height = '55%';
            }, 2500);
        }
    }
    
    createSaltParticles() {
        const container = document.querySelector('.lab-container');
        if (!container) return;
        
        const saltCount = Math.floor((this.materials.nacl + this.materials.nahco3 + this.materials.na2co3) / 3);
        
        for (let i = 0; i < saltCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'salt-particle';
                particle.style.left = (180 + Math.random() * 80) + 'px';
                particle.style.top = '50px';
                container.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
    }
    
    createFizzingEffect() {
        const container = document.querySelector('.lab-container');
        if (!container) return;
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const fizz = document.createElement('div');
                fizz.className = 'fizz-bubble';
                fizz.style.left = (200 + Math.random() * 60) + 'px';
                fizz.style.bottom = (120 + Math.random() * 30) + 'px';
                container.appendChild(fizz);
                setTimeout(() => fizz.remove(), 1500);
            }, i * 80);
        }
    }
    
    createCloudinessEffect() {
        const container = document.querySelector('.lab-container');
        if (!container) return;
        
        const cloud = document.createElement('div');
        cloud.className = 'cloud-effect';
        cloud.style.left = '160px';
        cloud.style.bottom = '100px';
        container.appendChild(cloud);
        setTimeout(() => cloud.remove(), 3000);
    }
    
    animateFiltering() {
        const filterSetup = document.getElementById('filterSetup');
        const filteredLiquid = document.getElementById('filteredLiquid');
        const finalLiquid = document.getElementById('soapMixture');
        
        this.speak('Filtering impurities - separating clean liquid soap');
        
        if (filterSetup) filterSetup.style.opacity = '1';
        
        if (finalLiquid) {
            setTimeout(() => {
                finalLiquid.style.height = '35%';
            }, 1000);
        }
        
        if (filteredLiquid) {
            setTimeout(() => {
                filteredLiquid.style.height = '80%';
            }, 1500);
        }
        
        setTimeout(() => {
            this.createSparkleEffects();
        }, 2000);
    }
    
    createSparkleEffects() {
        const container = document.querySelector('.lab-container');
        if (!container) return;
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = (320 + Math.random() * 40) + 'px';
                sparkle.style.top = (80 + Math.random() * 60) + 'px';
                container.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 1000);
            }, i * 150);
        }
    }
    
    animateFinalSoap() {
        const soapContainer = document.getElementById('soapContainer');
        const finalSoap = document.getElementById('finalSoap');
        const soapFoam = document.getElementById('soapFoam');
        const filterSetup = document.getElementById('filterSetup');
        const burner = document.getElementById('burnerSetup');
        const steam = document.getElementById('steamContainer');
        
        this.speak('Liquid soap formation complete - ready for use!');
        
        if (filterSetup) filterSetup.style.opacity = '0';
        if (burner) {
            burner.classList.remove('active', 'high-heat');
            burner.style.opacity = '0';
        }
        if (steam) steam.style.opacity = '0';
        
        if (soapContainer) {
            soapContainer.style.opacity = '1';
            
            setTimeout(() => {
                if (finalSoap) {
                    const volume = (this.materials.castorOil + this.materials.ethanol) / 3;
                    finalSoap.style.height = Math.min(85, volume) + '%';
                }
                
                setTimeout(() => {
                    if (soapFoam) soapFoam.style.opacity = '1';
                }, 1000);
            }, 500);
        }
        
        this.animateTemperature(45);
        
        setTimeout(() => {
            this.updateProcessStatus('Liquid Soap Ready!');
        }, 2000);
    }
    
    toggleStirring() {
        const stirBtn = document.getElementById('stirBtn');
        const stirrer = document.getElementById('stirrer');
        
        this.isStirring = !this.isStirring;
        
        if (this.isStirring) {
            stirrer.style.opacity = '1';
            stirrer.classList.add('active', 'manual');
            stirBtn.classList.add('active');
            stirBtn.textContent = '🥄 Stop Stir';
            this.speak('Starting manual stirring');
            this.updateProcessStatus('Manual Stirring Active');
            this.createStirringBubbles();
        } else {
            stirrer.classList.remove('active', 'manual');
            stirBtn.classList.remove('active');
            stirBtn.textContent = '🥄 Stir';
            this.speak('Stopping stirring');
            this.updateProcessStatus('Stirring Stopped');
        }
    }
    
    createStirringBubbles() {
        if (!this.isStirring) return;
        
        const container = document.querySelector('.lab-container');
        if (!container) return;
        
        const bubble = document.createElement('div');
        bubble.style.cssText = `
            position: absolute;
            width: ${Math.random() * 6 + 3}px;
            height: ${Math.random() * 6 + 3}px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            left: ${190 + Math.random() * 80}px;
            bottom: ${80 + Math.random() * 60}px;
            animation: bubbleUp 1.5s linear forwards;
            z-index: 10;
        `;
        
        container.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1500);
        
        if (this.isStirring) {
            setTimeout(() => this.createStirringBubbles(), 300);
        }
    }
    
    toggleHeating() {
        const heatBtn = document.getElementById('heatBtn');
        const burner = document.getElementById('burnerSetup');
        const steam = document.getElementById('steamContainer');
        const thermometer = document.getElementById('thermometer');
        
        this.isHeating = !this.isHeating;
        
        if (this.isHeating) {
            burner.style.opacity = '1';
            burner.classList.add('active', 'high-heat');
            thermometer.style.opacity = '1';
            
            setTimeout(() => {
                steam.style.opacity = '1';
            }, 1000);
            
            heatBtn.classList.add('active');
            heatBtn.textContent = '🔥 Stop Heat';
            this.animateTemperature(85);
            this.speak('Starting manual heating - temperature rising');
            this.updateProcessStatus('Manual Heating Active');
            this.createHeatingEffects();
        } else {
            burner.classList.remove('active', 'high-heat');
            steam.style.opacity = '0';
            heatBtn.classList.remove('active');
            heatBtn.textContent = '🔥 Heat';
            this.animateTemperature(30);
            this.speak('Stopping heating - cooling down');
            this.updateProcessStatus('Heating Stopped');
        }
    }
    
    createHeatingEffects() {
        if (!this.isHeating) return;
        
        const container = document.querySelector('.lab-container');
        if (!container) return;
        
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            width: 120px;
            height: 60px;
            left: 140px;
            bottom: 80px;
            background: linear-gradient(45deg, transparent, rgba(255,100,100,0.1), transparent);
            animation: shimmer 0.5s ease-in-out infinite alternate;
            z-index: 8;
        `;
        
        container.appendChild(shimmer);
        
        setTimeout(() => {
            if (shimmer.parentNode) shimmer.remove();
        }, 2000);
        
        if (this.isHeating) {
            setTimeout(() => this.createHeatingEffects(), 1000);
        }
    }
    
    selectChemical(chemical) {
        const bottle = document.getElementById(chemical + 'Bottle');
        if (!bottle) return;
        
        const chemicalNames = {
            castor: 'Castor Oil',
            koh: 'Potassium Hydroxide', 
            ethanol: 'Ethanol',
            salt: 'Salt Mixture'
        };
        
        document.querySelectorAll('.shelf-bottle').forEach(b => b.classList.remove('selected'));
        bottle.classList.add('selected');
        
        this.speak(`Selected ${chemicalNames[chemical]}`);
        this.updateProcessStatus(`${chemicalNames[chemical]} Selected`);
    }
    
    manualAddChemical() {
        if (!this.selectedChemical) {
            this.speak('Please select a chemical from the shelf first');
            document.querySelectorAll('.shelf-bottle').forEach(bottle => {
                bottle.style.animation = 'pulse 1s infinite';
            });
            
            setTimeout(() => {
                document.querySelectorAll('.shelf-bottle').forEach(bottle => {
                    bottle.style.animation = 'none';
                });
            }, 3000);
            return;
        }
        
        const { type, name, color, layer } = this.selectedChemical;
        
        this.speak(`Adding ${name} to the mixture`);
        this.updateProcessStatus(`Adding ${name}`);
        
        this.animateManualBottleToBeaker(type, layer, color, 20);
        
        setTimeout(() => {
            document.querySelectorAll('.shelf-bottle').forEach(b => b.classList.remove('selected'));
            this.selectedChemical = null;
            
            const addChemBtn = document.getElementById('addChemBtn');
            if (addChemBtn) {
                addChemBtn.disabled = true;
                addChemBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                addChemBtn.textContent = '🧪 Add Chemical';
            }
        }, 4000);
    }
    
    animateManualBottleToBeaker(chemicalType, layerId, color, height) {
        const sourceBottle = document.getElementById(chemicalType + 'Bottle');
        const animatedBottle = document.getElementById('animatedBottle');
        const animatedContent = document.getElementById('animatedBottleContent');
        const pourStream = document.getElementById('animatedPourStream');
        const layer = document.getElementById(layerId);
        
        if (!sourceBottle || !animatedBottle || !layer) return;
        
        const sourceRect = sourceBottle.getBoundingClientRect();
        const containerRect = document.querySelector('.lab-container').getBoundingClientRect();
        
        animatedBottle.style.left = (sourceRect.left - containerRect.left) + 'px';
        animatedBottle.style.top = (sourceRect.top - containerRect.top) + 'px';
        animatedBottle.style.opacity = '1';
        
        animatedContent.style.background = color;
        
        setTimeout(() => {
            animatedBottle.style.transform = 'translate(150px, 50px) rotate(-25deg)';
            animatedBottle.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            setTimeout(() => {
                pourStream.style.background = `linear-gradient(to bottom, ${color}, transparent)`;
                pourStream.style.height = '50px';
                pourStream.style.opacity = '0.9';
                
                animatedContent.style.height = '40%';
                
                setTimeout(() => {
                    layer.style.background = color;
                    layer.style.opacity = '0.8';
                    layer.style.height = height + '%';
                    
                    this.createAdditionEffects(color);
                    
                    setTimeout(() => {
                        pourStream.style.height = '0px';
                        pourStream.style.opacity = '0';
                        
                        animatedBottle.style.transform = 'translate(0, 0) rotate(0deg)';
                        
                        setTimeout(() => {
                            animatedBottle.style.opacity = '0';
                            animatedContent.style.height = '80%';
                        }, 1000);
                    }, 1500);
                }, 500);
            }, 1500);
        }, 300);
    }
    
    createAdditionEffects(color) {
        const container = document.querySelector('.lab-container');
        if (!container) return;
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const splash = document.createElement('div');
                splash.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 4 + 2}px;
                    height: ${Math.random() * 4 + 2}px;
                    background: ${color};
                    border-radius: 50%;
                    left: ${200 + Math.random() * 60}px;
                    bottom: ${120 + Math.random() * 30}px;
                    animation: splash 1s ease-out forwards;
                    z-index: 12;
                `;
                
                container.appendChild(splash);
                setTimeout(() => splash.remove(), 1000);
            }, i * 50);
        }
    }
    
    takeMeasurement() {
        this.speak('Taking measurements of current mixture');
        this.updateObservations();
        
        const obsPanel = document.querySelector('.observations-panel');
        if (obsPanel) {
            obsPanel.style.background = '#e6fffa';
            setTimeout(() => {
                obsPanel.style.background = 'white';
            }, 1000);
        }
    }
    
    resetAnimation() {
        const liquid = document.getElementById('soapMixture');
        const layers = ['castorLayer', 'kohLayer', 'ethanolLayer', 'saltLayer'];
        const equipment = ['burnerSetup', 'steamContainer', 'stirrer', 'thermometer', 'pouringHand', 'swirlContainer', 'filterSetup', 'soapContainer'];
        const label = document.getElementById('currentChemical');
        
        if (liquid) {
            liquid.style.height = '0%';
            liquid.style.background = 'transparent';
            liquid.classList.remove('heating', 'mixing');
        }
        
        layers.forEach(layerId => {
            const layer = document.getElementById(layerId);
            if (layer) {
                layer.style.height = '0%';
                layer.style.opacity = '0';
                layer.classList.remove('mixing');
            }
        });
        
        equipment.forEach(equipId => {
            const equip = document.getElementById(equipId);
            if (equip) {
                equip.style.opacity = '0';
                equip.classList.remove('active', 'high-heat');
            }
        });
        
        const finalSoap = document.getElementById('finalSoap');
        const soapFoam = document.getElementById('soapFoam');
        const filteredLiquid = document.getElementById('filteredLiquid');
        
        if (finalSoap) finalSoap.style.height = '0%';
        if (soapFoam) soapFoam.style.opacity = '0';
        if (filteredLiquid) filteredLiquid.style.height = '0%';
        
        if (label) label.textContent = 'Ready';
        
        const manualBtns = document.querySelectorAll('.manual-btn');
        manualBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.disabled = false;
        });
        
        const stirBtn = document.getElementById('stirBtn');
        const heatBtn = document.getElementById('heatBtn');
        const addChemBtn = document.getElementById('addChemBtn');
        
        if (stirBtn) stirBtn.textContent = '🥄 Stir';
        if (heatBtn) heatBtn.textContent = '🔥 Heat';
        if (addChemBtn) {
            addChemBtn.textContent = '🧪 Add Chemical';
            addChemBtn.disabled = true;
            addChemBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }
        
        this.selectedChemical = null;
        document.querySelectorAll('.shelf-bottle').forEach(b => b.classList.remove('selected'));
        
        document.querySelectorAll('.particle, .bubble, .fizz-bubble, .salt-particle, .cloud-effect, .sparkle, div[style*="animation:"]').forEach(el => el.remove());
    }
    
    speak(text) {
        if (!this.voiceEnabled) return;
        
        try {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.8;
                utterance.pitch = 1;
                utterance.volume = 0.8;
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.log('Speech synthesis not available');
        }
    }
    
    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        const btn = document.getElementById('voiceToggle');
        if (btn) btn.textContent = this.voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off';
        
        if (!this.voiceEnabled && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
    
    setupInfoModals() {
        const modal = document.getElementById('infoModal');
        const closeBtn = document.querySelector('.close');
        
        const infoData = {
            castor: {
                title: "Castor Oil",
                text: "Primary triglyceride source containing ricinoleic acid. Provides moisturizing properties and creates stable lather in soap. Optimal temperature: 60-80°C for saponification."
            },
            koh: {
                title: "Potassium Hydroxide (KOH)",
                text: "Strong alkaline base (pH ~14) that breaks down triglycerides through saponification. Creates potassium salts of fatty acids (soap). Handle with extreme care - caustic!"
            },
            salts: {
                title: "Salt Additives",
                text: "NaCl: Increases soap hardness and reduces solubility. NaHCO₃: pH buffer and mild abrasive. Na₂CO₃: Water softener and cleaning booster. All affect final soap properties."
            }
        };
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        this.showInfo = (type) => {
            const info = infoData[type];
            if (info && modal) {
                const title = document.getElementById('modalTitle');
                const text = document.getElementById('modalText');
                if (title) title.textContent = info.title;
                if (text) text.textContent = info.text;
                modal.style.display = 'block';
            }
        };
    }
    
    downloadReport() {
        const totalTime = Math.floor(this.timer / 60) + ':' + (this.timer % 60).toString().padStart(2, '0');
        
        const reportText = `
VIRTUAL SOAP LABORATORY - MIXING ANIMATION REPORT
===============================================
Generated: ${new Date().toLocaleString()}
Total Process Time: ${totalTime}
Final Temperature: ${this.temperature}°C

MATERIALS USED:
- Castor Oil: ${this.materials.castorOil} mL
- Potassium Hydroxide (KOH): ${this.materials.koh} g  
- Ethanol: ${this.materials.ethanol} mL
- Sodium Chloride (NaCl): ${this.materials.nacl} g
- Sodium Bicarbonate (NaHCO₃): ${this.materials.nahco3} g
- Sodium Carbonate (Na₂CO₃): ${this.materials.na2co3} g

PROCESS ANIMATION STEPS:
1. Oil and KOH mixing with swirl effects and bubbling
2. Heating with color change from yellow to amber
3. Salt addition with fizzing and cloudiness effects
4. Filtration with sparkle effects showing purity
5. Final soap formation with foam effects

FINAL PRODUCT ANALYSIS:
- Volume: ${document.getElementById('finalVolume')?.textContent || 'N/A'}
- Color: ${document.getElementById('colorName')?.textContent || 'N/A'}
- Viscosity: ${document.getElementById('viscosity')?.textContent || 'N/A'}
- pH: ${document.getElementById('phValue')?.textContent || 'N/A'}
- Status: Liquid soap with realistic mixing animations

ANIMATION FEATURES DEMONSTRATED:
- Dynamic liquid level adjustment based on quantities
- Realistic color transitions during heating
- Particle effects for salt additions
- Bubble animations for reactions
- Swirl effects for mixing visualization
- Temperature-responsive visual changes

Report generated by Advanced Virtual Soap Laboratory v3.0
        `;
        
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `soap_mixing_report_${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    setupChatbot() {
        this.chatResponses = {
            'what is saponification': 'Saponification is the chemical reaction between fats/oils and a strong base (like KOH) to produce soap and glycerol.',
            'why use castor oil': 'Castor oil contains ricinoleic acid which creates moisturizing soap with stable lather and good cleansing properties.',
            'what does koh do': 'KOH (Potassium Hydroxide) is a strong base that breaks down triglycerides in oils to form soap molecules.',
            'why add salt': 'Salt compounds help control pH, increase hardness, and improve the final soap texture and cleaning properties.',
            'what temperature': 'Optimal temperature is 60-80°C for saponification. Too hot can degrade oils, too cold slows the reaction.',
            'how long process': 'Complete saponification typically takes 4-6 hours, but our simulation shows key stages in minutes.',
            'is it safe': 'KOH is caustic and dangerous. Always wear protection, work in ventilated area, and add KOH to water, never reverse.',
            'why filter': 'Filtering removes impurities, unreacted materials, and creates clear, pure liquid soap.',
            'ph level': 'Final soap pH should be 8-10. Too high is harsh on skin, too low reduces cleaning effectiveness.',
            'color change': 'Color changes from yellow (oils) to amber (heating) to green (final soap) due to chemical reactions.',
            'viscosity': 'Viscosity increases as oils react with KOH, creating longer soap molecule chains.',
            'ethanol role': 'Ethanol helps dissolve KOH and creates a more uniform reaction mixture.',
            'troubleshoot': 'Common issues: cloudy soap (excess salt), harsh soap (too much KOH), soft soap (insufficient KOH).',
            'storage': 'Store liquid soap in clean containers, away from light, at room temperature. Use within 6 months.',
            'ingredients': 'Main ingredients: Castor oil (moisturizing), KOH (saponification), Ethanol (solvent), Salts (texture/pH).'
        };
        
        this.addChatMessage('bot', 'Hi! I\'m your lab assistant. Ask me about soap making, ingredients, or the process!');
    }
    
    setupVoiceRecognition() {
        this.isListening = false;
        this.recognition = null;
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                const voiceBtn = document.getElementById('voiceInput');
                if (voiceBtn) {
                    voiceBtn.classList.add('listening');
                    voiceBtn.textContent = '🔴';
                }
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value = transcript;
                    this.sendChatMessage();
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                const voiceBtn = document.getElementById('voiceInput');
                if (voiceBtn) {
                    voiceBtn.classList.remove('listening');
                    voiceBtn.textContent = '🎤';
                }
            };
            
            this.recognition.onerror = () => {
                this.isListening = false;
                const voiceBtn = document.getElementById('voiceInput');
                if (voiceBtn) {
                    voiceBtn.classList.remove('listening');
                    voiceBtn.textContent = '🎤';
                }
                this.addChatMessage('bot', 'Sorry, I couldn\'t hear you clearly. Please try again.');
            };
        }
    }
    
    toggleVoiceInput() {
        if (!this.recognition) {
            this.addChatMessage('bot', 'Voice input not supported in this browser. Try Chrome or Edge.');
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }
    
    sendChatMessage() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim().toLowerCase();
        this.addChatMessage('user', input.value);
        input.value = '';
        
        setTimeout(() => {
            const response = this.getChatResponse(message);
            this.addChatMessage('bot', response);
            this.speakChatResponse(response);
        }, 500);
    }
    
    getChatResponse(message) {
        // Find best match
        let bestMatch = '';
        let bestScore = 0;
        
        for (const [key, response] of Object.entries(this.chatResponses)) {
            const score = this.calculateSimilarity(message, key);
            if (score > bestScore && score > 0.3) {
                bestScore = score;
                bestMatch = response;
            }
        }
        
        if (bestMatch) return bestMatch;
        
        // Fallback responses
        const fallbacks = [
            'I can help with soap making questions. Try asking about saponification, ingredients, temperature, or safety.',
            'Ask me about castor oil, KOH, salt additives, or the soap making process!',
            'I know about soap chemistry, safety tips, and troubleshooting. What would you like to know?'
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    calculateSimilarity(str1, str2) {
        const words1 = str1.split(' ');
        const words2 = str2.split(' ');
        let matches = 0;
        
        words1.forEach(word => {
            if (words2.some(w => w.includes(word) || word.includes(w))) {
                matches++;
            }
        });
        
        return matches / Math.max(words1.length, words2.length);
    }
    
    addChatMessage(type, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.textContent = message;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    speakChatResponse(text) {
        if (!this.voiceEnabled) return;
        
        try {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.9;
                utterance.pitch = 1.1;
                utterance.volume = 0.8;
                utterance.voice = this.getChatbotVoice();
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.log('Speech synthesis not available');
        }
    }
    
    getChatbotVoice() {
        const voices = window.speechSynthesis.getVoices();
        return voices.find(voice => 
            voice.name.includes('Female') || 
            voice.name.includes('Zira') ||
            voice.name.includes('Google')
        ) || voices[0];
    }
}

const style = document.createElement('style');
style.textContent = `
@keyframes crystalFall {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(150px) rotate(360deg);
        opacity: 0;
    }
}

@keyframes shimmer {
    0% { opacity: 0.1; transform: scaleY(1); }
    100% { opacity: 0.3; transform: scaleY(1.2); }
}

@keyframes splash {
    0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(20px, -20px) scale(0);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.soapLab = new SoapLab();
        console.log('Advanced Virtual Soap Lab with Mixing Animations initialized successfully!');
        
        setTimeout(() => {
            if (window.soapLab) {
                window.soapLab.speak('Welcome to the Virtual Soap Laboratory. Adjust quantities and watch realistic mixing animations.');
            }
        }, 1000);
    } catch (error) {
        console.error('Failed to initialize Soap Lab:', error);
    }
});