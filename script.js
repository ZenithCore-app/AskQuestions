// Import Supabase client and operations
let fingerprintOperations = null;
let questionOperations = null;

// Load Supabase operations dynamically
async function loadSupabaseOperations() {
    try {
        const module = await import('./supabase-client.js');
        fingerprintOperations = module.fingerprintOperations;
        questionOperations = module.questionOperations;
        console.log('✅ Supabase operations loaded successfully');
    } catch (error) {
        console.error('❌ Failed to load Supabase operations:', error);
        // Fallback to Discord-only mode
        fingerprintOperations = {
            saveFingerprint: async () => ({ data: null, error: null })
        };
        questionOperations = {
            saveQuestion: async () => ({ data: { id: 'fallback-' + Date.now() }, error: null })
        };
    }
}

// DOM Elements
const questionInput = document.getElementById('questionInput');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const confirmationSection = document.getElementById('confirmation');
const askAnotherBtn = document.getElementById('askAnotherBtn');

// Discord Webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1503863711620661248/D2Ue8RdMe5SqtcVJlDv6-9gpA8Uq-XYL67Gf7YfxvcEKFrQMyh-3sPnnUOnRQqDn0lyd';

// Fingerprinting System
class FingerprintGenerator {
    constructor() {
        this.fingerprint = null;
    }

    // Generate unique browser fingerprint
    generateFingerprint() {
        // Check if fingerprint already exists in localStorage
        const storedFingerprint = localStorage.getItem('userFingerprint');
        if (storedFingerprint) {
            this.fingerprint = storedFingerprint;
            return this.fingerprint;
        }

        // Collect browser characteristics
        const components = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages?.join(',') || '',
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || '',
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            sessionStorage: !!sessionStorage.length,
            localStorage: !!localStorage.length,
            indexedDb: !!window.indexedDB,
            webgl: this.getWebGLFingerprint(),
            canvas: this.getCanvasFingerprint()
        };

        // Generate hash from components
        this.fingerprint = this.hashString(JSON.stringify(components));
        
        // Store in localStorage for persistence
        localStorage.setItem('userFingerprint', this.fingerprint);
        
        return this.fingerprint;
    }

    // Get WebGL fingerprint
    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'no-webgl';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return `${gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)}|${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`;
            }
            return 'webgl-no-debug';
        } catch (e) {
            return 'webgl-error';
        }
    }

    // Get canvas fingerprint
    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Fingerprint text 🌟', 2, 2);
            return canvas.toDataURL().slice(-50);
        } catch (e) {
            return 'canvas-error';
        }
    }

    // Simple hash function
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    // Get detailed fingerprint info for Discord
    getFingerprintInfo() {
        if (!this.fingerprint) {
            this.generateFingerprint();
        }

        return {
            id: this.fingerprint,
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
        };
    }
}

// Short ID Converter System
class ShortIDConverter {
    constructor() {
        this.adjectives = [
            'happy', 'brave', 'clever', 'swift', 'bright', 'calm', 'bold', 'kind',
            'wise', 'cool', 'warm', 'fresh', 'pure', 'just', 'true', 'free',
            'deep', 'high', 'wide', 'long', 'rich', 'soft', 'light', 'dark'
        ];
        this.nouns = [
            'eagle', 'tiger', 'lion', 'wolf', 'bear', 'fox', 'hawk', 'owl',
            'star', 'moon', 'sun', 'cloud', 'wave', 'wind', 'fire', 'stone',
            'river', 'mountain', 'forest', 'ocean', 'desert', 'valley', 'peak', 'dawn'
        ];
        this.cache = new Map();
    }

    // Convert long fingerprint to short ID
    toShortID(longFingerprint) {
        // Check cache first
        if (this.cache.has(longFingerprint)) {
            return this.cache.get(longFingerprint);
        }

        // Convert hex fingerprint to number
        const num = parseInt(longFingerprint, 16);
        
        // Generate components
        const adjectiveIndex = num % this.adjectives.length;
        const nounIndex = Math.floor(num / this.nouns.length) % this.nouns.length;
        const number = (num % 999) + 1;
        
        // Create short ID
        const shortID = `${this.adjectives[adjectiveIndex]}-${this.nouns[nounIndex]}-${number}`;
        
        // Cache the result
        this.cache.set(longFingerprint, shortID);
        
        return shortID;
    }

    // Convert short ID back to long fingerprint (for lookup)
    toLongFingerprint(shortID) {
        // Find in cache first
        for (const [longFingerprint, cachedShortID] of this.cache.entries()) {
            if (cachedShortID === shortID) {
                return longFingerprint;
            }
        }
        
        // Parse short ID components
        const parts = shortID.split('-');
        if (parts.length !== 3) return null;
        
        const [adjective, noun, numberStr] = parts;
        const number = parseInt(numberStr);
        
        // Find indices
        const adjectiveIndex = this.adjectives.indexOf(adjective);
        const nounIndex = this.nouns.indexOf(noun);
        
        if (adjectiveIndex === -1 || nounIndex === -1 || isNaN(number)) {
            return null;
        }
        
        // This is approximate - exact reverse is complex due to modulo operations
        // In practice, you'd store the mapping in a database
        return null;
    }

