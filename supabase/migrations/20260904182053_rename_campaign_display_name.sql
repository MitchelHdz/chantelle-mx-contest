-- Keep the stable slug used by the registration flow; update only the public name.
update public.campaigns
set
  name = 'Chantelle te lleva a París',
  updated_at = now()
where slug = 'chantelle-vive-paris';
