begin;
create table cookpath_private.evidence_settings (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false
);
insert into cookpath_private.evidence_settings values(true,false);
create table cookpath_private.task_evidence_catalog (
  task_id integer primary key check(task_id between 1 and 150),
  kind text not null check(kind in ('none','photo','video'))
);
insert into cookpath_private.task_evidence_catalog(task_id,kind) values
(1,'photo'),
(2,'photo'),
(3,'photo'),
(4,'video'),
(5,'photo'),
(6,'photo'),
(7,'photo'),
(8,'photo'),
(9,'photo'),
(10,'photo'),
(11,'photo'),
(12,'photo'),
(13,'photo'),
(14,'photo'),
(15,'photo'),
(16,'photo'),
(17,'photo'),
(18,'photo'),
(19,'photo'),
(20,'photo'),
(21,'none'),
(22,'none'),
(23,'none'),
(24,'none'),
(25,'photo'),
(26,'none'),
(27,'none'),
(28,'photo'),
(29,'photo'),
(30,'photo'),
(31,'photo'),
(32,'photo'),
(33,'photo'),
(34,'photo'),
(35,'photo'),
(36,'photo'),
(37,'photo'),
(38,'photo'),
(39,'photo'),
(40,'photo'),
(41,'photo'),
(42,'none'),
(43,'photo'),
(44,'photo'),
(45,'photo'),
(46,'none'),
(47,'photo'),
(48,'none'),
(49,'photo'),
(50,'photo'),
(51,'photo'),
(52,'none'),
(53,'none'),
(54,'photo'),
(55,'none'),
(56,'photo'),
(57,'photo'),
(58,'none'),
(59,'photo'),
(60,'none'),
(61,'photo'),
(62,'photo'),
(63,'photo'),
(64,'none'),
(65,'photo'),
(66,'photo'),
(67,'photo'),
(68,'photo'),
(69,'photo'),
(70,'photo'),
(71,'photo'),
(72,'video'),
(73,'photo'),
(74,'photo'),
(75,'none'),
(76,'photo'),
(77,'photo'),
(78,'photo'),
(79,'photo'),
(80,'none'),
(81,'photo'),
(82,'photo'),
(83,'photo'),
(84,'none'),
(85,'photo'),
(86,'none'),
(87,'photo'),
(88,'photo'),
(89,'none'),
(90,'photo'),
(91,'photo'),
(92,'photo'),
(93,'none'),
(94,'none'),
(95,'none'),
(96,'photo'),
(97,'photo'),
(98,'none'),
(99,'none'),
(100,'photo'),
(101,'photo'),
(102,'photo'),
(103,'none'),
(104,'photo'),
(105,'photo'),
(106,'photo'),
(107,'photo'),
(108,'photo'),
(109,'photo'),
(110,'photo'),
(111,'photo'),
(112,'photo'),
(113,'photo'),
(114,'photo'),
(115,'photo'),
(116,'photo'),
(117,'photo'),
(118,'photo'),
(119,'none'),
(120,'photo'),
(121,'none'),
(122,'none'),
(123,'photo'),
(124,'photo'),
(125,'none'),
(126,'none'),
(127,'photo'),
(128,'photo'),
(129,'photo'),
(130,'photo'),
(131,'none'),
(132,'photo'),
(133,'photo'),
(134,'photo'),
(135,'none'),
(136,'photo'),
(137,'photo'),
(138,'photo'),
(139,'photo'),
(140,'none'),
(141,'none'),
(142,'none'),
(143,'photo'),
(144,'none'),
(145,'photo'),
(146,'none'),
(147,'photo'),
(148,'none'),
(149,'photo'),
(150,'photo');
alter table cookpath_private.evidence_settings enable row level security;
alter table cookpath_private.task_evidence_catalog enable row level security;
revoke all on cookpath_private.evidence_settings,cookpath_private.task_evidence_catalog from public,anon,authenticated;
create table public.cookpath_evidence_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id integer not null references cookpath_private.task_evidence_catalog(task_id),
  kind text not null check(kind in ('photo','video')),
  status text not null default 'pending' check(status in ('pending','approved','retry','error')),
  result jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index cookpath_evidence_user_task on public.cookpath_evidence_attempts(user_id,task_id,created_at desc);
