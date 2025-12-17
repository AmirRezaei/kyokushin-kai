// file: src/app/ten-thousand-days/kyokushinRankRequirements.ts
export type KyokushinRankKind = 'kyu' | 'dan';

export interface KyokushinRankRequirement {
  /** Internal id, e.g. '10_kyu', '1_dan'. */
  id: string;
  /** Human-readable name, e.g. '10 kyu (orange belt)'. */
  name: string;
  /** 'kyu' or 'dan'. */
  kind: KyokushinRankKind;
  /** Numeric kyu (10–1) or dan (1–5). */
  level: number;
  /**
   * Minimum age in full years, if specified in SKK rules.
   * For most kyu grades this is not explicitly specified, so we use null.
   */
  minAgeYears: number | null;
  /** Minimum time since previous grading, in whole months, if specified. */
  minTimeFromPreviousMonths: number | null;
  /**
   * Minimum number of training sessions since previous grading, if specified.
   * For dan grades SKK specifies time (years) but not a fixed session count, so we use null.
   */
  minSessionsFromPrevious: number | null;
}

/**
 * Adult kyu & dan requirements according to Swedish Kyokushin (SKK):
 *
 * - 10–4 kyu: 3 months + 25 pass mellan grader :contentReference[oaicite:1]{index=1}
 * - 3–1 kyu: 6 months + 50 pass mellan grader :contentReference[oaicite:2]{index=2}
 * - 1 dan (shodan): 12 months from 1 kyu; min ålder 18 år :contentReference[oaicite:3]{index=3}
 * - 1→2 dan: 2 år, min 20 år
 * - 2→3 dan: 3 år, min 25 år
 * - 3→4 dan: 4 år, min 30 år
 * - 4→5 dan: 5 år, min 35 år :contentReference[oaicite:4]{index=4}
 */
export const KYOKUSHIN_SKK_ADULT_RANK_REQUIREMENTS: ReadonlyArray<KyokushinRankRequirement> =
  [
    // KYU – color belts
    {
      id: '10_kyu',
      name: '10 kyu (orange belt)',
      kind: 'kyu',
      level: 10,
      minAgeYears: null,
      minTimeFromPreviousMonths: 3,
      minSessionsFromPrevious: 25,
    },
    {
      id: '9_kyu',
      name: '9 kyu (orange belt – 1 stripe)',
      kind: 'kyu',
      level: 9,
      minAgeYears: null,
      minTimeFromPreviousMonths: 3,
      minSessionsFromPrevious: 25,
    },
    {
      id: '8_kyu',
      name: '8 kyu (blue belt)',
      kind: 'kyu',
      level: 8,
      minAgeYears: null,
      minTimeFromPreviousMonths: 3,
      minSessionsFromPrevious: 25,
    },
    {
      id: '7_kyu',
      name: '7 kyu (blue belt – 1 stripe)',
      kind: 'kyu',
      level: 7,
      minAgeYears: null,
      minTimeFromPreviousMonths: 3,
      minSessionsFromPrevious: 25,
    },
    {
      id: '6_kyu',
      name: '6 kyu (yellow belt)',
      kind: 'kyu',
      level: 6,
      minAgeYears: null,
      minTimeFromPreviousMonths: 3,
      minSessionsFromPrevious: 25,
    },
    {
      id: '5_kyu',
      name: '5 kyu (yellow belt – 1 stripe)',
      kind: 'kyu',
      level: 5,
      minAgeYears: null,
      minTimeFromPreviousMonths: 3,
      minSessionsFromPrevious: 25,
    },
    {
      id: '4_kyu',
      name: '4 kyu (green belt)',
      kind: 'kyu',
      level: 4,
      minAgeYears: null,
      minTimeFromPreviousMonths: 3,
      minSessionsFromPrevious: 25,
    },
    {
      id: '3_kyu',
      name: '3 kyu (green belt – 1 stripe)',
      kind: 'kyu',
      level: 3,
      minAgeYears: null,
      minTimeFromPreviousMonths: 6,
      minSessionsFromPrevious: 50,
    },
    {
      id: '2_kyu',
      name: '2 kyu (brown belt)',
      kind: 'kyu',
      level: 2,
      minAgeYears: null,
      minTimeFromPreviousMonths: 6,
      minSessionsFromPrevious: 50,
    },
    {
      id: '1_kyu',
      name: '1 kyu (brown belt – 1 stripe)',
      kind: 'kyu',
      level: 1,
      minAgeYears: null,
      minTimeFromPreviousMonths: 6,
      minSessionsFromPrevious: 50,
    },

    // DAN – black belts
    {
      id: '1_dan',
      name: '1 dan (shodan, black belt)',
      kind: 'dan',
      level: 1,
      minAgeYears: 18, // SKK minimum age for shodan
      minTimeFromPreviousMonths: 12, // 1 year from 1 kyu
      minSessionsFromPrevious: null, // not specified as a fixed number in SKK docs
    },
    {
      id: '2_dan',
      name: '2 dan',
      kind: 'dan',
      level: 2,
      minAgeYears: 20,
      minTimeFromPreviousMonths: 24, // 2 years from 1 dan
      minSessionsFromPrevious: null,
    },
    {
      id: '3_dan',
      name: '3 dan',
      kind: 'dan',
      level: 3,
      minAgeYears: 25,
      minTimeFromPreviousMonths: 36, // 3 years from 2 dan
      minSessionsFromPrevious: null,
    },
    {
      id: '4_dan',
      name: '4 dan',
      kind: 'dan',
      level: 4,
      minAgeYears: 30,
      minTimeFromPreviousMonths: 48, // 4 years from 3 dan
      minSessionsFromPrevious: null,
    },
    {
      id: '5_dan',
      name: '5 dan',
      kind: 'dan',
      level: 5,
      minAgeYears: 35,
      minTimeFromPreviousMonths: 60, // 5 years from 4 dan
      minSessionsFromPrevious: null,
    },
  ] as const;