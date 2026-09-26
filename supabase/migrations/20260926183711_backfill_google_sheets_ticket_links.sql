-- Re-enqueue existing participations so Google Sheets receives the new secure
-- ticket audit link. Future participations already enqueue a created event.
insert into public.integration_outbox (participation_id, event_type)
select participation.id, 'participation.updated'
from public.participations as participation
where participation.receipt_file_key is not null;
