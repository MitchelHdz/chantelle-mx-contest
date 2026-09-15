-- Rename the campaign identifier while preserving every related intent,
-- participation, and outbox record through the existing ON UPDATE CASCADE FKs.
update public.campaigns
set slug = 'chantelle-te-lleva-a-paris'
where slug = 'chantelle-vive-paris';
