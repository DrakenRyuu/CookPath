begin;

create schema cookpath_private;
revoke all on schema cookpath_private from public, anon, authenticated;

create table cookpath_private.question_catalog (
  question_id integer primary key check (question_id between 1 and 300),
  challenge_no integer not null check (challenge_no between 1 and 30),
  correct_index integer not null check (correct_index between 0 and 2)
);
create index question_catalog_challenge on cookpath_private.question_catalog (challenge_no);

insert into cookpath_private.question_catalog(question_id,challenge_no,correct_index) values
(1,1,1),
(2,1,2),
(3,1,2),
(4,1,0),
(5,1,0),
(6,1,1),
(7,1,1),
(8,1,2),
(9,1,2),
(10,1,0),
(11,2,0),
(12,2,1),
(13,2,1),
(14,2,2),
(15,2,2),
(16,2,0),
(17,2,0),
(18,2,1),
(19,2,1),
(20,2,2),
(21,3,2),
(22,3,0),
(23,3,0),
(24,3,1),
(25,3,1),
(26,3,2),
(27,3,2),
(28,3,0),
(29,3,0),
(30,3,1),
(31,4,1),
(32,4,2),
(33,4,2),
(34,4,0),
(35,4,0),
(36,4,1),
(37,4,1),
(38,4,2),
(39,4,2),
(40,4,0),
(41,5,0),
(42,5,1),
(43,5,1),
(44,5,2),
(45,5,2),
(46,5,0),
(47,5,0),
(48,5,1),
(49,5,1),
(50,5,2),
(51,6,2),
(52,6,0),
(53,6,0),
(54,6,1),
(55,6,1),
(56,6,2),
(57,6,2),
(58,6,0),
(59,6,0),
(60,6,1),
(61,7,1),
(62,7,2),
(63,7,2),
(64,7,0),
(65,7,0),
(66,7,1),
(67,7,1),
(68,7,2),
(69,7,2),
(70,7,0),
(71,8,0),
(72,8,1),
(73,8,1),
(74,8,2),
(75,8,2),
(76,8,0),
(77,8,0),
(78,8,1),
(79,8,1),
(80,8,2),
(81,9,2),
(82,9,0),
(83,9,0),
(84,9,1),
(85,9,1),
(86,9,2),
(87,9,2),
(88,9,0),
(89,9,0),
(90,9,1),
(91,10,1),
(92,10,2),
(93,10,2),
(94,10,0),
(95,10,0),
(96,10,1),
(97,10,1),
(98,10,2),
(99,10,2),
(100,10,0),
(101,11,0),
(102,11,1),
(103,11,1),
(104,11,2),
(105,11,2),
(106,11,0),
(107,11,0),
(108,11,1),
(109,11,1),
(110,11,2),
(111,12,2),
(112,12,0),
(113,12,0),
(114,12,1),
(115,12,1),
(116,12,2),
(117,12,2),
(118,12,0),
(119,12,0),
(120,12,1),
(121,13,1),
(122,13,2),
(123,13,2),
(124,13,0),
(125,13,0),
(126,13,1),
(127,13,1),
(128,13,2),
(129,13,2),
(130,13,0),
(131,14,0),
(132,14,1),
(133,14,1),
(134,14,2),
(135,14,2),
(136,14,0),
(137,14,0),
(138,14,1),
(139,14,1),
(140,14,2),
(141,15,2),
(142,15,0),
(143,15,0),
(144,15,1),
(145,15,1),
(146,15,2),
(147,15,2),
(148,15,0),
(149,15,0),
(150,15,1),
(151,16,1),
(152,16,2),
(153,16,2),
(154,16,0),
(155,16,0),
(156,16,1),
(157,16,1),
(158,16,2),
(159,16,2),
(160,16,0),
(161,17,0),
(162,17,1),
(163,17,1),
(164,17,2),
(165,17,2),
(166,17,0),
(167,17,0),
(168,17,1),
(169,17,1),
(170,17,2),
(171,18,2),
(172,18,0),
(173,18,0),
(174,18,1),
(175,18,1),
(176,18,2),
(177,18,2),
(178,18,0),
(179,18,0),
(180,18,1),
(181,19,1),
(182,19,2),
(183,19,2),
(184,19,0),
(185,19,0),
(186,19,1),
(187,19,1),
(188,19,2),
(189,19,2),
(190,19,0),
(191,20,0),
(192,20,1),
(193,20,1),
(194,20,2),
(195,20,2),
(196,20,0),
(197,20,0),
(198,20,1),
(199,20,1),
(200,20,2),
(201,21,2),
(202,21,0),
(203,21,0),
(204,21,1),
(205,21,1),
(206,21,2),
(207,21,2),
(208,21,0),
(209,21,0),
(210,21,1),
(211,22,1),
(212,22,2),
(213,22,2),
(214,22,0),
(215,22,0),
(216,22,1),
(217,22,1),
(218,22,2),
(219,22,2),
(220,22,0),
(221,23,0),
(222,23,1),
(223,23,1),
(224,23,2),
(225,23,2),
(226,23,0),
(227,23,0),
(228,23,1),
(229,23,1),
(230,23,2),
(231,24,2),
(232,24,0),
(233,24,0),
(234,24,1),
(235,24,1),
(236,24,2),
(237,24,2),
(238,24,0),
(239,24,0),
(240,24,1),
(241,25,1),
(242,25,2),
(243,25,2),
(244,25,0),
(245,25,0),
(246,25,1),
(247,25,1),
(248,25,2),
(249,25,2),
(250,25,0),
(251,26,0),
(252,26,1),
(253,26,1),
(254,26,2),
(255,26,2),
(256,26,0),
(257,26,0),
(258,26,1),
(259,26,1),
(260,26,2),
(261,27,2),
(262,27,0),
(263,27,0),
(264,27,1),
(265,27,1),
(266,27,2),
(267,27,2),
(268,27,0),
(269,27,0),
(270,27,1),
(271,28,1),
(272,28,2),
(273,28,2),
(274,28,0),
(275,28,0),
(276,28,1),
(277,28,1),
(278,28,2),
(279,28,2),
(280,28,0),
(281,29,0),
(282,29,1),
(283,29,1),
(284,29,2),
(285,29,2),
(286,29,0),
(287,29,0),
(288,29,1),
(289,29,1),
(290,29,2),
(291,30,2),
(292,30,0),
(293,30,0),
(294,30,1),
(295,30,1),
(296,30,2),
(297,30,2),
(298,30,0),
(299,30,0),
(300,30,1);

