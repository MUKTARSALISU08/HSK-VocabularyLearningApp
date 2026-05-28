import { supabase } from '../utils/supabase';
export const authService = {
    async signup(email, password, username) {
        // Check if user already exists in profiles table
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', email)
            .maybeSingle();
        if (existingProfile) {
            throw new Error('User already exists with this email');
        }
        // Create new user in Supabase Auth (trigger will auto-create profile)
        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });
        if (authError) {
            // Handle rate limiting error
            if (authError.message.includes('request this after')) {
                throw new Error('Too many signup attempts. Please try again later.');
            }
            throw new Error(`Failed to create account: ${authError.message}`);
        }
        // Wait for user to be available (handle async user creation)
        let userId = authUser.user?.id || null;
        let userCheckAttempts = 0;
        while (!userId && userCheckAttempts < 5) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const { data: sessionData } = await supabase.auth.getSession();
            userId = sessionData?.session?.user.id || null;
            userCheckAttempts++;
        }
        if (!userId) {
            throw new Error('Failed to create user');
        }
        // Automatically confirm email to allow immediate login
        const { error: confirmError } = await supabase.auth.admin.updateUserById(userId, {
            email_confirm: true,
        });
        if (confirmError) {
            throw new Error(`Failed to confirm email: ${confirmError.message}`);
        }
        // Wait for trigger to create profile, then fetch it
        let profile = null;
        let attempts = 0;
        const maxAttempts = 10;
        while (!profile && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            const { data: fetchedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            profile = fetchedProfile || null;
            attempts++;
        }
        if (!profile) {
            await supabase.auth.admin.deleteUser(userId);
            throw new Error('Failed to create profile');
        }
        // Update profile with username (trigger creates empty profile)
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ username })
            .eq('user_id', userId)
            .select()
            .single();
        if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`);
        }
        // Get Supabase session
        const { data: session } = await supabase.auth.getSession();
        return {
            user: { id: userId, email },
            profile: updatedProfile,
            token: session?.session?.access_token
        };
    },
    async login(email, password) {
        let authData = await supabase.auth.signInWithPassword({ email, password });
        // Handle email not confirmed error
        if (authData.error && authData.error.message.includes('Email not confirmed')) {
            const { data: users } = await supabase.auth.admin.listUsers();
            const existingUser = users?.users.find(u => u.email === email);
            if (existingUser) {
                // Auto-confirm the email
                await supabase.auth.admin.updateUserById(existingUser.id, {
                    email_confirm: true,
                });
                // Retry login after confirmation
                authData = await supabase.auth.signInWithPassword({ email, password });
            }
        }
        // Check for errors after retry
        if (authData.error) {
            throw new Error(`Invalid email or password: ${authData.error.message}`);
        }
        const userId = authData.data.user.id;
        const token = authData.data.session?.access_token;
        // Get profile from Supabase
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (profileError || !profile) {
            throw new Error('Profile not found');
        }
        return {
            user: { id: userId, email: authData.data.user.email, ...profile },
            token
        };
    },
    async verifyToken(token) {
        // Verify token using Supabase Auth
        const { data: user, error } = await supabase.auth.getUser(token);
        if (error || !user.user) {
            throw new Error('Invalid token');
        }
        const userId = user.user.id;
        // Get profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (profileError || !profile) {
            throw new Error('Profile not found');
        }
        return { user: { id: userId, email: user.user.email, ...profile } };
    },
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
        return { message: 'Logout successful' };
    },
    async forgotPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            throw new Error(`Failed to send reset email: ${error.message}`);
        }
        return { message: 'Password reset email sent' };
    },
    async resetPassword(token, newPassword) {
        // Verify token first
        try {
            const { data: user } = await supabase.auth.getUser(token);
            if (!user.user) {
                throw new Error('Invalid token');
            }
            // Update password
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) {
                throw new Error(error.message);
            }
            return { message: 'Password reset successful' };
        }
        catch {
            throw new Error('Invalid or expired token');
        }
    },
    async changePassword(userId, currentPassword, newPassword) {
        // Get user email first
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (!userData.user?.email) {
            throw new Error('User not found');
        }
        // Verify current password by signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userData.user.email,
            password: currentPassword,
        });
        if (signInError) {
            throw new Error('Current password is incorrect');
        }
        // Update password
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (error) {
            throw new Error(error.message);
        }
        return { message: 'Password changed successfully' };
    },
    async uploadAvatar(userId, avatarBase64) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarBase64 })
            .eq('user_id', userId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update avatar: ${error.message}`);
        }
        return { data, error: null };
    },
    async getProfile(userId) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error || !profile) {
            throw new Error('Profile not found');
        }
        const { data: user } = await supabase.auth.admin.getUserById(userId);
        return {
            user: {
                id: userId,
                email: user.user?.email || '',
                ...profile,
            },
        };
    },
};