    // Generate a unique short ID without relying on fingerprint
    generateUniqueID() {
        const timestamp = Date.now();
        const random = Math.random();
        const combined = timestamp + random;
        
        const adjectiveIndex = Math.floor(combined * this.adjectives.length) % this.adjectives.length;
        const nounIndex = Math.floor(combined * this.nouns.length * 7) % this.nouns.length;
        const number = Math.floor(combined * 999) % 999 + 1;
        
        return `${this.adjectives[adjectiveIndex]}-${this.nouns[nounIndex]}-${number}`;
    }

    // Validate short ID format
    isValidShortID(shortID) {
        const parts = shortID.split('-');
        if (parts.length !== 3) return false;
        
        const [adjective, noun, numberStr] = parts;
        const number = parseInt(numberStr);
        
        return this.adjectives.includes(adjective) && 
               this.nouns.includes(noun) && 
               !isNaN(number) && 
               number >= 1 && 
               number <= 999;
    }
}

// Initialize fingerprint generator and short ID converter
const fingerprintGenerator = new FingerprintGenerator();
const shortIDConverter = new ShortIDConverter();


// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing application...');
    
    // Load Supabase operations
    await loadSupabaseOperations();
    
    // Generate fingerprint immediately when page loads
    fingerprintGenerator.generateFingerprint();
    console.log('🔍 Fingerprint generated:', fingerprintGenerator.fingerprint);
    
    // Setup event listeners
    setupEventListeners();
    console.log('👂 Event listeners setup complete');
    
    animateOnScroll();
    console.log('✅ Application initialized successfully');
});

// Setup Event Listeners
function setupEventListeners() {
    // Question submission functionality
    submitBtn.addEventListener('click', submitQuestion);
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitQuestion();
        }
    });

    // Clear button
    clearBtn.addEventListener('click', clearQuestion);
    questionInput.addEventListener('input', toggleClearButton);

    // Ask another question button
    askAnotherBtn.addEventListener('click', askAnotherQuestion);

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Question submission functionality
async function submitQuestion() {
    console.log('📝 Submit question function called');
    
    const question = questionInput.value.trim();
    console.log('❓ Question text:', question);
    
    if (!question) {
        console.log('⚠️ No question entered');
        showNotification('Please enter a question');
        return;
    }

    if (question.length < 10) {
        console.log('⚠️ Question too short');
        showNotification('Please provide more details in your question');
        return;
    }

    console.log('✅ Question validation passed');
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    console.log('🔄 Loading state set');

    try {
        console.log('🔄 Starting submission process...');
        
        // Generate fingerprint and short ID
        const fingerprintInfo = fingerprintGenerator.getFingerprintInfo();
        const shortID = shortIDConverter.toShortID(fingerprintInfo.id);
        console.log('🔍 Generated fingerprint:', fingerprintInfo.id, '→ Short ID:', shortID);
        
        // Save fingerprint to database
        console.log('💾 Saving fingerprint to database...');
        const { data: fingerprintData, error: fingerprintError } = await fingerprintOperations.saveFingerprint({
            id: fingerprintInfo.id,
            shortId: shortID,
            userAgent: fingerprintInfo.userAgent,
            screen: fingerprintInfo.screen,
            platform: fingerprintInfo.platform,
            language: fingerprintInfo.language,
            timezone: fingerprintInfo.timezone
        });

        if (fingerprintError) {
            console.error('❌ Error saving fingerprint:', fingerprintError);
            showNotification('Failed to save user data. Please try again.');
            return;
        }
        console.log('✅ Fingerprint saved successfully');

        // Save question to database
        console.log('💾 Saving question to database...');
        const { data: questionData, error: questionError } = await questionOperations.saveQuestion(
            question,
            fingerprintInfo.id,
            shortID
        );

        if (questionError) {
            console.error('❌ Error saving question:', questionError);
            showNotification('Failed to save question. Please try again.');
            return;
        }
        console.log('✅ Question saved successfully, ID:', questionData.id);

        // Send to Discord webhook
        console.log('📤 Sending to Discord...');
        const discordSuccess = await sendToDiscord(question, questionData.id);
        
        if (discordSuccess) {
            console.log('✅ Discord notification sent');
            // Show confirmation with database info
            showConfirmation(shortID, questionData.id);
            clearQuestion();
        } else {
            console.log('⚠️ Discord failed but database saved');
            showNotification('Question saved to database but Discord notification failed. Your question was still submitted successfully.');
            showConfirmation(shortID, questionData.id);
        }
    } catch (error) {
        console.error('❌ Error submitting question:', error);
        showNotification('An error occurred. Please try again later.');
    } finally {
        // Reset button
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Question';
        submitBtn.disabled = false;
        console.log('🔄 Button state reset');
    }
}

