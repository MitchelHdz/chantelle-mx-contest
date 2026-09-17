-- The campaign is valid in every current El Palacio de Hierro department store.
alter table public.participations
  drop constraint participations_store_code_check,
  add constraint participations_store_code_check check (
    store_code in (
      'centro',
      'coyoacan',
      'durango',
      'guadalajara',
      'interlomas',
      'leon',
      'monterrey',
      'nuevo-coyoacan',
      'perisur',
      'polanco',
      'puebla',
      'queretaro',
      'santa-fe',
      'satelite',
      'veracruz',
      'villahermosa'
    )
  );
