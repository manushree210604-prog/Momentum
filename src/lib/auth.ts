import { supabase, AuthUser } from './supabase';

// ── Validation helpers ────────────────────────────────────────────────────────

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'EMAIL IS REQUIRED';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'INVALID EMAIL FORMAT';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'ACCESS KEY IS REQUIRED';
  if (password.length < 8) return 'MINIMUM 8 CHARACTERS REQUIRED';
  if (!/\d/.test(password)) return 'MUST CONTAIN AT LEAST 1 NUMBER';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'MUST CONTAIN AT LEAST 1 SPECIAL CHARACTER';
  return null;
}

export function validateDisplayName(name: string): string | null {
  if (!name.trim()) return 'CALL SIGN IS REQUIRED';
  if (name.trim().length < 2) return 'CALL SIGN TOO SHORT (MIN 2 CHARS)';
  if (name.trim().length > 32) return 'CALL SIGN TOO LONG (MAX 32 CHARS)';
  return null;
}

// ── Auth API ─────────────────────────────────────────────────────────────────

export async function apiRegister(
  email: string,
  password: string,
  display_name: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  // 1. Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: { display_name: display_name.trim() }, // stored in auth.users.raw_user_meta_data
    },
  });

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
      return { user: null, error: 'EMAIL ALREADY REGISTERED' };
    }
    return { user: null, error: authError.message.toUpperCase() };
  }

  if (!authData.user) {
    return { user: null, error: 'REGISTRATION FAILED — TRY AGAIN' };
  }

  // 2. Insert into public.profiles table
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email: email.toLowerCase().trim(),
    display_name: display_name.trim(),
    last_login: new Date().toISOString(),
  });

  if (profileError) {
    // Profile may have been auto-created by trigger; try upsert
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      email: email.toLowerCase().trim(),
      display_name: display_name.trim(),
      last_login: new Date().toISOString(),
    });
  }

  const user: AuthUser = {
    id: authData.user.id,
    email: authData.user.email!,
    display_name: display_name.trim(),
    created_at: authData.user.created_at,
    last_login: new Date().toISOString(),
  };

  return { user, error: null };
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });

  if (authError) {
    // Always generic — never reveal if email/password is the problem
    return { user: null, error: 'INVALID CREDENTIALS' };
  }

  if (!authData.user) {
    return { user: null, error: 'INVALID CREDENTIALS' };
  }

  // Update last_login
  await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', authData.user.id);

  // Fetch full profile with display_name
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  const display_name =
    profile?.display_name ||
    authData.user.user_metadata?.display_name ||
    authData.user.email!.split('@')[0];

  const user: AuthUser = {
    id: authData.user.id,
    email: authData.user.email!,
    display_name,
    created_at: authData.user.created_at,
    last_login: new Date().toISOString(),
  };

  return { user, error: null };
}

export async function apiGetMe(): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    return { user: null, error: 'NO_SESSION' };
  }

  const authUser = sessionData.session.user;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profileError || !profile) {
    // Fallback to auth metadata
    const user: AuthUser = {
      id: authUser.id,
      email: authUser.email!,
      display_name: authUser.user_metadata?.display_name || authUser.email!.split('@')[0],
      created_at: authUser.created_at,
      last_login: new Date().toISOString(),
    };
    return { user, error: null };
  }

  const user: AuthUser = {
    id: profile.id,
    email: profile.email,
    display_name: profile.display_name,
    created_at: profile.created_at,
    last_login: profile.last_login,
  };

  return { user, error: null };
}

export async function apiLogout(): Promise<void> {
  await supabase.auth.signOut();
}
