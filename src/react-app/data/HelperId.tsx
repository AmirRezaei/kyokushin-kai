// HEADER-START
// * Path: ./src/data/HelperId.tsx
// HEADER-END

let gradeId = 0;
let techId = 0;
let kataId = 0;

export function getGradeId() {
   return (++gradeId).toString();
}
export function getTechId() {
   return (++techId).toString();
}
export function getKataId() {
   return (++kataId).toString();
}
