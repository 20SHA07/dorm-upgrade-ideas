drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews"
on public.reviews
for select
to public
using (true);

drop policy if exists "Admin can delete reviews" on public.reviews;

create policy "Admin can delete reviews"
on public.reviews
for delete
to authenticated
using (
  auth.jwt() ->> 'email' = 'admin@dorm.local'
);
