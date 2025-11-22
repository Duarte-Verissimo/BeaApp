-- Create a table for user reports
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  clinic_name text not null,
  contract_percentage numeric not null,
  treatments jsonb not null,
  costs jsonb not null,
  net_earnings numeric not null,
  report_email text
);

-- Create a table for user clinic settings (percentages)
create table if not exists clinic_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  clinic_name text not null,
  contract_percentage numeric not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, clinic_name)
);

-- RLS Policies
alter table reports enable row level security;
alter table clinic_settings enable row level security;

create policy "Users can view their own reports"
  on reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on reports for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own clinic settings"
  on clinic_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert/update their own clinic settings"
  on clinic_settings for all
  using (auth.uid() = user_id);
