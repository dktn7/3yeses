SELECT format('SELECT %L AS column, count(*) FILTER (WHERE %I IS NULL) AS nulls FROM "TalentProfile";', column_name, column_name)
FROM information_schema.columns
WHERE table_name='TalentProfile'
ORDER BY ordinal_position
\gexec