create table public.cookpath_task_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id integer not null check (task_id between 1 and 150),
  completed_at timestamptz not null default now(),
  primary key (user_id, task_id)
);
create table public.cookpath_quiz_answers (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id integer not null references cookpath_private.question_catalog(question_id),
  selected_index integer not null check (selected_index between 0 and 2),
  correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.cookpath_task_completions enable row level security;
alter table public.cookpath_quiz_answers enable row level security;
alter table cookpath_private.question_catalog enable row level security;
revoke all on public.cookpath_task_completions, public.cookpath_quiz_answers from public, anon, authenticated;
grant select on public.cookpath_task_completions, public.cookpath_quiz_answers to authenticated;
create policy "Read own CookPath tasks" on public.cookpath_task_completions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Read own CookPath answers" on public.cookpath_quiz_answers
  for select to authenticated using ((select auth.uid()) = user_id);

create function cookpath_private.challenge_available(p_user uuid, p_challenge integer)
returns boolean language sql stable set search_path = '' as $$
  select p_challenge between 1 and 30
    and not exists (
      select 1 from generate_series(1,(p_challenge-1)*5) as required(task_id)
      where not exists (select 1 from public.cookpath_task_completions t where t.user_id=p_user and t.task_id=required.task_id)
    )
    and not exists (
      select 1 from cookpath_private.question_catalog q
      where q.challenge_no<p_challenge and not exists
        (select 1 from public.cookpath_quiz_answers a where a.user_id=p_user and a.question_id=q.question_id)
    );
$$;
revoke all on function cookpath_private.challenge_available(uuid,integer) from public, anon, authenticated;

create function public.cookpath_get_progress()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Sign in required' using errcode='42501'; end if;
  return jsonb_build_object(
    'completed', coalesce((select jsonb_agg(t.task_id order by t.task_id) from public.cookpath_task_completions t where t.user_id=v_user),'[]'::jsonb),
    'qnaAnswers', coalesce((select jsonb_object_agg(a.question_id::text,jsonb_build_object('selectedIndex',a.selected_index,'correct',a.correct,'answeredAt',a.answered_at)) from public.cookpath_quiz_answers a where a.user_id=v_user),'{}'::jsonb)
  );
end;
$$;

create function public.cookpath_complete_task(p_task_id integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if p_task_id is null or p_task_id not between 1 and 150 then raise exception 'Invalid task' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
  if not exists(select 1 from public.cookpath_task_completions where user_id=v_user and task_id=p_task_id)
    and not cookpath_private.challenge_available(v_user,((p_task_id-1)/5)+1)
  then raise exception 'Complete the previous challenge first' using errcode='42501'; end if;
  insert into public.cookpath_task_completions(user_id,task_id) values(v_user,p_task_id) on conflict do nothing;
  return public.cookpath_get_progress();
end;
$$;

create function public.cookpath_submit_answer(p_question_id integer, p_selected_index integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_question cookpath_private.question_catalog%rowtype;
begin
  if v_user is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if p_selected_index is null or p_selected_index not between 0 and 2 then raise exception 'Invalid answer' using errcode='22023'; end if;
  select * into v_question from cookpath_private.question_catalog where question_id=p_question_id;
  if not found then raise exception 'Invalid question' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
  if exists(select 1 from public.cookpath_quiz_answers where user_id=v_user and question_id=p_question_id)
    then return public.cookpath_get_progress(); end if;
  if not cookpath_private.challenge_available(v_user,v_question.challenge_no)
    then raise exception 'Complete the previous challenge first' using errcode='42501'; end if;
  insert into public.cookpath_quiz_answers(user_id,question_id,selected_index,correct)
    values(v_user,p_question_id,p_selected_index,p_selected_index=v_question.correct_index) on conflict do nothing;
  return public.cookpath_get_progress();
end;
$$;

create function public.cookpath_import_progress(p_progress jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_challenge integer; v_task integer; v_question record; v_answer jsonb;
begin
  if v_user is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if p_progress is null or jsonb_typeof(p_progress)<>'object'
    or coalesce(jsonb_typeof(p_progress->'completed'),'')<>'array'
    or coalesce(jsonb_typeof(p_progress->'qnaAnswers'),'')<>'object'
    or pg_column_size(p_progress)>100000
  then raise exception 'Invalid progress' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
  for v_challenge in 1..30 loop
    exit when not cookpath_private.challenge_available(v_user,v_challenge);
    for v_task in ((v_challenge-1)*5+1)..(v_challenge*5) loop
      if (p_progress->'completed') @> jsonb_build_array(v_task) then perform public.cookpath_complete_task(v_task); end if;
    end loop;
    for v_question in select question_id from cookpath_private.question_catalog where challenge_no=v_challenge order by question_id loop
      v_answer := p_progress->'qnaAnswers'->(v_question.question_id::text)->'selectedIndex';
      if v_answer is not null and v_answer::text in ('0','1','2') then
        perform public.cookpath_submit_answer(v_question.question_id,(v_answer::text)::integer);
      end if;
    end loop;
  end loop;
  return public.cookpath_get_progress();
end;
$$;

revoke all on function public.cookpath_get_progress(), public.cookpath_complete_task(integer), public.cookpath_submit_answer(integer,integer), public.cookpath_import_progress(jsonb) from public, anon, authenticated;
grant execute on function public.cookpath_get_progress(), public.cookpath_complete_task(integer), public.cookpath_submit_answer(integer,integer), public.cookpath_import_progress(jsonb) to authenticated;

commit;
