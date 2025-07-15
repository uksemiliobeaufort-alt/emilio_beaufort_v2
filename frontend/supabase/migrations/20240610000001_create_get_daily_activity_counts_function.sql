-- Drop the function if it exists to avoid return type conflicts
DROP FUNCTION IF EXISTS get_daily_activity_counts(date, date);

-- Create or replace function to get daily activity event counts
create or replace function get_daily_activity_counts(
  start_date date,
  end_date date
)
returns table(date date, count integer)
language sql
as $$
  select
    d::date as date,
    count(e.id) as count
  from
    generate_series(start_date, end_date, interval '1 day') d
    left join activity_events e
      on date(e.created_at) = d::date
  group by d
  order by d
$$; 