create index cookpath_evidence_created on public.cookpath_evidence_attempts(created_at);
create unique index cookpath_evidence_one_pending on public.cookpath_evidence_attempts(user_id) where status='pending';
alter table public.cookpath_evidence_attempts enable row level security;
revoke all on public.cookpath_evidence_attempts from public,anon,authenticated;
grant select on public.cookpath_evidence_attempts to authenticated;
create policy "Read own evidence feedback" on public.cookpath_evidence_attempts for select to authenticated using ((select auth.uid())=user_id);

create or replace function cookpath_private.cookpath_get_progress()
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception 'Sign in required' using errcode='42501'; end if;
  return jsonb_build_object(
    'completed',coalesce((select jsonb_agg(t.task_id order by t.task_id) from public.cookpath_task_completions t where t.user_id=v_user),'[]'::jsonb),
    'qnaAnswers',coalesce((select jsonb_object_agg(a.question_id::text,jsonb_build_object('selectedIndex',a.selected_index,'correct',a.correct,'answeredAt',a.answered_at)) from public.cookpath_quiz_answers a where a.user_id=v_user),'{}'::jsonb),
    'evidenceEnabled',(select enabled from cookpath_private.evidence_settings where singleton),
    'taskReviews',coalesce((select jsonb_object_agg(r.task_id::text,jsonb_build_object('status',r.status,'feedback',r.result,'reviewedAt',r.finished_at)) from
      (select distinct on(task_id) task_id,status,result,finished_at from public.cookpath_evidence_attempts where user_id=v_user and status in ('approved','retry') order by task_id,created_at desc) r),'{}'::jsonb)
  );
end;
$$;

