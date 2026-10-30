-- Optional starter content for the Cool Affair Universe.
--
-- Contains only facts from the artist's brief: name, roles, city, influences
-- and the eight known project identities, all at stage 'concept' with no
-- dates, tracks, audio or artwork. Safe to re-run: existing rows are kept
-- (ON CONFLICT DO NOTHING), so it never overwrites edits made in the Studio.

insert into public.ca_site_settings (
  id, artist_name, legal_name, base_city, roles, influences,
  hero_statement, intro_statement, alchemy_intro, live_intro, band_concept
) values (
  1,
  'Cool Affair',
  'Sibusiso Zephania Ntombela',
  'Johannesburg',
  array['Producer', 'DJ', 'Musician', 'Sound engineer', 'Label owner'],
  array['Broken beat', 'Nu-jazz', 'Afrobeat', 'Soulful house', 'Deep house', 'Jazz',
        'Electronic experimentation', 'Ambient', 'Afro-futurism'],
  'Where African musical expression, jazz sensibility and electronic experimentation meet.',
  'Cool Affair is the creative identity of Sibusiso Zephania Ntombela: producer, DJ, musician, sound engineer and label owner, working from Johannesburg. It is less a brand than a universe, built from broken beat and nu-jazz, Afrobeat and deep house, ambient space and the city''s underground.',
  'Alchemy is the laboratory: the experiments, research and production notes behind the music. Nothing filed here is a finished release unless it says so.',
  'DJ sets, live electronic performance, collaborations and an expanded Full Band Experience: the sound of Cool Affair, in the room.',
  'The Full Band Experience is conceived as an expanded format, bringing musicians and electronic production together in one live performance.'
)
on conflict (id) do nothing;

insert into public.ca_releases (slug, title, kind, stage, status, featured, sort_order) values
  ('the-cool-affair-manifesto', 'The Cool Affair Manifesto', 'project', 'concept', 'published', true, 1),
  ('scamto-mzansi-argot', 'Scamto (Mzansi Argot)', 'project', 'concept', 'published', true, 2),
  ('stone-circles', 'Stone Circles', 'project', 'concept', 'published', true, 3),
  ('broken-beat-music', 'Broken Beat Music', 'project', 'concept', 'published', false, 4),
  ('afro-futuristic', 'Afro Futuristic', 'project', 'concept', 'published', false, 5),
  ('ambient', 'Ambient', 'project', 'concept', 'published', false, 6),
  ('cool-goes-deep', 'Cool Goes Deep', 'project', 'concept', 'published', false, 7),
  ('full-band-experience', 'Full Band Experience', 'project', 'concept', 'published', false, 8)
on conflict (slug) do nothing;
