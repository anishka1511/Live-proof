// ===========================
// LiveProof - ML-Based Human Presence Verification
// Frontend Application
// ===========================

class LiveProof {
    constructor() {
        this.sessionId = null;
        this.challenges = [];
        this.currentChallengeIndex = 0;
        this.totalChallenges = 3;
        this.behavioralData = {
            mouseMovements: [],
            reactionTimes: [],
            accuracies: [],
            hesitationTimes: [],
            challengeData: []
        };
        this.currentChallengeStartTime = null;
        this.firstActionTime = null;
        this.mouseTrackingActive = false;
        
        this.init();
    }

    init() {
        // Get DOM elements
        this.startScreen = document.getElementById('startScreen');
        this.challengeScreen = document.getElementById('challengeScreen');
        this.processingScreen = document.getElementById('processingScreen');
        this.resultsScreen = document.getElementById('resultsScreen');
        
        // Buttons
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Add event listeners
        this.startBtn.addEventListener('click', () => this.startVerification());
        this.restartBtn.addEventListener('click', () => this.restart());
    }

    // Generate unique session ID
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `LP-${timestamp}-${random}`.toUpperCase();
    }

    // Start verification process
    startVerification() {
        this.sessionId = this.generateSessionId();
        document.getElementById('sessionId').textContent = this.sessionId;
        document.getElementById('sessionInfo').style.display = 'block';
        
        // Generate challenge sequence
        this.generateChallengeSequence();
        
        setTimeout(() => {
            this.showScreen('challenge');
            this.startChallenge();
        }, 1000);
    }

    // Generate random challenge sequence
    generateChallengeSequence() {
        const challengeTypes = ['click-target', 'sequence', 'timed-reaction'];
        this.challenges = [];
        
        for (let i = 0; i < this.totalChallenges; i++) {
            const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
            this.challenges.push({ type, completed: false });
        }
    }

    // Start a challenge
    startChallenge() {
        if (this.currentChallengeIndex >= this.totalChallenges) {
            this.processResults();
            return;
        }

        const challenge = this.challenges[this.currentChallengeIndex];
        document.getElementById('challengeNumber').textContent = this.currentChallengeIndex + 1;
        document.getElementById('totalChallenges').textContent = this.totalChallenges;
        
        // Update progress bar
        const progress = ((this.currentChallengeIndex) / this.totalChallenges) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        
        // Reset tracking variables
        this.currentChallengeStartTime = Date.now();
        this.firstActionTime = null;
        this.behavioralData.mouseMovements = [];
        
        // Start mouse tracking
        this.startMouseTracking();
        
        // Display appropriate challenge
        switch (challenge.type) {
            case 'click-target':
                this.showClickTargetChallenge();
                break;
            case 'sequence':
                this.showSequenceChallenge();
                break;
            case 'timed-reaction':
                this.showTimedReactionChallenge();
                break;
        }
    }

    // Mouse tracking
    startMouseTracking() {
        this.mouseTrackingActive = true;
        const interactionArea = document.getElementById('interactionArea');
        
        this.mouseMoveHandler = (e) => {
            if (!this.mouseTrackingActive) return;
            
            if (!this.firstActionTime) {
                this.firstActionTime = Date.now();
            }
            
            const rect = interactionArea.getBoundingClientRect();
            this.behavioralData.mouseMovements.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                timestamp: Date.now()
            });
        };
        
        interactionArea.addEventListener('mousemove', this.mouseMoveHandler);
    }

    stopMouseTracking() {
        this.mouseTrackingActive = false;
        const interactionArea = document.getElementById('interactionArea');
        if (this.mouseMoveHandler) {
            interactionArea.removeEventListener('mousemove', this.mouseMoveHandler);
        }
    }

    // Challenge 1: Click randomly appearing target
    showClickTargetChallenge() {
        const display = document.getElementById('challengeDisplay');
        const instructions = document.getElementById('challengeInstructions');
        const interactionArea = document.getElementById('interactionArea');
        
        display.textContent = 'Click Target Challenge';
        instructions.innerHTML = '<strong>Click the button as quickly as possible when it appears</strong>';
        interactionArea.innerHTML = '';
        
        // Wait random time before showing target
        const delay = 1000 + Math.random() * 2000;
        setTimeout(() => {
            const target = document.createElement('button');
            target.className = 'target-button';
            
            // Random position
            const maxX = interactionArea.clientWidth - 60;
            const maxY = interactionArea.clientHeight - 60;
            target.style.left = Math.random() * maxX + 'px';
            target.style.top = Math.random() * maxY + 'px';
            
            target.addEventListener('click', () => {
                this.completeChallenge(true);
            });
            
            interactionArea.appendChild(target);
        }, delay);
    }

    // Challenge 2: Follow sequence
    showSequenceChallenge() {
        const display = document.getElementById('challengeDisplay');
        const instructions = document.getElementById('challengeInstructions');
        const interactionArea = document.getElementById('interactionArea');
        
        // Generate random sequence
        const sequence = [];
        for (let i = 0; i < 4; i++) {
            sequence.push(Math.floor(Math.random() * 6) + 1);
        }
        
        display.textContent = 'Sequence Challenge';
        instructions.innerHTML = `<strong>Click the buttons in this order: ${sequence.join(' → ')}</strong>`;
        
        // Create buttons
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'sequence-buttons';
        
        for (let i = 1; i <= 6; i++) {
            const btn = document.createElement('button');
            btn.className = 'sequence-btn';
            btn.textContent = i;
            buttonsDiv.appendChild(btn);
        }
        
        interactionArea.innerHTML = '';
        interactionArea.appendChild(buttonsDiv);
        
        // Track sequence
        let userSequence = [];
        const buttons = buttonsDiv.querySelectorAll('.sequence-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.firstActionTime) {
                    this.firstActionTime = Date.now();
                }
                
                const value = parseInt(btn.textContent);
                userSequence.push(value);
                btn.classList.add('clicked');
                
                // Check if sequence is complete
                if (userSequence.length === sequence.length) {
                    const correct = JSON.stringify(userSequence) === JSON.stringify(sequence);
                    if (!correct) {
                        btn.classList.add('error');
                    }
                    setTimeout(() => {
                        this.completeChallenge(correct);
                    }, 500);
                } else if (userSequence[userSequence.length - 1] !== sequence[userSequence.length - 1]) {
                    // Wrong button clicked
                    btn.classList.add('error');
                    setTimeout(() => {
                        this.completeChallenge(false);
                    }, 500);
                }
            });
        });
    }

    // Challenge 3: Timed reaction
    showTimedReactionChallenge() {
        const display = document.getElementById('challengeDisplay');
        const instructions = document.getElementById('challengeInstructions');
        const interactionArea = document.getElementById('interactionArea');
        
        display.textContent = 'Reaction Time Challenge';
        instructions.innerHTML = '<strong>Wait for the green signal, then click anywhere in the box</strong>';
        
        interactionArea.innerHTML = '<div style="padding: 100px; font-size: 1.5rem; color: #999;">Wait...</div>';
        interactionArea.style.background = '#ffcccc';
        
        // Wait random time
        const delay = 2000 + Math.random() * 3000;
        setTimeout(() => {
            interactionArea.innerHTML = '<div style="padding: 100px; font-size: 2rem; font-weight: bold; color: #27ae60;">CLICK NOW!</div>';
            interactionArea.style.background = '#d4edda';
            
            const clickHandler = () => {
                interactionArea.removeEventListener('click', clickHandler);
                this.completeChallenge(true);
            };
            
            interactionArea.addEventListener('click', clickHandler);
        }, delay);
    }

    // Complete current challenge
    completeChallenge(accurate) {
        const endTime = Date.now();
        const reactionTime = endTime - this.currentChallengeStartTime;
        const hesitationTime = this.firstActionTime ? this.firstActionTime - this.currentChallengeStartTime : reactionTime;
        
        // Store behavioral data
        this.behavioralData.reactionTimes.push(reactionTime);
        this.behavioralData.accuracies.push(accurate ? 1 : 0);
        this.behavioralData.hesitationTimes.push(hesitationTime);
        this.behavioralData.challengeData.push({
            type: this.challenges[this.currentChallengeIndex].type,
            reactionTime,
            hesitationTime,
            accurate,
            mouseMovementCount: this.behavioralData.mouseMovements.length
        });
        
        this.stopMouseTracking();
        this.challenges[this.currentChallengeIndex].completed = true;
        this.currentChallengeIndex++;
        
        // Short delay before next challenge
        setTimeout(() => {
            this.startChallenge();
        }, 500);
    }

    // Process results with ML
    async processResults() {
        this.showScreen('processing');
        
        // Extract features
        document.getElementById('processingStatus').textContent = 'Extracting behavioral features...';
        await this.sleep(800);
        
        const features = this.extractFeatures();
        this.displayFeatures(features);
        
        document.getElementById('processingStatus').textContent = 'Running ML inference...';
        await this.sleep(1000);
        
        // Call ML backend
        try {
            const response = await fetch('http://localhost:5000/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    features: features
                })
            });
            
            const result = await response.json();
            this.showResults(result);
        } catch (error) {
            console.error('Error calling ML backend:', error);
            // Fallback to demo mode if backend is not running
            this.showDemoResults(features);
        }
    }

    // Extract behavioral features
    extractFeatures() {
        const features = {};
        
        // Average reaction time
        features.avg_reaction_time = this.average(this.behavioralData.reactionTimes);
        
        // Reaction time variance
        features.reaction_time_variance = this.variance(this.behavioralData.reactionTimes);
        
        // Task accuracy
        features.task_accuracy = this.average(this.behavioralData.accuracies);
        
        // Average hesitation time
        features.hesitation_time = this.average(this.behavioralData.hesitationTimes);
        
        // Mouse movement analysis
        if (this.behavioralData.mouseMovements.length > 0) {
            features.cursor_path_length = this.calculatePathLength(this.behavioralData.mouseMovements);
            features.cursor_direction_changes = this.calculateDirectionChanges(this.behavioralData.mouseMovements);
            features.speed_variance = this.calculateSpeedVariance(this.behavioralData.mouseMovements);
        } else {
            features.cursor_path_length = 0;
            features.cursor_direction_changes = 0;
            features.speed_variance = 0;
        }
        
        return features;
    }

    // Display extracted features
    displayFeatures(features) {
        const display = document.getElementById('featureDisplay');
        display.innerHTML = '<h3 style="margin-bottom: 15px; color: #2c3e50;">Extracted Features:</h3>';
        
        for (const [key, value] of Object.entries(features)) {
            const item = document.createElement('div');
            item.className = 'feature-item';
            item.innerHTML = `
                <span class="feature-name">${key.replace(/_/g, ' ')}</span>
                <span class="feature-value">${typeof value === 'number' ? value.toFixed(2) : value}</span>
            `;
            display.appendChild(item);
        }
    }

    // Calculate statistics
    average(arr) {
        return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    }

    variance(arr) {
        if (arr.length === 0) return 0;
        const avg = this.average(arr);
        return this.average(arr.map(x => Math.pow(x - avg, 2)));
    }

    calculatePathLength(movements) {
        let length = 0;
        for (let i = 1; i < movements.length; i++) {
            const dx = movements[i].x - movements[i-1].x;
            const dy = movements[i].y - movements[i-1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }

    calculateDirectionChanges(movements) {
        let changes = 0;
        for (let i = 2; i < movements.length; i++) {
            const angle1 = Math.atan2(movements[i-1].y - movements[i-2].y, movements[i-1].x - movements[i-2].x);
            const angle2 = Math.atan2(movements[i].y - movements[i-1].y, movements[i].x - movements[i-1].x);
            const diff = Math.abs(angle2 - angle1);
            if (diff > Math.PI / 4) changes++;
        }
        return changes;
    }

    calculateSpeedVariance(movements) {
        const speeds = [];
        for (let i = 1; i < movements.length; i++) {
            const dx = movements[i].x - movements[i-1].x;
            const dy = movements[i].y - movements[i-1].y;
            const dt = movements[i].timestamp - movements[i-1].timestamp;
            if (dt > 0) {
                const speed = Math.sqrt(dx * dx + dy * dy) / dt;
                speeds.push(speed);
            }
        }
        return this.variance(speeds);
    }

    // Show demo results (fallback when backend is not available)
    showDemoResults(features) {
        // Simple rule-based scoring for demo
        let score = 0;
        const featureImportance = [];
        
        // Reaction time scoring
        if (features.avg_reaction_time < 2000) {
            score += 0.25;
            featureImportance.push({ name: 'avg_reaction_time', weight: 0.25, positive: true });
        } else {
            featureImportance.push({ name: 'avg_reaction_time', weight: -0.15, positive: false });
        }
        
        // Variance (humans have variance)
        if (features.reaction_time_variance > 100000) {
            score += 0.20;
            featureImportance.push({ name: 'reaction_time_variance', weight: 0.20, positive: true });
        } else {
            featureImportance.push({ name: 'reaction_time_variance', weight: -0.10, positive: false });
        }
        
        // Accuracy
        if (features.task_accuracy > 0.6) {
            score += 0.20;
            featureImportance.push({ name: 'task_accuracy', weight: 0.20, positive: true });
        } else {
            featureImportance.push({ name: 'task_accuracy', weight: -0.05, positive: false });
        }
        
        // Mouse movement entropy
        if (features.cursor_direction_changes > 5) {
            score += 0.15;
            featureImportance.push({ name: 'cursor_entropy', weight: 0.15, positive: true });
        } else {
            featureImportance.push({ name: 'cursor_entropy', weight: 0.08, positive: true });
        }
        
        // Speed variance (humans vary)
        if (features.speed_variance > 0.01) {
            score += 0.20;
            featureImportance.push({ name: 'speed_variance', weight: 0.20, positive: true });
        } else {
            featureImportance.push({ name: 'speed_variance', weight: -0.08, positive: false });
        }
        
        score = Math.max(0.3, Math.min(1.0, score));
        
        const result = {
            confidence: score,
            featureImportance: featureImportance.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
            features: features,
            sessionId: this.sessionId,
            challenges: this.challenges
        };
        
        this.showResults(result);
    }

    // Show results screen
    showResults(result) {
        this.showScreen('results');
        
        const confidence = result.confidence * 100;
        
        // Animate score
        const scoreValue = document.getElementById('scoreValue');
        const scoreCircle = document.getElementById('scoreCircle');
        const confidenceLevel = document.getElementById('confidenceLevel');
        
        let currentScore = 0;
        const increment = confidence / 30;
        const timer = setInterval(() => {
            currentScore += increment;
            if (currentScore >= confidence) {
                currentScore = confidence;
                clearInterval(timer);
            }
            scoreValue.textContent = Math.round(currentScore);
        }, 30);
        
        // Set confidence level
        let level, levelClass;
        if (confidence >= 70) {
            level = 'High Confidence - Human Present';
            levelClass = 'high';
        } else if (confidence >= 40) {
            level = 'Medium Confidence - Uncertain';
            levelClass = 'medium';
        } else {
            level = 'Low Confidence - Potential Synthetic';
            levelClass = 'low';
        }
        
        scoreCircle.className = `score-circle ${levelClass}`;
        confidenceLevel.className = `confidence-level ${levelClass}`;
        confidenceLevel.textContent = level;
        
        // Display feature importance
        this.displayFeatureImportance(result.featureImportance);
        
        // Display analysis
        this.displayAnalysis(result);
        
        // Display audit output
        this.displayAudit(result);
    }

    displayFeatureImportance(importance) {
        const container = document.getElementById('featureImportance');
        container.innerHTML = '';
        
        importance.slice(0, 5).forEach(item => {
            const div = document.createElement('div');
            div.className = 'importance-item';
            const absWeight = Math.abs(item.weight);
            const displayWeight = item.weight > 0 ? `+${item.weight.toFixed(2)}` : item.weight.toFixed(2);
            
            div.innerHTML = `
                <span class="feature-label">${item.name.replace(/_/g, ' ')}</span>
                <div class="importance-bar">
                    <div class="importance-fill" style="width: ${absWeight * 100}%"></div>
                </div>
                <span class="importance-value">${displayWeight}</span>
            `;
            container.appendChild(div);
        });
    }

    displayAnalysis(result) {
        const container = document.getElementById('analysisDetails');
        container.innerHTML = '';
        
        const analyses = [];
        
        // Generate interpretations
        if (result.features.reaction_time_variance > 100000) {
            analyses.push({ type: 'positive', text: 'Natural variance in reaction times detected' });
        } else {
            analyses.push({ type: 'negative', text: 'Overly consistent timing patterns' });
        }
        
        if (result.features.cursor_direction_changes > 5) {
            analyses.push({ type: 'positive', text: 'Human-like cursor movement entropy' });
        } else {
            analyses.push({ type: 'negative', text: 'Linear cursor paths detected' });
        }
        
        if (result.features.task_accuracy > 0.6) {
            analyses.push({ type: 'positive', text: 'Tasks completed with reasonable accuracy' });
        } else {
            analyses.push({ type: 'negative', text: 'Low task completion accuracy' });
        }
        
        if (result.features.avg_reaction_time < 2000) {
            analyses.push({ type: 'positive', text: 'Real-time interaction confirmed' });
        } else {
            analyses.push({ type: 'negative', text: 'Delayed responses detected' });
        }
        
        analyses.forEach(item => {
            const div = document.createElement('div');
            div.className = `analysis-item ${item.type}`;
            div.innerHTML = `
                <span class="icon">${item.type === 'positive' ? '✔' : '✖'}</span>
                <span class="text">${item.text}</span>
            `;
            container.appendChild(div);
        });
    }

    displayAudit(result) {
        const container = document.getElementById('auditOutput');
        const audit = {
            session_id: result.sessionId,
            timestamp: new Date().toISOString(),
            challenges_completed: this.challenges.length,
            confidence_score: (result.confidence * 100).toFixed(1) + '%',
            features: result.features,
            model_decision: result.confidence >= 0.7 ? 'Human Present' : result.confidence >= 0.4 ? 'Uncertain' : 'Potential Synthetic'
        };
        
        container.innerHTML = '';
        for (const [key, value] of Object.entries(audit)) {
            const div = document.createElement('div');
            div.className = 'audit-item';
            div.innerHTML = `<span class="audit-label">${key}:</span> ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`;
            container.appendChild(div);
        }
    }

    // Switch between screens
    showScreen(screen) {
        this.startScreen.classList.remove('active');
        this.challengeScreen.classList.remove('active');
        this.processingScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        
        if (screen === 'start') {
            this.startScreen.classList.add('active');
        } else if (screen === 'challenge') {
            this.challengeScreen.classList.add('active');
        } else if (screen === 'processing') {
            this.processingScreen.classList.add('active');
        } else if (screen === 'results') {
            this.resultsScreen.classList.add('active');
        }
    }

    // Restart verification
    restart() {
        this.sessionId = null;
        this.challenges = [];
        this.currentChallengeIndex = 0;
        this.behavioralData = {
            mouseMovements: [],
            reactionTimes: [],
            accuracies: [],
            hesitationTimes: [],
            challengeData: []
        };
        
        document.getElementById('sessionInfo').style.display = 'none';
        document.getElementById('progressFill').style.width = '0%';
        this.showScreen('start');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LiveProof();
});