create or replace function cookpath_private.cookpath_complete_task(p_task_id integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if p_task_id is null or p_task_id not between 1 and 150 then raise exception 'Invalid task' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
  if exists(select 1 from public.cookpath_task_completions where user_id=v_user and task_id=p_task_id) then return cookpath_private.cookpath_get_progress(); end if;
  if not cookpath_private.challenge_available(v_user,((p_task_id-1)/5)+1) then raise exception 'Complete the previous challenge first' using errcode='42501'; end if;
  if (select enabled from cookpath_private.evidence_settings where singleton) and (select kind<>'none' from cookpath_private.task_evidence_catalog where task_id=p_task_id)
    then raise exception 'Submit practice evidence for AI review first' using errcode='42501'; end if;
  insert into public.cookpath_task_completions(user_id,task_id) values(v_user,p_task_id) on conflict do nothing;
  return cookpath_private.cookpath_get_progress();
end;
$$;

create or replace function cookpath_private.cookpath_import_progress(p_progress jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_challenge integer; v_task integer; v_question record; v_answer jsonb;
begin
  if v_user is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if p_progress is null or jsonb_typeof(p_progress)<>'object' or coalesce(jsonb_typeof(p_progress->'completed'),'')<>'array' or coalesce(jsonb_typeof(p_progress->'qnaAnswers'),'')<>'object' or pg_column_size(p_progress)>100000 then raise exception 'Invalid progress' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
  for v_challenge in 1..30 loop
    exit when not cookpath_private.challenge_available(v_user,v_challenge);
    for v_task in ((v_challenge-1)*5+1)..(v_challenge*5) loop
      if (p_progress->'completed') @> jsonb_build_array(v_task) and (
        not (select enabled from cookpath_private.evidence_settings where singleton)
        or (select kind='none' from cookpath_private.task_evidence_catalog where task_id=v_task)
        or exists(select 1 from public.cookpath_task_completions where user_id=v_user and task_id=v_task)
      ) then perform cookpath_private.cookpath_complete_task(v_task); end if;
    end loop;
    for v_question in select question_id from cookpath_private.question_catalog where challenge_no=v_challenge order by question_id loop
      v_answer:=p_progress->'qnaAnswers'->(v_question.question_id::text)->'selectedIndex';
      if v_answer is not null and v_answer::text in ('0','1','2') then perform cookpath_private.cookpath_submit_answer(v_question.question_id,(v_answer::text)::integer); end if;
    end loop;
  end loop;
  return cookpath_private.cookpath_get_progress();
end;
$$;

create function cookpath_private.cookpath_begin_evidence(p_task_id integer,p_kind text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_id uuid; v_kind text;
begin
  if v_user is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if not (select enabled from cookpath_private.evidence_settings where singleton) then raise exception 'AI review is not active yet' using errcode='55000'; end if;
  select kind into v_kind from cookpath_private.task_evidence_catalog where task_id=p_task_id;
  if v_kind is null or v_kind='none' or p_kind is distinct from v_kind then raise exception 'Incorrect evidence type' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('cookpath-evidence-daily',0));
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
  if not cookpath_private.challenge_available(v_user,((p_task_id-1)/5)+1) then raise exception 'Complete the previous challenge first' using errcode='42501'; end if;
  if exists(select 1 from public.cookpath_task_completions where user_id=v_user and task_id=p_task_id) then raise exception 'Task is already complete' using errcode='22023'; end if;
  update public.cookpath_evidence_attempts set status='error',finished_at=now() where user_id=v_user and status='pending' and created_at<now()-interval '2 minutes';
  if exists(select 1 from public.cookpath_evidence_attempts where user_id=v_user and status='pending') then raise exception 'A review is already in progress' using errcode='55000'; end if;
  if (select count(*) from public.cookpath_evidence_attempts where user_id=v_user and created_at>now()-interval '24 hours')>=30
    or (select count(*) from public.cookpath_evidence_attempts where created_at>now()-interval '24 hours')>=300 then raise exception 'Review limit reached; try again later' using errcode='54000'; end if;
  insert into public.cookpath_evidence_attempts(user_id,task_id,kind) values(v_user,p_task_id,p_kind) returning id into v_id;
  return v_id;
end;
$$;

create function cookpath_private.cookpath_finish_evidence(p_attempt_id uuid,p_user_id uuid,p_status text,p_result jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare v_attempt public.cookpath_evidence_attempts%rowtype;
begin
  if p_status is null or p_status not in ('approved','retry','error') or p_result is null or jsonb_typeof(p_result)<>'object' or pg_column_size(p_result)>12000 then raise exception 'Invalid review result' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  select * into v_attempt from public.cookpath_evidence_attempts where id=p_attempt_id and user_id=p_user_id for update;
  if not found or v_attempt.status<>'pending' or v_attempt.created_at<now()-interval '2 minutes' then raise exception 'Review is no longer pending' using errcode='22023'; end if;
  if p_status='approved' then
    if coalesce(p_result->>'clear_evidence','')<>'true' or coalesce(p_result->>'unsafe','')<>'false' or jsonb_typeof(p_result->'checks') is distinct from 'array' or jsonb_array_length(p_result->'checks')<>2
      or exists(select 1 from jsonb_array_elements(p_result->'checks') c where coalesce(c->>'met','')<>'true') then raise exception 'Review did not pass the criteria' using errcode='22023'; end if;
    if not cookpath_private.challenge_available(p_user_id,((v_attempt.task_id-1)/5)+1) then raise exception 'Challenge is locked' using errcode='42501'; end if;
    insert into public.cookpath_task_completions(user_id,task_id) values(p_user_id,v_attempt.task_id) on conflict do nothing;
  end if;
  update public.cookpath_evidence_attempts set status=p_status,result=p_result,finished_at=now() where id=p_attempt_id;
end;
$$;
revoke all on function cookpath_private.cookpath_begin_evidence(integer,text),cookpath_private.cookpath_finish_evidence(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function cookpath_private.cookpath_begin_evidence(integer,text) to authenticated;
grant usage on schema cookpath_private to service_role;
grant execute on function cookpath_private.cookpath_finish_evidence(uuid,uuid,text,jsonb) to service_role;
create function public.cookpath_begin_evidence(p_task_id integer,p_kind text) returns uuid language sql security invoker set search_path='' as $$select cookpath_private.cookpath_begin_evidence(p_task_id,p_kind);$$;
create function public.cookpath_finish_evidence(p_attempt_id uuid,p_user_id uuid,p_status text,p_result jsonb) returns void language sql security invoker set search_path='' as $$select cookpath_private.cookpath_finish_evidence(p_attempt_id,p_user_id,p_status,p_result);$$;
revoke all on function public.cookpath_begin_evidence(integer,text),public.cookpath_finish_evidence(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.cookpath_begin_evidence(integer,text) to authenticated;
grant execute on function public.cookpath_finish_evidence(uuid,uuid,text,jsonb) to service_role;
commit;
