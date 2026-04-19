drop policy if exists "Admin can delete reviews" on public.reviews;

create policy "Admin can delete reviews"
on public.reviews
for delete
to authenticated
using (
  auth.jwt() ->> 'email' = 'admin@dorm.local'
);
