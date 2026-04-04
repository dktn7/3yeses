SELECT format('SELECT %L AS column, count(*) FILTER (WHERE %I IS NULL) AS nulls FROM talentprofiles;', column_name, column_name)
FROM information_schema.columns
WHERE table_name='talentprofiles'
ORDER BY ordinal_position
\gexec
