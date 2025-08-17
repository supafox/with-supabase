-- =====================================================
-- Initial Database Schema Setup
-- This migration creates the core user profile system
-- with authentication integration and file storage
-- =====================================================

-- Create the main profiles table to store user information
-- This table extends the auth.users table with additional profile data
create table profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique,
    username text,
    full_name text,
    avatar_url text,
    updated_at timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now()
);

-- Enable Row Level Security (RLS) for the profiles table
-- This ensures users can only access their own profile data
alter table profiles enable row level security;

-- Policy: Users can only view their own profile data
create policy "Users can view their own profile data." on profiles for select using (
    id = (select auth.uid())
    );

-- Policy: Users can only update their own profile data
create policy "Users can update their own profile data." on profiles
for update
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- =====================================================
-- Username Constraints and Case-Insensitive Uniqueness
-- =====================================================

-- Ensure usernames are lowercase and letters-only (nullable allowed)
alter table public.profiles
  add constraint username_is_lowercase check (username is null or username = lower(username)),
  add constraint username_letters_only check (username is null or username ~ '^[a-z]+$');

-- Case-insensitive uniqueness
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- =====================================================
-- Automatic Timestamp Management
-- =====================================================

-- Function to automatically update the updated_at timestamp
-- This ensures the updated_at field is always current when records are modified
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger to automatically call handle_updated_at() before each profile update
-- This maintains data integrity by ensuring updated_at is always current
create trigger on_profiles_updated
    before update on profiles
    for each row execute function public.handle_updated_at();

-- =====================================================
-- Authentication Integration Functions
-- =====================================================

-- Function to sync email changes from auth.users to profiles table
-- This ensures profile email stays in sync when users change their auth email
create or replace function public.handle_user_email_updated()
returns trigger as $$
begin
  update public.profiles
     set email = new.email
   where id = new.id;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger to automatically sync email changes from auth.users to profiles
-- Fires after email updates in the auth.users table
create trigger on_auth_user_updated
after update of email on auth.users
for each row execute function public.handle_user_email_updated();

-- Function to automatically create a profile when a new user signs up
-- This ensures every authenticated user has a corresponding profile record
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger to automatically create profile on new user registration
-- Fires after insert into auth.users table
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =====================================================
-- File Storage Configuration
-- =====================================================

-- Create storage bucket for user avatar images
-- This bucket will store all user profile pictures
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- =====================================================
-- Storage Access Policies
-- =====================================================

-- Policy: Allow public read access to avatar images
-- Anyone can view avatar images (useful for displaying user profiles)
create policy "Anyone can view avatar images." on storage.objects for select using (
    bucket_id = 'avatars'
);

-- Policy: Users can upload their own avatar images
-- Users must be authenticated and can only upload to their own ownership
create policy "Users can upload their own avatar images." on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.uid() = owner
);

-- Policy: Users can update their own avatar images
-- Users can modify their own avatar files
create policy "Users can update their own avatar images."
on storage.objects
for update
using (
    bucket_id = 'avatars' and auth.uid() = owner
) with check (
    bucket_id = 'avatars' and auth.uid() = owner
);

-- Policy: Users can delete their own avatar images
-- Users can remove their own avatar files
create policy "Users can delete their own avatar images." on storage.objects for delete using (
    bucket_id = 'avatars' and auth.uid() = owner
);