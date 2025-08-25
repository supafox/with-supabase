-- =====================================================
-- Initial Database Schema Setup
-- Extends Supabase auth.users with profiles and avatars
-- Includes RLS, automatic timestamp management, and storage policies
-- =====================================================

-- =====================================================
-- Profiles Table
-- =====================================================

-- Create the main profiles table to store user information
-- This table extends the auth.users table with additional profile data
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique,
    username text,
    full_name text,
    avatar_url text,
    updated_at timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now()
);

-- Enable Row Level Security (RLS) for the profiles table
alter table public.profiles enable row level security;

-- Create covering index for the primary key (referenced in RLS policies)
create index if not exists idx_profiles_id_covering 
  on public.profiles (id) include (email, username, full_name, avatar_url, updated_at, created_at);

-- RLS Policy: Users can only view their own profile data
create policy "Users can view their own profile."
  on public.profiles
  for select
  using ((select auth.uid()) = id);

-- RLS Policy: Users can only update their own profile data
create policy "Users can update their own profile."
  on public.profiles
  for update
  using ((select auth.uid()) = id);

-- =====================================================
-- Username Constraints & Case-Insensitive Uniqueness
-- =====================================================

-- Ensure usernames are lowercase and letters-only (nullable allowed)
alter table public.profiles
  add constraint username_is_lowercase check (username is null or username = lower(username)),
  add constraint username_letters_only check (username is null or username ~ '^[a-z]+$');

-- Case-insensitive uniqueness index
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- =====================================================
-- Automatic Timestamp Management
-- =====================================================

-- Function: Automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger: Run handle_updated_at() before each update
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- =====================================================
-- Authentication Integration
-- =====================================================

-- Function: Sync email changes from auth.users → profiles
create or replace function public.handle_user_email_updated()
returns trigger as $$
begin
  update public.profiles
     set email = new.email
   where id = new.id;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger: Run handle_user_email_updated() after auth.users email update
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_updated();

-- Function: Create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger: Run handle_new_user() after new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- File Storage Configuration
-- =====================================================

-- Create storage bucket for user avatar images
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- =====================================================
-- Storage Access Policies
-- =====================================================

-- Policy: Allow public read access to avatar images
create policy "Anyone can view avatar images." 
  on storage.objects for select 
  using (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar images
create policy "Users can upload their own avatar." 
  on storage.objects for insert 
  with check (bucket_id = 'avatars' and (select auth.uid()) = owner);

-- Policy: Users can update their own avatar images
create policy "Users can update their own avatar."
  on storage.objects for update
  using (bucket_id = 'avatars' and (select auth.uid()) = owner);

-- Policy: Users can delete their own avatar images
create policy "Users can delete their own avatar." 
  on storage.objects for delete 
  using (bucket_id = 'avatars' and (select auth.uid()) = owner);