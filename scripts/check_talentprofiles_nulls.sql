DO $$
DECLARE
  r record;
  cnt bigint;
BEGIN
  FOR r IN
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'talentprofiles'
    ORDER BY ordinal_position
  LOOP
    EXECUTE format('SELECT count(*) FROM talentprofiles WHERE %I IS NULL', r.column_name) INTO cnt;
    RAISE INFO '%: %', r.column_name, cnt;
  END LOOP;
END
$$;
