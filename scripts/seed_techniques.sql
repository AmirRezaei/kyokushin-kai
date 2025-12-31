INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('1', '{"id":"1","kind":"Stand","name":{"romaji":"Yoi Dachi","en":"Ready Stance","sv":"Redoställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('2', '{"id":"2","kind":"Stand","name":{"romaji":"Fudo Dachi","en":"Immovable Stance","sv":"Orörlig ställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('3', '{"id":"3","kind":"Stand","name":{"romaji":"Zenkutsu Dachi","en":"Front Stance","sv":"Främre ställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('4', '{"id":"4","kind":"Block","name":{"romaji":"Seiken Jodan Uke","en":"Forefist Upper-Level Block","sv":"Forefist-block på övre nivå"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('5', '{"id":"5","kind":"Block","name":{"romaji":"Seiken Mae Gedan Barai","en":"Forefist Lower-Level Sweep","sv":"Forefist-svep på nedre nivå"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('6', '{"id":"6","kind":"Strike","name":{"romaji":"Seiken Oi Tsuki (Jodan, Chudan, Gedan)","en":"Forefist Lunge Punch (Upper, Middle, Lower Level)","sv":"Forefist-framåtslaget (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('7', '{"id":"7","kind":"Strike","name":{"romaji":"Morote Tsuki (Jodan, Chudan, Gedan)","en":"Double Fist Punch (Upper, Middle, Lower Level)","sv":"Dubbel näveslag (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('8', '{"id":"8","kind":"Kick","name":{"romaji":"Hiza Ganmen Geri","en":"Knee Strike to Face","sv":"Knäslag mot ansiktet"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('9', '{"id":"9","kind":"Kick","name":{"romaji":"Kin Geri","en":"Groin Kick","sv":"Knickspark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('10', '{"id":"10","kind":"Block","name":{"romaji":"Seiken Chudan Uchi Uke","en":"Forefist Inside Middle Block","sv":"Forefist-block inre mitt-block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('11', '{"id":"11","kind":"Block","name":{"romaji":"Seiken Chudan Soto Uke","en":"Forefist Outside Middle Block","sv":"Forefist-block yttre mitt-block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('12', '{"id":"12","kind":"Kick","name":{"romaji":"Mae Geri","en":"Front Kick","sv":"Främre spark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('13', '{"id":"13","kind":"Kick","name":{"romaji":"Chudan Chusoku","en":"Middle-Level Ball of Foot Kick","sv":"Mellersta nivåets fotbollsspark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('14', '{"id":"14","kind":"Stand","name":{"romaji":"Sanchin Dachi","en":"Hourglass Stance","sv":"Timglasställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('15', '{"id":"15","kind":"Stand","name":{"romaji":"Kokutsu Dachi","en":"Back Stance","sv":"Bakställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('16', '{"id":"16","kind":"Stand","name":{"romaji":"Musubi Dachi","en":"Informal Attention Stance","sv":"Informell uppmärksamhetsställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('17', '{"id":"17","kind":"Strike","name":{"romaji":"Ago Uchi","en":"Chin Strike","sv":"Hakeslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('18', '{"id":"18","kind":"Strike","name":{"romaji":"Seiken Gyaku Tsuki (Jodan, Chudan, Gedan)","en":"Forefist Reverse Punch (Upper, Middle, Lower Level)","sv":"Forefist-omvänd slag (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('19', '{"id":"19","kind":"Breathing","name":{"romaji":"Nogare (Omote and Ura)","en":"Breathing Exercise","sv":"Andningsövning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Breathing', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('20', '{"id":"20","kind":"Fighting","name":{"romaji":"Sanbon Kumite","en":"Three-Step Sparring","sv":"Tre-stegs sparring"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Fighting', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('21', '{"id":"21","kind":"Block","name":{"romaji":"Morote Chudan Uchi Uke","en":"Augmented Middle Inside Block","sv":"Förstärkt inre mitt-block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('22', '{"id":"22","kind":"Block","name":{"romaji":"Chudan Uchi Uke Gedan Barai","en":"Middle Inside Block with Lower-Level Sweep","sv":"Inre mitt-block med nedre svep"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('23', '{"id":"23","kind":"Kick","name":{"romaji":"Mae Geri, Jodan","en":"Front Kick, Upper Level","sv":"Främre spark, övre nivå"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('24', '{"id":"24","kind":"Stand","name":{"romaji":"Kiba Dachi","en":"Horse Riding Stance","sv":"Hästställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('25', '{"id":"25","kind":"Strike","name":{"romaji":"Shita Tsuki","en":"Lower Thrust Punch","sv":"Lågt framåtslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('26', '{"id":"26","kind":"Strike","name":{"romaji":"Jun Tsuki","en":"Straight Punch","sv":"Rakt slag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('27', '{"id":"27","kind":"Strike","name":{"romaji":"Tate Tsuki (Jodan, Chudan, Gedan)","en":"Vertical Punch (Upper, Middle, Lower Level)","sv":"Vertikalt slag (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('28', '{"id":"28","kind":"Block","name":{"romaji":"Mawashi Gedan Barai","en":"Circular Lower-Level Sweep","sv":"Cirkulärt nedre svep"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('29', '{"id":"29","kind":"Block","name":{"romaji":"Shuto Mawashi Uke (in Kokutsu Dachi)","en":"Knife-Hand Circular Block (in Back Stance)","sv":"Knivhand cirkulärt block (i bakställning)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('30', '{"id":"30","kind":"Kick","name":{"romaji":"Mae Chusoku Keage","en":"Front Snap Kick with Ball of Foot","sv":"Främre snap-spark med fotboll"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('31', '{"id":"31","kind":"Kick","name":{"romaji":"Teisoku Mawashi Soto Keage","en":"Instep Outside Snap Kick","sv":"Insteg yttre snap-spark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('32', '{"id":"32","kind":"Kick","name":{"romaji":"Haisoku Mawashi Uchi Keage","en":"Instep Inside Snap Kick","sv":"Insteg inre snap-spark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('33', '{"id":"33","kind":"Kick","name":{"romaji":"Sokuto Yoko Keage","en":"Sword Foot Side Snap Kick","sv":"Sabelfot sidospel-spark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('34', '{"id":"34","kind":"Stand","name":{"romaji":"Neko Ashi Dachi","en":"Cat Stance","sv":"Kattställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('35', '{"id":"35","kind":"Strike","name":{"romaji":"Tettsui Komi Kami","en":"Hammer Fist to Top of Head","sv":"Hammarslag till huvudtoppen"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('36', '{"id":"36","kind":"Strike","name":{"romaji":"Tettsui Oroshi Ganmen Uchi","en":"Hammer Fist Downward Face Strike","sv":"Hammarslag nedåt mot ansiktet"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('37', '{"id":"37","kind":"Strike","name":{"romaji":"Tettsui Hizo Uchi","en":"Hammer Fist to Spleen","sv":"Hammarslag mot mjälten"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('38', '{"id":"38","kind":"Strike","name":{"romaji":"Tettsui Yoko Uchi (Jodan, Chudan, Gedan)","en":"Hammer Fist Side Strike (Upper, Middle, Lower Level)","sv":"Hammarslag sidled (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('39', '{"id":"39","kind":"Breathing","name":{"romaji":"Ibuki Sankai","en":"Three Times Ibuki Breathing","sv":"Tre gånger Ibuki-andning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Breathing', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('40', '{"id":"40","kind":"Fighting","name":{"romaji":"Jiyu Kumite","en":"Free Sparring","sv":"Fri sparring"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Fighting', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('41', '{"id":"41","kind":"Fighting","name":{"romaji":"Yakusoku Ippon Kumite","en":"Prearranged One-Step Sparring","sv":"Förhandsbestämd ett-stegs sparring"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Fighting', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('42', '{"id":"42","kind":"Block","name":{"romaji":"Seiken Juji Uke (Jodan, Gedan)","en":"Forefist Cross Block (Upper, Lower Level)","sv":"Forefist korsblock (övre, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('43', '{"id":"43","kind":"Kick","name":{"romaji":"Kansetsu Geri","en":"Joint Kick","sv":"Led spark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('44', '{"id":"44","kind":"Kick","name":{"romaji":"Chudan Yoko Geri (Sokuto)","en":"Middle Side Kick (Edge of Foot)","sv":"Mellan sidokick (fotens kant)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('45', '{"id":"45","kind":"Kick","name":{"romaji":"Mawashi Gedan Geri (Haisoku, Chusoku)","en":"Lower Roundhouse Kick (Instep, Ball of Foot)","sv":"Lägsta rundspark (insteg, fotboll)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('46', '{"id":"46","kind":"Stand","name":{"romaji":"Tsuru Ashi Dachi","en":"Crane Stance","sv":"Traställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('47', '{"id":"47","kind":"Strike","name":{"romaji":"Uraken Mawashi Ganmen Uchi","en":"Back Fist Strike to the Side of the Head","sv":"Baknäveslag mot sidodelen av huvudet"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('48', '{"id":"48","kind":"Strike","name":{"romaji":"Uraken Ganmen Uchi","en":"Back Fist Face Strike","sv":"Baknäveslag mot ansiktet"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('49', '{"id":"49","kind":"Strike","name":{"romaji":"Uraken Sayu Ganmen Uchi","en":"Back Fist Side Face Strike","sv":"Baknäveslag sidledes mot ansiktet"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('50', '{"id":"50","kind":"Strike","name":{"romaji":"Uraken Hizo Uchi","en":"Back Fist Spleen Strike","sv":"Baknäveslag mot mjälten"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('51', '{"id":"51","kind":"Strike","name":{"romaji":"Nihon Nukite (Me Tsuki)","en":"Two-Finger Spear Hand (Eye Thrust)","sv":"Tvåfingers spjuthand (ögonstöt)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('52', '{"id":"52","kind":"Strike","name":{"romaji":"Yonhon Nukite (Jodan, Chudan)","en":"Four-Finger Spear Hand (Upper, Middle Level)","sv":"Fyrafingers spjuthand (övre, mellersta nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('53', '{"id":"53","kind":"Fighting","name":{"romaji":"Jiyu Kumite","en":"Free Sparring 10 rounds x 2 minutes","sv":"Fri sparring 10 ronder x 2 minuter"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Fighting', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('54', '{"id":"54","kind":"Block","name":{"romaji":"Shotei Uke (Jodan, Chudan, Gedan)","en":"Palm Heel Block (Upper, Middle, Lower Level)","sv":"Handflata-block (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('55', '{"id":"55","kind":"Kick","name":{"romaji":"Chudan Mawashi Geri (Haisoku, Chusoku)","en":"Middle Roundhouse Kick (Instep, Ball of Foot)","sv":"Mellan rundspark (insteg, fotboll)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('56', '{"id":"56","kind":"Kick","name":{"romaji":"Ushiro Geri (Chudan, Gedan)","en":"Back Kick (Middle, Lower Level)","sv":"Bakspark (mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('57', '{"id":"57","kind":"Stand","name":{"romaji":"Moro Ashi Dachi","en":"One Foot Forward Stance","sv":"En fot framställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('58', '{"id":"58","kind":"Strike","name":{"romaji":"Shotei Uchi (Jodan, Chudan, Gedan)","en":"Palm Heel Strike (Upper, Middle, Lower Level)","sv":"Handflata-slag (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('59', '{"id":"59","kind":"Strike","name":{"romaji":"Jodan Hiji Ate","en":"Upper Elbow Strike","sv":"Övre armbågeslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('60', '{"id":"60","kind":"Fighting","name":{"romaji":"Jiyu Kumite","en":"Free Sparring 15 rounds x 2 minutes","sv":"Fri sparring 15 ronder x 2 minuter"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Fighting', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('61', '{"id":"61","kind":"Block","name":{"romaji":"Shuto Jodan Uke","en":"Knife-Hand Upper-Level Block","sv":"Knivhand övre-nivå block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('62', '{"id":"62","kind":"Block","name":{"romaji":"Shuto Chudan Soto Uke","en":"Knife-Hand Outside Middle Block","sv":"Knivhand yttre mitt-block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('63', '{"id":"63","kind":"Block","name":{"romaji":"Shuto Chudan Uchi Uke","en":"Knife-Hand Inside Middle Block","sv":"Knivhand inre mitt-block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('64', '{"id":"64","kind":"Block","name":{"romaji":"Shuto Mae Gedan Barai","en":"Knife-Hand Forward Lower Sweep","sv":"Knivhand framåt nedre svep"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('65', '{"id":"65","kind":"Block","name":{"romaji":"Mawashi Uke (Mae Shuto Mawashi Uke)","en":"Forward Knife-Hand Circular Block","sv":"Framåt knivhand cirkulärt block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('66', '{"id":"66","kind":"Block","name":{"romaji":"Shuto Jodan Uchi Uke","en":"Knife-Hand Upper-Level Inside Block","sv":"Knivhand övre inre block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('67', '{"id":"67","kind":"Kick","name":{"romaji":"Jodan Yoko Geri","en":"Upper-Level Side Kick","sv":"Övre nivåets sidokick"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('68', '{"id":"68","kind":"Kick","name":{"romaji":"Jodan Mawashi Geri (Chusoku, Haisoku)","en":"Upper Roundhouse Kick (Ball of Foot, Instep)","sv":"Övre rundspark (fotboll, insteg)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('69', '{"id":"69","kind":"Kick","name":{"romaji":"Jodan Ushiro Geri","en":"Upper-Level Back Kick","sv":"Övre nivåets bakspark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('70', '{"id":"70","kind":"Stand","name":{"romaji":"Heisoku Dachi","en":"Feet Together Stance","sv":"Fötter tillsammans ställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('71', '{"id":"71","kind":"Stand","name":{"romaji":"Heiko Dachi","en":"Parallel Stance","sv":"Parallellställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('72', '{"id":"72","kind":"Stand","name":{"romaji":"Uchi Hachiji Dachi","en":"Inward Open-Leg Stance","sv":"Inåtvänd öppen bensställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('73', '{"id":"73","kind":"Strike","name":{"romaji":"Shuto Sakotsu Uchi","en":"Knife-Hand Collarbone Strike","sv":"Knivhand kollarbensslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('74', '{"id":"74","kind":"Strike","name":{"romaji":"Shuto Yoko Ganmen Uchi","en":"Knife-Hand Side Face Strike","sv":"Knivhand sidofaceslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('75', '{"id":"75","kind":"Strike","name":{"romaji":"Shuto Uchi Komi","en":"Knife-Hand Thrust Strike","sv":"Knivhand stöt-slag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('76', '{"id":"76","kind":"Strike","name":{"romaji":"Shuto Hizo Uchi","en":"Knife-Hand Spleen Strike","sv":"Knivhand mjältslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('77', '{"id":"77","kind":"Strike","name":{"romaji":"Shuto Jodan Uchi Uchi","en":"Knife-Hand Upper-Level Inside Strike","sv":"Knivhand övre inre slag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('78', '{"id":"78","kind":"Fighting","name":{"romaji":"Jiyu Kumite","en":"Free Sparring 20 rounds x 2 minutes","sv":"Fri sparring 20 ronder x 2 minuter"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Fighting', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('79', '{"id":"79","kind":"Block","name":{"romaji":"Shuto Juji Uke (Jodan, Gedan)","en":"Knife-Hand Cross Block (Upper, Lower Level)","sv":"Knivhand korsblock (övre, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('80', '{"id":"80","kind":"Kick","name":{"romaji":"Mae Kakato Geri (Jodan, Chudan, Gedan)","en":"Front Heel Kick (Upper, Middle, Lower Level)","sv":"Främre hälspark (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('81', '{"id":"81","kind":"Stand","name":{"romaji":"Kake Dachi","en":"Hooked Stance","sv":"Krokställning"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Stand', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('82', '{"id":"82","kind":"Strike","name":{"romaji":"Hiji Ate","en":"Elbow Strike","sv":"Armbågeslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('83', '{"id":"83","kind":"Strike","name":{"romaji":"Age Hiji Ate (Jodan, Chudan)","en":"Rising Elbow Strike (Upper, Middle Level)","sv":"Uppåtgående armbågeslag (övre, mellersta nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('84', '{"id":"84","kind":"Strike","name":{"romaji":"Ushiro Hiji Ate","en":"Rear Elbow Strike","sv":"Bakåtgående armbågeslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('85', '{"id":"85","kind":"Strike","name":{"romaji":"Oroshi Hiji Ate","en":"Descending Elbow Strike","sv":"Nedåtgående armbågeslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('86', '{"id":"86","kind":"Fighting","name":{"romaji":"Jiyu Kumite (fri fighting) 10 ronder x 2 minuter","en":"Free Sparring 10 rounds x 2 minutes","sv":"Fri sparring 10 ronder x 2 minuter"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Fighting', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('87', '{"id":"87","kind":"Block","name":{"romaji":"Koken Uke (Jodan, Chudan, Gedan)","en":"Bent Wrist Block (Upper, Middle, Lower Level)","sv":"Böjd handledsblock (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('88', '{"id":"88","kind":"Kick","name":{"romaji":"Tobi Nidan Geri","en":"Jumping Double Kick","sv":"Hoppande dubbel spark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('89', '{"id":"89","kind":"Kick","name":{"romaji":"Tobi Mae Geri","en":"Jumping Front Kick","sv":"Hoppande främre spark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('90', '{"id":"90","kind":"Strike","name":{"romaji":"Hira Ken Tsuki (Jodan, Chudan)","en":"Flat Fist Punch (Upper, Middle Level)","sv":"Platt näveslag (övre, mellersta nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('91', '{"id":"91","kind":"Strike","name":{"romaji":"Hira Ken Oroshi Uchi","en":"Flat Fist Descending Strike","sv":"Platt näveslag nedåt"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('92', '{"id":"92","kind":"Strike","name":{"romaji":"Haishu (Jodan, Chudan)","en":"Back Hand Strike (Upper, Middle Level)","sv":"Bakhandsslag (övre, mellersta nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('93', '{"id":"93","kind":"Strike","name":{"romaji":"Hira Ken Mawashi Uchi","en":"Flat Fist Roundhouse Strike","sv":"Platt näveslag rundspark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('94', '{"id":"94","kind":"Strike","name":{"romaji":"Age Jodan Tsuki","en":"Rising Upper-Level Punch","sv":"Uppåtriktat övre näveslag"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('95', '{"id":"95","kind":"Strike","name":{"romaji":"Koken Uchi (Jodan, Chudan, Gedan)","en":"Bent Wrist Strike (Upper, Middle, Lower Level)","sv":"Böjd handledsslag (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('96', '{"id":"96","kind":"Fighting","name":{"romaji":"Jiyu Kumite (fri fighting) 15 ronder x 2 minuter","en":"Free Sparring 15 rounds x 2 minutes","sv":"Fri sparring 15 ronder x 2 minuter"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Fighting', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('97', '{"id":"97","kind":"Block","name":{"romaji":"Kake Uke","en":"Hooking Block","sv":"Krokslag-block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('98', '{"id":"98","kind":"Block","name":{"romaji":"Chudan Haito Uchi Uke","en":"Middle Ridge Hand Inside Block","sv":"Mellan ridge hand inre block"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Block', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('99', '{"id":"99","kind":"Kick","name":{"romaji":"Jodan Uchi Haisoku Geri","en":"Upper-Level Inside Instep Kick","sv":"Övre nivåets inre instegsspark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('100', '{"id":"100","kind":"Kick","name":{"romaji":"Oroshi Soto Kakato Geri","en":"Descending Outside Heel Kick","sv":"Nedåtgående yttre hälspark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('101', '{"id":"101","kind":"Kick","name":{"romaji":"Oroshi Uchi Kakato Geri","en":"Descending Inside Heel Kick","sv":"Nedåtgående inre hälspark"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('102', '{"id":"102","kind":"Kick","name":{"romaji":"Tobi Yoko Geri","en":"Jumping Side Kick","sv":"Hoppande sidokick"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'Kick', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('103', '{"id":"103","kind":"Strike","name":{"romaji":"Ryuto Ken Tsuki (Jodan, Chudan)","en":"Dragon Head Fist Punch (Upper, Middle Level)","sv":"Drakhuvud näveslag (övre, mellersta nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('104', '{"id":"104","kind":"Strike","name":{"romaji":"Naka Yubi Ippon Ken Tsuki (Jodan, Chudan)","en":"Middle Finger One Knuckle Punch (Upper, Middle Level)","sv":"Mellanfinger en knogleslag (övre, mellersta nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('105', '{"id":"105","kind":"Strike","name":{"romaji":"Oya Yubi Ken Uchi (Jodan, Chudan, Gedan)","en":"Thumb Fist Strike (Upper, Middle, Lower Level)","sv":"Tumme näveslag (övre, mellersta, nedre nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('106', '{"id":"106","kind":"Strike","name":{"romaji":"Hitosashi Yubi Ippon Ken Tsuki (Jodan, Chudan)","en":"Index Finger One Knuckle Punch (Upper, Middle Level)","sv":"Pekfinger en knogleslag (övre, mellersta nivå)"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'Strike', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
VALUES ('107', '{"id":"107","kind":"Fighting","name":{"romaji":"Jiyu Kumite (fri fighting) 20 ronder x 2 minuter","en":"Free Sparring 20 rounds x 2 minutes","sv":"Fri sparring 20 ronder x 2 minuter"},"mediaIds":[],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'Fighting', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  kind = excluded.kind,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('1', '{"id":"1","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":11,"name":{"romaji":"","en":"Mukyu"},"beltColor":"white","sortOrder":9,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":0}', 'sys_kyokushin_main', 'Kyu', 11, 0, 'white', 9, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('2', '{"id":"2","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":10,"name":{"romaji":"","en":"10th Kyu"},"beltColor":"orange","sortOrder":10,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":1}', 'sys_kyokushin_main', 'Kyu', 10, 1, 'orange', 10, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('3', '{"id":"3","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":9,"name":{"romaji":"","en":"9th Kyu"},"beltColor":"orange","sortOrder":11,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":2}', 'sys_kyokushin_main', 'Kyu', 9, 2, 'orange', 11, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('4', '{"id":"4","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":8,"name":{"romaji":"","en":"8th Kyu"},"beltColor":"blue","sortOrder":12,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":3}', 'sys_kyokushin_main', 'Kyu', 8, 3, 'blue', 12, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('5', '{"id":"5","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":7,"name":{"romaji":"","en":"7th Kyu"},"beltColor":"blue","sortOrder":13,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":4}', 'sys_kyokushin_main', 'Kyu', 7, 4, 'blue', 13, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('6', '{"id":"6","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":6,"name":{"romaji":"","en":"6th Kyu"},"beltColor":"yellow","sortOrder":14,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":5}', 'sys_kyokushin_main', 'Kyu', 6, 5, 'yellow', 14, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('7', '{"id":"7","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":5,"name":{"romaji":"","en":"5th Kyu"},"beltColor":"yellow","sortOrder":15,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":6}', 'sys_kyokushin_main', 'Kyu', 5, 6, 'yellow', 15, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('8', '{"id":"8","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":4,"name":{"romaji":"","en":"4th Kyu"},"beltColor":"green","sortOrder":16,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":7}', 'sys_kyokushin_main', 'Kyu', 4, 7, 'green', 16, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('9', '{"id":"9","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":3,"name":{"romaji":"","en":"3rd Kyu"},"beltColor":"green","sortOrder":17,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":8}', 'sys_kyokushin_main', 'Kyu', 3, 8, 'green', 17, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('10', '{"id":"10","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":2,"name":{"romaji":"","en":"2nd Kyu"},"beltColor":"brown","sortOrder":18,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":9}', 'sys_kyokushin_main', 'Kyu', 2, 9, 'brown', 18, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('11', '{"id":"11","gradingSystemId":"sys_kyokushin_main","kind":"Kyu","number":1,"name":{"romaji":"","en":"1st Kyu"},"beltColor":"brown","sortOrder":19,"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z","rank":10}', 'sys_kyokushin_main', 'Kyu', 1, 10, 'brown', 19, 'published', '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('12', '{"id":"12","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":1,"name":{"romaji":"Shodan","en":"1st Dan"},"beltColor":"black","sortOrder":101,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":11}', 'sys_kyokushin_main', 'Dan', 1, 11, 'black', 101, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('13', '{"id":"13","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":2,"name":{"romaji":"Nidan","en":"2nd Dan"},"beltColor":"black","sortOrder":102,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":12}', 'sys_kyokushin_main', 'Dan', 2, 12, 'black', 102, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('14', '{"id":"14","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":3,"name":{"romaji":"Sandan","en":"3rd Dan"},"beltColor":"black","sortOrder":103,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":13}', 'sys_kyokushin_main', 'Dan', 3, 13, 'black', 103, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('15', '{"id":"15","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":4,"name":{"romaji":"Yondan","en":"4th Dan"},"beltColor":"black","sortOrder":104,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":14}', 'sys_kyokushin_main', 'Dan', 4, 14, 'black', 104, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('16', '{"id":"16","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":5,"name":{"romaji":"Godan","en":"5th Dan"},"beltColor":"black","sortOrder":105,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":15}', 'sys_kyokushin_main', 'Dan', 5, 15, 'black', 105, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('17', '{"id":"17","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":6,"name":{"romaji":"Rokudan","en":"6th Dan"},"beltColor":"black","sortOrder":106,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":16}', 'sys_kyokushin_main', 'Dan', 6, 16, 'black', 106, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('18', '{"id":"18","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":7,"name":{"romaji":"Shichidan","en":"7th Dan"},"beltColor":"black","sortOrder":107,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":17}', 'sys_kyokushin_main', 'Dan', 7, 17, 'black', 107, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('19', '{"id":"19","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":8,"name":{"romaji":"Hachidan","en":"8th Dan"},"beltColor":"black","sortOrder":108,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":18}', 'sys_kyokushin_main', 'Dan', 8, 18, 'black', 108, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('20', '{"id":"20","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":9,"name":{"romaji":"Kudan","en":"9th Dan"},"beltColor":"black","sortOrder":109,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":19}', 'sys_kyokushin_main', 'Dan', 9, 19, 'black', 109, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
VALUES ('21', '{"id":"21","gradingSystemId":"sys_kyokushin_main","kind":"Dan","number":10,"name":{"romaji":"Judan","en":"10th Dan"},"beltColor":"black","sortOrder":110,"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z","rank":20}', 'sys_kyokushin_main', 'Dan', 10, 20, 'black', 110, 'published', '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  grading_system_id = excluded.grading_system_id,
  kind = excluded.kind,
  number = excluded.number,
  rank = excluded.rank,
  belt_color = excluded.belt_color,
  sort_order = excluded.sort_order,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('1', '{"id":"1","name":{"romaji":"Taikyoku Sono Ichi","ja":"太極その一","en":"First Cause/Grand Ultimate 1","sv":"Första Orsak/Det Stora Ultimata 1"},"detailedDescription":{"en":"Basic kata focusing on fundamental movements and stances."},"mediaIds":["media_yt_5Q4nn8VeOCE"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('2', '{"id":"2","name":{"romaji":"Taikyoku Sono Ni","ja":"太極その二","en":"First Cause/Grand Ultimate 2","sv":"Första Orsak/Det Stora Ultimata 2"},"detailedDescription":{"en":"Builds upon Taikyoku Sono Ichi with increased complexity."},"mediaIds":["media_yt_uZK9TXhlJmA"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('3', '{"id":"3","name":{"romaji":"Taikyoku Sono San","ja":"太極その三","en":"First Cause/Grand Ultimate 3","sv":"Första Orsak/Det Stora Ultimata 3"},"detailedDescription":{"en":"Increased complexity with more dynamic movements."},"mediaIds":["media_yt_dlcuesWb610"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('4', '{"id":"4","name":{"romaji":"Pinan Sono Ichi","ja":"平安その一","en":"Peaceful Mind 1","sv":"Fridfullt Sinne 1"},"detailedDescription":{"en":"Focuses on basic techniques and movements."},"mediaIds":["media_yt_7H0cOOeEm10"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('5', '{"id":"5","name":{"romaji":"Pinan Sono Ni","ja":"平安その二","en":"Peaceful Mind 2","sv":"Fridfullt Sinne 2"},"detailedDescription":{"en":"Introduces more intermediate techniques and stances."},"mediaIds":["media_yt_RZjPbhuAnuo"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('6', '{"id":"6","name":{"romaji":"Pinan Sono San","ja":"平安その三","en":"Peaceful Mind 3","sv":"Fridfullt Sinne 3"},"detailedDescription":{"en":"Continues to build complexity from the previous Pinan katas."},"mediaIds":["media_yt_cVue7gmbD_c"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('7', '{"id":"7","name":{"romaji":"Sanchin","ja":"三戦","en":"Three Battles","sv":"Tre Strider"},"detailedDescription":{"en":"Focuses on breathing, posture, and strength with isometric tension."},"mediaIds":["media_yt_rovuL25INEs"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('8', '{"id":"8","name":{"romaji":"Sokugi Taikyoku Sono Ichi","ja":"足技太極その一","en":"First Basic Kicking Form","sv":"Första Grundläggande Sparkform"},"detailedDescription":{"en":"Focuses on basic kicks and their application in sequences."},"mediaIds":["media_yt_tesJTD8_VWk"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('9', '{"id":"9","name":{"romaji":"Sokugi Taikyoku Sono Ni","ja":"足技太極その二","en":"Second Basic Kicking Form","sv":"Andra Grundläggande Sparkform"},"detailedDescription":{"en":"Introduces additional kicks and emphasizes agility."},"mediaIds":["media_yt_HIamTik0ihk"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('10', '{"id":"10","name":{"romaji":"Sokugi Taikyoku Sono San","ja":"足技太極その三","en":"Third Basic Kicking Form","sv":"Tredje Grundläggande Sparkform"},"detailedDescription":{"en":"Focuses on combinations of various kicks with precision."},"mediaIds":["media_yt_FBy9C36khkQ"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('11', '{"id":"11","name":{"romaji":"Pinan Sono Yon","ja":"平安その四","en":"Peaceful Mind 4","sv":"Fridfullt Sinne 4"},"detailedDescription":{"en":"Contains more advanced movements and combinations."},"mediaIds":["media_yt_XOcecjcYEcg"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('12', '{"id":"12","name":{"romaji":"Pinan Sono Go","ja":"平安その五","en":"Peaceful Mind 5","sv":"Fridfullt Sinne 5"},"detailedDescription":{"en":"The most complex of the Pinan katas, emphasizing agility and power."},"mediaIds":["media_yt_-2LFjcWakuI"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('13', '{"id":"13","name":{"romaji":"Gekisai Dai","ja":"撃砕大","en":"Attack and Smash","sv":"Anfall och Krossa"},"detailedDescription":{"en":"Emphasizes powerful, smashing techniques and strong stances."},"mediaIds":["media_yt_5JV8-to2BO0"],"status":"published","createdAt":"2025-12-17T22:47:54.234Z","updatedAt":"2025-12-17T22:47:54.234Z"}', 'published', NULL, '2025-12-17T22:47:54.234Z', '2025-12-17T22:47:54.234Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('14', '{"id":"14","name":{"romaji":"Yantsu","ja":"安三","en":"Keep Pure","sv":"Håll Ren"},"detailedDescription":{"en":"Focuses on precision, control, and defensive techniques."},"mediaIds":["media_yt_2lsDALXMUz0"],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('15', '{"id":"15","name":{"romaji":"Tsuki No Kata","ja":"突きの型","en":"Punching Form","sv":"Slagform"},"detailedDescription":{"en":"Dedicated to hand strikes and basic blocks."},"mediaIds":["media_yt_jDwHxDIRKNI"],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('16', '{"id":"16","name":{"romaji":"Saiha or Saifa","ja":"砕破","en":"Maximum Destruction","sv":"Maximal Förstörelse"},"detailedDescription":{"en":"Involves breaking through the opponent''s defense with powerful strikes."},"mediaIds":["media_yt_6z2xFl3sGKc"],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('17', '{"id":"17","name":{"romaji":"Kanku Dai or Kanku","ja":"観空大","en":"Viewing the Sky","sv":"Betrakta Himlen"},"detailedDescription":{"en":"Long and complex kata focusing on various techniques and fluid movements."},"mediaIds":["media_yt_GSEEDN7J6Xc"],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('18', '{"id":"18","name":{"romaji":"Gekisai Sho","ja":"撃砕小","en":"Attack and Smash Minor","sv":"Anfall och Krossa Liten"},"detailedDescription":{"en":"Similar to Gekisai Dai but with small variations in techniques and timing."},"mediaIds":["media_yt_HHhE4d1Vn4Q"],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('19', '{"id":"19","name":{"romaji":"Seienchin","ja":"制引戦","en":"Control in Battle","sv":"Kontroll i Strid"},"detailedDescription":{"en":"Focuses on strong stances, body conditioning, and endurance."},"mediaIds":["media_yt_YifGmQpBXgY"],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('20', '{"id":"20","name":{"romaji":"Sushiho","ja":"五十四歩","en":"54 Steps","sv":"54 Steg"},"detailedDescription":{"en":"Emphasizes quick movements, agility, and strategic techniques."},"mediaIds":["media_yt_S2KjEHxyfQY"],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('21', '{"id":"21","name":{"romaji":"Garyu","ja":"臥竜","en":"Reclining Dragon","sv":"Liggande Drake"},"detailedDescription":{"en":"Depicts the movements of a reclining dragon, focusing on agility and power."},"mediaIds":["media_yt_pql4QvFxSo8"],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
VALUES ('22', '{"id":"22","name":{"romaji":"Seipai","ja":"十八手","en":"18 Steps","sv":"18 Steg"},"detailedDescription":{"en":"Contains 18 steps, emphasizing a mix of hard and soft techniques."},"mediaIds":["media_yt_zQ-6gj0CY9g"],"status":"published","createdAt":"2025-12-17T22:47:54.235Z","updatedAt":"2025-12-17T22:47:54.235Z"}', 'published', NULL, '2025-12-17T22:47:54.235Z', '2025-12-17T22:47:54.235Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  status = excluded.status,
  rank = excluded.rank,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

DELETE FROM grade_techniques;

DELETE FROM grade_katas;

INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('2', '1', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('2', '2', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('2', '3', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('2', '4', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('2', '5', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('2', '6', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('2', '7', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('2', '8', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('2', '9', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '10', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '11', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '12', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '13', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '14', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '15', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '16', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '17', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '18', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '19', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('3', '20', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('3', '1', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('3', '2', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('4', '21', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('4', '22', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('4', '23', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('4', '24', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('4', '25', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('4', '26', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('4', '27', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('4', '3', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '28', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '29', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '30', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '31', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '32', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '33', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '34', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '35', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '36', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '37', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '38', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '39', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '40', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('5', '41', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('5', '4', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '42', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '43', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '44', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '45', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '46', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '47', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '48', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '49', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '50', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '51', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '52', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('6', '53', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('6', '5', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('7', '54', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('7', '55', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('7', '56', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('7', '57', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('7', '58', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('7', '59', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('7', '60', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('7', '6', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '61', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '62', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '63', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '64', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '65', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '66', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '67', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '68', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '69', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '70', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '71', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '72', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '73', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '74', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '75', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '76', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '77', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('8', '78', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('8', '7', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('8', '8', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('8', '9', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('8', '10', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('9', '79', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('9', '80', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('9', '81', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('9', '82', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('9', '83', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('9', '84', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('9', '85', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('9', '86', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('9', '11', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '87', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '88', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '89', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '90', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '91', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '92', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '93', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '94', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '95', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('10', '96', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('10', '12', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('10', '13', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '97', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '98', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '99', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '100', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '101', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '102', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '103', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '104', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '105', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '106', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_techniques (grade_id, technique_id, created_at)
VALUES ('11', '107', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, technique_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('11', '14', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('11', '15', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('12', '16', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('13', '17', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('13', '18', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('13', '19', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('14', '20', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('14', '21', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
INSERT INTO grade_katas (grade_id, kata_id, created_at)
VALUES ('14', '22', '2025-12-31T10:46:27.893Z')
ON CONFLICT(grade_id, kata_id) DO NOTHING;
