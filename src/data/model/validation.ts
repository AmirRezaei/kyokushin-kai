import { z } from 'zod';
import { GradeKind, BeltColor } from './grade';
import { TechniqueKind } from './technique';

export const LocalizedTextSchema = z.union([
    z.string(),
    z.object({
        en: z.string().optional(),
        ja: z.string().optional(),
        sv: z.string().optional(),
        romaji: z.string().optional(), 
    })
]);

// Since PublishStatus is a type alias union, we must list values explicitly
export const PublishStatusSchema = z.enum(['draft', 'published', 'inactive']);
export const ISODateTimeStringSchema = z.string().datetime();


// --- Media Schema ---

export const MediaRecordSchema = z.object({
  id: z.string(),
  kind: z.enum(['youtube', 'image', 'video', 'audio', 'link']),
  uri: z.string(),
  posterUri: z.string().optional(),
  title: LocalizedTextSchema.optional(),
  description: LocalizedTextSchema.optional(),
  credits: z.string().optional(),
  license: z.string().optional(),
  sourceIds: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']),
  createdAt: ISODateTimeStringSchema,
  updatedAt: ISODateTimeStringSchema,
});

export type MediaRecord = z.infer<typeof MediaRecordSchema>;


// --- Source Schema ---
export const SourceRecordSchema = z.object({
    id: z.string(),
    label: z.string(),
    uri: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['active', 'inactive']),
    createdAt: ISODateTimeStringSchema,
    updatedAt: ISODateTimeStringSchema,
});

// --- Term Schema ---
export const TermRecordSchema = z.object({
    id: z.string(),
    name: LocalizedTextSchema,
    aliases: z.array(LocalizedTextSchema).optional(),
    tags: z.array(z.string()).optional(),
    definition: LocalizedTextSchema.optional(),
    status: PublishStatusSchema,
    createdAt: ISODateTimeStringSchema,
    updatedAt: ISODateTimeStringSchema,
});


// --- Technique Schema ---

export const TechniqueRecordSchema = z.object({
  id: z.string(),
  kind: z.nativeEnum(TechniqueKind),
  rank: z.number().optional(),
  name: LocalizedTextSchema,
  aliases: z.array(LocalizedTextSchema).optional(),
  nameParts: z.record(z.string(), z.array(z.string())).optional(),
  tags: z.array(z.string()).optional(),
  summary: LocalizedTextSchema.optional(),
  history: LocalizedTextSchema.optional(),
  detailedDescription: LocalizedTextSchema.optional(),
  relatedTermIds: z.array(z.string()).optional(),
  mediaIds: z.array(z.string()).optional(),
  sourceIds: z.array(z.string()).optional(),
  status: PublishStatusSchema,
  createdAt: ISODateTimeStringSchema,
  updatedAt: ISODateTimeStringSchema,
});

// --- Kata Schema ---

export const KataRecordSchema = z.object({
  id: z.string(),
  rank: z.number().optional(),
  name: LocalizedTextSchema,
  aliases: z.array(LocalizedTextSchema).optional(),
  familyTermIds: z.array(z.string()).optional(),
  meaning: LocalizedTextSchema.optional(),
  history: LocalizedTextSchema.optional(),
  detailedDescription: LocalizedTextSchema.optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.number().optional(),
  expectedDurationSec: z.number().optional(),
  mediaIds: z.array(z.string()).optional(),
  sourceIds: z.array(z.string()).optional(),
  status: PublishStatusSchema,
  createdAt: ISODateTimeStringSchema,
  updatedAt: ISODateTimeStringSchema,
});

// --- Grade Schema ---

export const GradeRecordSchema = z.object({
  id: z.string(),
  gradingSystemId: z.string(),
  kind: z.nativeEnum(GradeKind),
  number: z.number(),
  rank: z.number().optional(),
  name: LocalizedTextSchema,
  aliases: z.array(LocalizedTextSchema).optional(),
  beltColor: z.nativeEnum(BeltColor),
  sortOrder: z.number(),
  notes: LocalizedTextSchema.optional(),
  status: PublishStatusSchema,
  createdAt: ISODateTimeStringSchema,
  updatedAt: ISODateTimeStringSchema,
});

export const GradingSystemRecordSchema = z.object({
    id: z.string(),
    name: LocalizedTextSchema,
    description: LocalizedTextSchema.optional(),
    status: PublishStatusSchema,
    createdAt: ISODateTimeStringSchema,
    updatedAt: ISODateTimeStringSchema,
});


// --- Catalog Store Schema ---

export const KarateCatalogStoreSchema = z.object({
  terms: z.record(z.string(), TermRecordSchema),
  techniques: z.record(z.string(), TechniqueRecordSchema),
  katas: z.record(z.string(), KataRecordSchema),
  gradingSystems: z.record(z.string(), GradingSystemRecordSchema),
  grades: z.record(z.string(), GradeRecordSchema),
  media: z.record(z.string(), MediaRecordSchema),
  sources: z.record(z.string(), SourceRecordSchema),
});

// --- Full Catalog JSON Schema (including curriculum) ---
export const CatalogJsonSchema = z.object({
    store: KarateCatalogStoreSchema,
    curriculum: z.record(z.string(), z.object({
        techIds: z.array(z.string()),
        kataIds: z.array(z.string())
    }))
});

