-- Migration: 0026_fix_motto_order.sql
-- Description: Re-apply sortOrder based on MOTTO_TITLES_ORDER to ensure they are seeded

UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 1}') WHERE json_extract(data_json, '$.shortTitle') = 'Courtesy';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 2}') WHERE json_extract(data_json, '$.shortTitle') = 'Devotion';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 3}') WHERE json_extract(data_json, '$.shortTitle') = 'Initiative';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 4}') WHERE json_extract(data_json, '$.shortTitle') = 'Detachment';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 5}') WHERE json_extract(data_json, '$.shortTitle') = 'Posture';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 6}') WHERE json_extract(data_json, '$.shortTitle') = 'Patience';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 7}') WHERE json_extract(data_json, '$.shortTitle') = 'Wisdom';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 8}') WHERE json_extract(data_json, '$.shortTitle') = 'Purification';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 9}') WHERE json_extract(data_json, '$.shortTitle') = 'Principle';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 10}') WHERE json_extract(data_json, '$.shortTitle') = 'Experience';
UPDATE mottos SET data_json = json_patch(data_json, '{"sortOrder": 11}') WHERE json_extract(data_json, '$.shortTitle') = 'Gratitude';
