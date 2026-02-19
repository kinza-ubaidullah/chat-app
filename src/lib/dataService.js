import { supabase } from './supabase';

/**
 * Fetches all blogs from the 'blogs' table.
 * Handles null values and array columns (tags, categories) safely.
 */
export const fetchBlogs = async () => {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map through data to ensure null/array safety
        return (data || []).map(blog => ({
            ...blog,
            title: blog.title || 'Untitled',
            content: blog.content || '',
            image_url: blog.image_url || null,
            // Ensure array columns are always arrays
            tags: Array.isArray(blog.tags) ? blog.tags : [],
            categories: Array.isArray(blog.categories) ? blog.categories : [],
            author: blog.author || 'Admin',
            published_at: blog.published_at || blog.created_at || null,
        }));
    } catch (error) {
        console.error('DataService - fetchBlogs error:', error.message);
        return [];
    }
};

/**
 * Fetches chat history. 
 * Can be filtered by userId or advisorId if needed.
 */
export const fetchChatHistory = async (userId = null, advisorId = null, sinceTime = null) => {
    try {
        let query = supabase.from('chat_history').select('*');

        if (userId) {
            query = query.eq('user_id', userId);
        }

        if (advisorId) {
            query = query.eq('advisor_id', advisorId);
        }

        if (sinceTime) {
            query = query.gt('created_at', sinceTime);
        }

        const { data, error } = await query
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) throw error;

        return (data || []).map(msg => ({
            ...msg,
            content: msg.content || '',
            role: msg.role || 'user',
            metadata: msg.metadata || {}, // Safe object handling
            created_at: msg.created_at || new Date().toISOString()
        }));
    } catch (error) {
        console.error('DataService - fetchChatHistory error:', error.message);
        return [];
    }
};

/**
 * Fetches plan settings/details from 'plan_settings' table.
 * Specifically handles the features array and pricing logic.
 */
export const fetchPlanSettings = async () => {
    try {
        const { data, error } = await supabase
            .from('plan_settings')
            .select('*')
            .order('price', { ascending: true });

        if (error) throw error;

        return (data || []).map(plan => ({
            ...plan,
            name: plan.name || 'Basic Plan',
            price: plan.price ?? 0,
            currency: plan.currency || '$',
            // Ensure features is a safe array
            features: Array.isArray(plan.features) ? plan.features : [],
            // Ensure limits is a safe object
            limits: typeof plan.limits === 'object' && plan.limits !== null ? plan.limits : {},
            is_active: plan.is_active ?? true
        }));
    } catch (error) {
        console.error('DataService - fetchPlanSettings error:', error.message);
        return [];
    }
};

/**
 * Generic function to sync any table from Supabase
 * Use this as a utility for dynamic fetching
 */
export const syncTable = async (tableName) => {
    try {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error(`DataService - syncTable (${tableName}) error:`, error.message);
        return [];
    }
};

/**
 * Fetches all advisors from the 'advisors' table.
 */
export const fetchAdvisors = async () => {
    try {
        const { data, error } = await supabase
            .from('advisors')
            .select('*')
            .order('id');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('DataService - fetchAdvisors error:', error.message);
        return [];
    }
};

/**
 * Fetches a system setting by key name.
 */
export const fetchSystemSetting = async (keyName) => {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('key_value')
            .eq('key_name', keyName)
            .maybeSingle();
        if (error) throw error;
        return data?.key_value || null;
    } catch (error) {
        console.error(`DataService - fetchSystemSetting (${keyName}) error:`, error.message);
        return null;
    }
};

/**
 * Fetches user usage data for a specific user ID.
 */
export const fetchUserUsage = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_usage')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) throw error;
        return data || null;
    } catch (error) {
        console.error('DataService - fetchUserUsage error:', error.message);
        return null;
    }
};

/**
 * Updates user usage data.
 */
export const updateUserUsage = async (userId, updates) => {
    try {
        const { data, error } = await supabase
            .from('user_usage')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .select()
            .maybeSingle();
        if (error) throw error;
        return data || null;
    } catch (error) {
        console.error('DataService - updateUserUsage error:', error.message);
        return null;
    }
};
