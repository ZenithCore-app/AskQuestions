// Supabase client configuration for vanilla JavaScript
// Note: In production, you should use a proper bundler like Vite or Webpack
// For now, we'll load Supabase from CDN and hardcode the config

let supabase = null;

// Initialize Supabase client
async function initSupabase() {
    if (supabase) return supabase;
    
    try {
        // Load Supabase from CDN if not available
        if (typeof window.supabase === 'undefined') {
            console.log('📦 Loading Supabase from CDN...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            document.head.appendChild(script);
            
            // Wait for script to load
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }
        
        // Initialize client
        const { createClient } = window.supabase.default || window.supabase;
        supabase = createClient(
            'https://gbprhrolxoxfqxvxcmjq.supabase.co',
            'sb_publishable_1snzCRhEluDJA6oEW21lDw_Pr4m7Za8'
        );
        
        console.log('✅ Supabase client initialized');
        return supabase;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return null;
    }
}

// Export functions that initialize Supabase when needed
export { supabase, initSupabase };

// Database operations for fingerprints
export const fingerprintOperations = {
    // Save or update fingerprint
    async saveFingerprint(fingerprintData) {
        const client = await initSupabase();
        if (!client) {
            return { data: null, error: { message: 'Failed to initialize Supabase' } };
        }
        
        const { id, shortId, userAgent, screen, platform, language, timezone } = fingerprintData;
        
        try {
            // Check if fingerprint already exists
            const { data: existing } = await client
                .from('fingerprints')
                .select('id')
                .eq('id', id)
                .single();
            
            if (existing) {
                // Update last_seen
                const { data, error } = await client
                    .from('fingerprints')
                    .update({ 
                        last_seen: new Date().toISOString(),
                        short_id: shortId 
                    })
                    .eq('id', id)
                    .select()
                    .single();
                
                return { data, error };
            } else {
                // Insert new fingerprint
                const { data, error } = await client
                    .from('fingerprints')
                    .insert({
                        id,
                        short_id: shortId,
                        user_agent: userAgent,
                        platform,
                        screen_resolution: screen,
                        language,
                        timezone,
                        created_at: new Date().toISOString(),
                        last_seen: new Date().toISOString()
                    })
                    .select()
                    .single();
                
                return { data, error };
            }
        } catch (error) {
            return { data: null, error };
        }
    },

    // Get fingerprint by short ID
    async getFingerprintByShortId(shortId) {
        const client = await initSupabase();
        if (!client) {
            return { data: null, error: { message: 'Failed to initialize Supabase' } };
        }
        
        const { data, error } = await client
            .from('fingerprints')
            .select('*')
            .eq('short_id', shortId)
            .single();
        
        return { data, error };
    }
};

// Database operations for questions
export const questionOperations = {
    // Save question
    async saveQuestion(questionText, fingerprintId, shortId) {
        const client = await initSupabase();
        if (!client) {
            return { data: null, error: { message: 'Failed to initialize Supabase' } };
        }
        
        const { data, error } = await client
            .from('questions')
            .insert({
                question_text: questionText,
                fingerprint_id: fingerprintId,
                short_id: shortId,
                status: 'submitted',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        return { data, error };
    },

    // Get questions by fingerprint
    async getQuestionsByFingerprint(fingerprintId) {
        const client = await initSupabase();
        if (!client) {
            return { data: null, error: { message: 'Failed to initialize Supabase' } };
        }
        
        const { data, error } = await client
            .from('questions')
            .select('*')
            .eq('fingerprint_id', fingerprintId)
            .order('created_at', { ascending: false });
        
        return { data, error };
    },

    // Get question by short ID
    async getQuestionByShortId(shortId) {
        const client = await initSupabase();
        if (!client) {
            return { data: null, error: { message: 'Failed to initialize Supabase' } };
        }
        
        const { data, error } = await client
            .from('questions')
            .select(`
                *,
                fingerprints (
                    short_id,
                    platform,
                    screen_resolution,
                    language,
                    timezone
                )
            `)
            .eq('short_id', shortId)
            .single();
        
        return { data, error };
    }
};

// Database operations for answers
export const answerOperations = {
    // Save answer
    async saveAnswer(questionId, answerText, responderInfo) {
        const client = await initSupabase();
        if (!client) {
            return { data: null, error: { message: 'Failed to initialize Supabase' } };
        }
        
        const { data, error } = await client
            .from('answers')
            .insert({
                question_id: questionId,
                answer_text: answerText,
                responder_info: responderInfo,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (!error) {
            // Update question status to answered
            await client
                .from('questions')
                .update({ status: 'answered' })
                .eq('id', questionId);
        }
        
        return { data, error };
    },

    // Get answers for a question
    async getAnswersForQuestion(questionId) {
        const client = await initSupabase();
        if (!client) {
            return { data: null, error: { message: 'Failed to initialize Supabase' } };
        }
        
        const { data, error } = await client
            .from('answers')
            .select('*')
            .eq('question_id', questionId)
            .order('created_at', { ascending: true });
        
        return { data, error };
    }
};