// Send question to Discord webhook
async function sendToDiscord(question, questionId) {
    const timestamp = new Date().toISOString();
    const fingerprintInfo = fingerprintGenerator.getFingerprintInfo();
    const shortID = shortIDConverter.toShortID(fingerprintInfo.id);
    
    const payload = {
        embeds: [{
            title: "📝 New Question Submitted",
            description: question,
            color: 0x667eea,
            fields: [
                {
                    name: "🕐 Submitted At",
                    value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                    inline: true
                },
                {
                    name: "🏷️ User ID",
                    value: `**Short ID:** \`${shortID}\`\n**Internal ID:** \`${fingerprintInfo.id}\``,
                    inline: true
                },
                {
                    name: "🗄️ Database",
                    value: `**Question ID:** \`${questionId}\`\n**Status:** Saved to Supabase`,
                    inline: false
                },
                {
                    name: "🔍 Technical Data",
                    value: `**Platform:** ${fingerprintInfo.platform}\n**Screen:** ${fingerprintInfo.screen}\n**Language:** ${fingerprintInfo.language}\n**Timezone:** ${fingerprintInfo.timezone}`,
                    inline: false
                },
                {
                    name: "📱 Device Info",
                    value: `\`\`\`${fingerprintInfo.userAgent}\`\`\``,
                    inline: false
                }
            ],
            footer: {
                text: `User ID: ${shortID} | DB ID: ${questionId}`,
                icon_url: "https://via.placeholder.com/40"
            },
            timestamp: timestamp
        }]
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        return response.ok;
    } catch (error) {
        console.error('Discord webhook error:', error);
        return false;
    }
}

// Show confirmation message
function showConfirmation(shortID, questionId) {
    const confirmationContent = confirmationSection.querySelector('.confirmation-message');
    confirmationContent.innerHTML = `
        <div class="success-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <h2>Question Submitted Successfully!</h2>
        <p>Your question has been saved to our database and sent to Discord.</p>
        <div class="confirmation-details">
            <div class="detail-item">
                <strong>Your User ID:</strong> <code>${shortID}</code>
            </div>
            <div class="detail-item">
                <strong>Question ID:</strong> <code>${questionId}</code>
            </div>
        </div>
        <button id="askAnotherBtn" class="ask-another-btn">
            <i class="fas fa-plus"></i>
            Ask Another Question
        </button>
    `;
    
    // Re-attach event listener to the new button
    const newAskAnotherBtn = document.getElementById('askAnotherBtn');
    newAskAnotherBtn.addEventListener('click', askAnotherQuestion);
    
    confirmationSection.style.display = 'block';
    confirmationSection.scrollIntoView({ behavior: 'smooth' });
}

// Ask another question
function askAnotherQuestion() {
    confirmationSection.style.display = 'none';
    questionInput.focus();
}

// Clear question
function clearQuestion() {
    questionInput.value = '';
    clearBtn.classList.remove('visible');
    questionInput.focus();
}

// Toggle clear button visibility
function toggleClearButton() {
    if (questionInput.value.trim()) {
        clearBtn.classList.add('visible');
    } else {
        clearBtn.classList.remove('visible');
    }
}


// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animate elements on scroll
function animateOnScroll() {
    // No elements to animate since features section was removed
}

// Add CSS for notification and confirmation details
const additionalCSS = `
.notification {
    position: fixed;
    top: 100px;
    right: 20px;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 2000;
    max-width: 300px;
}

.notification.show {
    transform: translateX(0);
}

.notification i {
    color: var(--primary-color);
    font-size: 1.2rem;
}

.confirmation-details {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    backdrop-filter: blur(10px);
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0.5rem 0;
    font-size: 0.9rem;
}

.detail-item code {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: #fff;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

// Test the short ID conversion system
function testShortIDConversion() {
    console.log('🧪 Testing Short ID Conversion System');
    
    // Test with sample fingerprints
    const testFingerprints = [
        'a1b2c3d4',
        '12345678',
        'abcdef01',
        'fedcba98',
        '87654321'
    ];
    
    testFingerprints.forEach(fingerprint => {
        const shortID = shortIDConverter.toShortID(fingerprint);
        console.log(`📝 ${fingerprint} → ${shortID}`);
        
        // Test validation
        const isValid = shortIDConverter.isValidShortID(shortID);
        console.log(`✅ Valid: ${isValid}`);
    });
    
    // Test unique ID generation
    console.log('\n🎲 Generating unique IDs:');
    for (let i = 0; i < 5; i++) {
        const uniqueID = shortIDConverter.generateUniqueID();
        console.log(`🆔 ${uniqueID}`);
    }
    
    // Test caching
    console.log('\n💾 Testing caching:');
    const testFp = 'test1234';
    const short1 = shortIDConverter.toShortID(testFp);
    const short2 = shortIDConverter.toShortID(testFp);
    console.log(`🔄 Cache test: ${short1 === short2 ? 'PASS' : 'FAIL'}`);
}

// Add additional CSS to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Run tests in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testShortIDConversion, 1000);
    });
}
