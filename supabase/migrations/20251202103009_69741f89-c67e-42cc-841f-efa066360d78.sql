-- Allow staff to manage their own schedules
CREATE POLICY "Staff can manage their own hours"
ON public.staff_hours
FOR ALL
TO authenticated
USING (
  staff_id IN (
    SELECT id FROM public.staff WHERE profile_id = auth.uid()
  )
)
WITH CHECK (
  staff_id IN (
    SELECT id FROM public.staff WHERE profile_id = auth.uid()
  )
);

-- Allow staff to manage their own services
CREATE POLICY "Staff can manage their own services"
ON public.staff_services
FOR ALL
TO authenticated
USING (
  staff_id IN (
    SELECT id FROM public.staff WHERE profile_id = auth.uid()
  )
)
WITH CHECK (
  staff_id IN (
    SELECT id FROM public.staff WHERE profile_id = auth.uid()
  )
);