// Phase C monitoring — run anytime. Aggregate-only, no raw data.
// Usage: node scripts/monitor-phase-c.cjs [sinceMinutes]
const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
});

async function monitor() {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const sinceMins = parseInt(process.argv[2] || '1440', 10); // default 24h
  const since = new Date(Date.now() - sinceMins * 60 * 1000).toISOString();

  console.log(`=== Phase C Monitor (since ${sinceMins} min ago) ===\n`);

  // Total parse attempts
  const parseCount = await pool.query(
    `SELECT COUNT(*) FROM ai_usage_events WHERE feature = 'curriculum_import_parse' AND created_at >= $1`,
    [since]
  );
  console.log(`Parse attempts: ${parseCount.rows[0].count}`);

  // Parse failures (events with error metadata or missing required fields)
  const parseFails = await pool.query(
    `SELECT COUNT(*) FROM ai_usage_events WHERE feature = 'curriculum_import_parse' AND created_at >= $1 AND (metadata->>'error' IS NOT NULL OR metadata->>'recordCount' IS NULL)`,
    [since]
  );
  const pCount = parseInt(parseCount.rows[0].count, 10) || 0;
  const pfCount = parseInt(parseFails.rows[0].count, 10) || 0;
  console.log(`Parse failures: ${pfCount} (${pCount ? ((pfCount/pCount)*100).toFixed(1) : 0}%)`);

  // Confirm attempts
  const confirmCount = await pool.query(
    `SELECT COUNT(*) FROM ai_usage_events WHERE feature = 'curriculum_import_confirm' AND created_at >= $1`,
    [since]
  );
  const cCount = parseInt(confirmCount.rows[0].count, 10) || 0;
  console.log(`Confirm attempts: ${cCount}`);

  // Confirm failures (importConfirmed = false)
  const confirmFails = await pool.query(
    `SELECT COUNT(*) FROM ai_usage_events WHERE feature = 'curriculum_import_confirm' AND created_at >= $1 AND metadata->>'importConfirmed' = 'false'`,
    [since]
  );
  const cfCount = parseInt(confirmFails.rows[0].count, 10) || 0;
  console.log(`Confirm failures: ${cfCount} (${cCount ? ((cfCount/cCount)*100).toFixed(1) : 0}%)`);

  // Aggregate linking analytics
  const links = await pool.query(`
    SELECT
      COALESCE(SUM((metadata->>'linkingEnabled')::int), 0) AS linking_enabled,
      COALESCE(SUM((metadata->>'examNameCount')::int), 0) AS exam_name_count,
      COALESCE(SUM((metadata->>'relatedSubjectNameCount')::int), 0) AS rel_subj_count,
      COALESCE(SUM((metadata->>'relatedTopicNameCount')::int), 0) AS rel_topic_count,
      COALESCE(SUM((metadata->>'relatedExamNameCount')::int), 0) AS rel_exam_count,
      COALESCE(SUM((metadata->>'linkedTopicExamCount')::int), 0) AS linked_topic_exam,
      COALESCE(SUM((metadata->>'linkedTaskSubjectCount')::int), 0) AS linked_task_subj,
      COALESCE(SUM((metadata->>'linkedTaskTopicCount')::int), 0) AS linked_task_topic,
      COALESCE(SUM((metadata->>'linkedTaskExamCount')::int), 0) AS linked_task_exam,
      COALESCE(SUM((metadata->>'unresolvedLinkWarningCount')::int), 0) AS unresolved_warnings,
      COALESCE(SUM((metadata->>'ambiguousLinkWarningCount')::int), 0) AS ambiguous_warnings
    FROM ai_usage_events
    WHERE feature = 'curriculum_import_confirm'
      AND created_at >= $1
  `, [since]);
  const a = links.rows[0];

  console.log(`\n=== Linking Analytics ===`);
  console.log(`linkingEnabled count:   ${a.linking_enabled}`);
  console.log(`examNameCount total:    ${a.exam_name_count}`);
  console.log(`relatedSubjectNameCount:${a.rel_subj_count}`);
  console.log(`relatedTopicNameCount:  ${a.rel_topic_count}`);
  console.log(`relatedExamNameCount:   ${a.rel_exam_count}`);
  console.log(`linkedTopicExamCount:   ${a.linked_topic_exam}`);
  console.log(`linkedTaskSubjectCount: ${a.linked_task_subj}`);
  console.log(`linkedTaskTopicCount:   ${a.linked_task_topic}`);
  console.log(`linkedTaskExamCount:    ${a.linked_task_exam}`);
  console.log(`unresolvedLinkWarnings: ${a.unresolved_warnings}`);
  console.log(`ambiguousLinkWarnings:  ${a.ambiguous_warnings}`);

  // Validation failures (parse events with non-empty validationErrors)
  const valFails = await pool.query(
    `SELECT COUNT(*) FROM ai_usage_events WHERE feature = 'curriculum_import_parse' AND created_at >= $1 AND metadata->>'validationErrors' IS NOT NULL AND metadata->>'validationErrors' <> '[]'`,
    [since]
  );
  console.log(`\nValidation failures: ${valFails.rows[0].count}`);

  // Invalid record structure — parse events with recordParseError
  const structErrors = await pool.query(
    `SELECT COUNT(*) FROM ai_usage_events WHERE feature = 'curriculum_import_parse' AND created_at >= $1 AND metadata->>'recordParseError' IS NOT NULL`,
    [since]
  );
  console.log(`Invalid record structure errors: ${structErrors.rows[0].count}`);

  // Check for when FK is zero despite entity names present
  const fkGap = await pool.query(`
    SELECT COUNT(*) FROM ai_usage_events
    WHERE feature = 'curriculum_import_confirm'
      AND created_at >= $1
      AND (metadata->>'examNameCount')::int > 0
      AND (metadata->>'linkedTopicExamCount')::int = 0
  `, [since]);
  console.log(`Zero FK despite names present: ${fkGap.rows[0].count}`);

  console.log(`\n=== ALERTS ===`);
  const alerts = [];
  if (a.unresolved_warnings > 0) alerts.push(`⚠ unresolvedLinkWarningCount = ${a.unresolved_warnings}`);
  if (a.ambiguous_warnings > 0) alerts.push(`⚠ ambiguousLinkWarningCount = ${a.ambiguous_warnings}`);
  if (parseInt(structErrors.rows[0].count, 10) > 0) alerts.push(`⚠ Invalid record structure errors: ${structErrors.rows[0].count}`);
  if (parseInt(confirmFails.rows[0].count, 10) > 0) alerts.push(`⚠ Confirm failures: ${cfCount}`);
  if (parseInt(fkGap.rows[0].count, 10) > 0) alerts.push(`⚠ Zero FK populated despite entity-name fields present: ${fkGap.rows[0].count} events`);
  if (alerts.length === 0) alerts.push('✅ All clear — no anomalies detected.');
  alerts.forEach(aa => console.log(aa));

  await pool.end();
  console.log(`\nRun again: node scripts/monitor-phase-c.cjs [minutes]`);
}
monitor().catch(e => { console.error(e.message); process.exit(1); });
