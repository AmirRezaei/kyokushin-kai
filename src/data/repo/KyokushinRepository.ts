
// import { convertLegacyData } from './legacy_converter';
import catalogData from './catalog.json';
import { GradeRecord } from '../model/grade';
import { TechniqueRecord } from '../model/technique';
import { KataRecord } from '../model/kata';
import { KarateCatalogStore } from '../model/catalogStore';

// Singleton instance (static data)
const _store: KarateCatalogStore = catalogData.store as unknown as KarateCatalogStore;
const _curriculum: Record<string, { techIds: string[], kataIds: string[] }> = catalogData.curriculum;

const ensureData = () => {
    return { store: _store, curriculum: _curriculum };
};

export interface GradeWithContent extends GradeRecord {
    techniques: TechniqueRecord[];
    katas: KataRecord[];
}

export const KyokushinRepository = {
    getCurriculumGrades: (): GradeWithContent[] => {
        const { store, curriculum } = ensureData();
        
        const grades = Object.values(store.grades).sort((a, b) => a.sortOrder - b.sortOrder);

        return grades.map(grade => {
            const contentIds = curriculum[grade.id];
            
            const techniques = contentIds.techIds
                .map(id => store.techniques[id])
                .filter(Boolean); // safety check

            const katas = contentIds.kataIds
                .map(id => store.katas[id])
                .filter(Boolean);

            return {
                ...grade,
                techniques,
                katas
            };
        });
    },

    getAllTechniques: (): TechniqueRecord[] => {
        const { store } = ensureData();
        return Object.values(store.techniques);
    },

    getGradeForTechnique: (techId: string): GradeWithContent | undefined => {
        const { store, curriculum } = ensureData();
        // Find grade ID containing the technique
        const gradeId = Object.keys(curriculum).find(gid => curriculum[gid].techIds.includes(techId));
        if (!gradeId) return undefined;

        const grade = store.grades[gradeId];
        const contentIds = curriculum[gradeId];
        
        return {
            ...grade,
            techniques: contentIds.techIds.map(id => store.techniques[id]).filter(Boolean),
            katas: contentIds.kataIds.map(id => store.katas[id]).filter(Boolean)
        };
    },

    getGradeForKata: (kataId: string): GradeWithContent | undefined => {
        const { store, curriculum } = ensureData();
        const gradeId = Object.keys(curriculum).find(gid => curriculum[gid].kataIds.includes(kataId));
        if (!gradeId) return undefined;

        const grade = store.grades[gradeId];
        const contentIds = curriculum[gradeId];
        
        return {
            ...grade,
            techniques: contentIds.techIds.map(id => store.techniques[id]).filter(Boolean),
            katas: contentIds.kataIds.map(id => store.katas[id]).filter(Boolean)
        };
    },

    getMedia: (mediaId: string): any | undefined => {
        const { store } = ensureData();
        return store.media[mediaId];
    }
};
