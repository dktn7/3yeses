import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type SqlParam = string | number | string[] | number[];

type Filters = {
  gender?: string | string[];
  ethnicity?: string | string[];
  minAge?: number;
  maxAge?: number;
  bodyType?: string | string[];
  minExperience?: number;
  maxExperience?: number;
  search?: string;
  subcategoryId?: string;
  page?: number;
  pageSize?: number;
};

// Map UI gender strings to DB enum Gender
function mapGender(g: string): 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY' | undefined {
  const s = (g || '').toLowerCase();
  if (s === 'male') return 'MALE';
  if (s === 'female') return 'FEMALE';
  if (s === 'non-binary' || s === 'nonbinary') return 'NON_BINARY';
  if (s === 'prefer_not_to_say' || s === 'prefer-not-to-say' || s === 'other') return 'PREFER_NOT_TO_SAY';
  return undefined;
}

// Map UI body types to DB enum BodyType
function mapBodyType(b: string): 'SLIM' | 'ATHLETIC' | 'CURVY' | 'PLUS_SIZE' | 'MUSCULAR' | undefined {
  const s = (b || '').toLowerCase();
  if (s === 'slim') return 'SLIM';
  if (s === 'athletic') return 'ATHLETIC';
  if (s === 'curvy') return 'CURVY';
  if (s === 'plus-size' || s === 'plus_size' || s === 'plussize') return 'PLUS_SIZE';
  if (s === 'muscular') return 'MUSCULAR';
  // 'average' not present in DB enum; ignore it
  return undefined;
}

function pushClause(
  acc: { clauses: string[]; values: SqlParam[]; idx: number },
  clause: string,
  value: SqlParam | SqlParam[]
) {
  acc.clauses.push(clause.replace('$IDX', `$${acc.idx}`));
  acc.values.push(value as SqlParam);
  acc.idx += 1;
}

// Push an ANY(ARRAY[...]) clause with explicit enum casts, avoiding driver array encoding like '{}'
function pushEnumAny(
  acc: { clauses: string[]; values: SqlParam[]; idx: number },
  column: string,
  enumName: 'Gender' | 'BodyType',
  values: string[]
) {
  if (values.length === 1) {
    // Single value: simpler equality with enum cast
    pushClause(acc, `${column} = $IDX::"${enumName}"`, values[0]);
    return;
  }
  // Multiple values: expand to ARRAY[$i, $i+1, ...]::"Enum"[]
  const placeholders: string[] = [];
  for (let i = 0; i < values.length; i += 1) {
    placeholders.push(`$${acc.idx + i}::"${enumName}"`);
  }
  acc.clauses.push(`${column} = ANY(ARRAY[${placeholders.join(', ')}]::"${enumName}"[])`);
  for (const v of values) {
    acc.values.push(v);
  }
  acc.idx += values.length;
}

function buildGender(acc: { clauses: string[]; values: SqlParam[]; idx: number }, gender?: string | string[]) {
  if (Array.isArray(gender) && gender.length > 0) {
    const mapped = gender
      .map(mapGender)
      .filter((v): v is 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY' => Boolean(v));
  if (mapped.length > 0) pushEnumAny(acc, '"gender"', 'Gender', mapped);
  } else if (typeof gender === 'string' && gender.trim() !== '') {
    const g = mapGender(gender);
    if (g) pushClause(acc, '"gender" = $IDX::"Gender"', g);
  }
}

function buildEthnicity(acc: { clauses: string[]; values: SqlParam[]; idx: number }, ethnicity?: string | string[]) {
  if (Array.isArray(ethnicity) && ethnicity.length > 0) {
    const startIdx = acc.idx;
    const parts: string[] = [];
    ethnicity.forEach((e) => {
      if (typeof e === 'string' && e.trim() !== '') {
        parts.push(`"ethnicity" ILIKE $${acc.idx}`);
        acc.values.push(`%${e}%`);
        acc.idx += 1;
      }
    });
    if (parts.length > 0) acc.clauses.push(`(${parts.join(' OR ')})`);
    else acc.idx = startIdx; // revert if nothing added
  } else if (typeof ethnicity === 'string' && ethnicity.trim() !== '') {
    pushClause(acc, '"ethnicity" ILIKE $IDX', `%${ethnicity}%`);
  }
}

function buildRange(acc: { clauses: string[]; values: SqlParam[]; idx: number }, column: string, min?: number, max?: number) {
  if (min !== undefined) pushClause(acc, `${column} >= $IDX`, min);
  if (max !== undefined) pushClause(acc, `${column} <= $IDX`, max);
}

function buildBodyType(acc: { clauses: string[]; values: SqlParam[]; idx: number }, bodyType?: string | string[]) {
  if (Array.isArray(bodyType) && bodyType.length > 0) {
    const mapped = bodyType
      .map(mapBodyType)
      .filter((v): v is 'SLIM' | 'ATHLETIC' | 'CURVY' | 'PLUS_SIZE' | 'MUSCULAR' => Boolean(v));
  if (mapped.length > 0) pushEnumAny(acc, '"bodyType"', 'BodyType', mapped);
  } else if (typeof bodyType === 'string' && bodyType.trim() !== '') {
    const b = mapBodyType(bodyType);
    if (b) pushClause(acc, '"bodyType" = $IDX::"BodyType"', b);
  }
}

function buildSubcategory(acc: { clauses: string[]; values: SqlParam[]; idx: number }, subcategoryId?: string) {
  if (typeof subcategoryId === 'string' && subcategoryId.trim() !== '') {
    pushClause(acc, '"subcategoryId" = $IDX', subcategoryId);
  }
}

function buildSearch(acc: { clauses: string[]; values: SqlParam[]; idx: number }, search?: string) {
  if (search && search.trim() !== '') {
    acc.clauses.push(`("bio" ILIKE $${acc.idx} OR "skills"::text ILIKE $${acc.idx} OR "location" ILIKE $${acc.idx})`);
    acc.values.push(`%${search}%`);
    acc.idx += 1;
  }
}

function buildWhereAndValues(filters: Filters): { where: string; values: SqlParam[]; nextIdx: number } {
  const acc = { clauses: [] as string[], values: [] as SqlParam[], idx: 1 };
  buildGender(acc, filters.gender);
  buildEthnicity(acc, filters.ethnicity);
  buildRange(acc, '"age"', filters.minAge, filters.maxAge);
  buildBodyType(acc, filters.bodyType);
  buildRange(acc, '"experience"', filters.minExperience, filters.maxExperience);
  buildSubcategory(acc, filters.subcategoryId);
  buildSearch(acc, filters.search);
  const where = acc.clauses.length ? `WHERE ${acc.clauses.join(' AND ')}` : '';
  return { where, values: acc.values, nextIdx: acc.idx };
}

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();
    const { where, values, nextIdx } = buildWhereAndValues(filters);
    const page: number = (filters && typeof filters.page === 'number') ? filters.page : 1;
    const pageSize: number = (filters && typeof filters.pageSize === 'number') ? filters.pageSize : 12;
    const offset = (page - 1) * pageSize;

    const client = await pool.connect();
    try {
      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) FROM "TalentProfile" ${where}`;
      const countResult = await client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      const query = `
        SELECT * FROM "TalentProfile"
        ${where}
        ORDER BY "id" DESC
        LIMIT $${nextIdx} OFFSET $${nextIdx + 1}
      `;
      const pagedValues = [...values, pageSize, offset];
      const result = await client.query(query, pagedValues);
      return NextResponse.json({ success: true, talents: result.rows, total });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in talent search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
