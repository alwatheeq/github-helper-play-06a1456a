// Module declarations for JavaScript files without type definitions
declare module 'html2pdf.js' {
  const html2pdf: any;
  export default html2pdf;
}

declare module '../../utils/fileProcessor.js' {
  export function extractTextFromFile(...args: any[]): any;
  export default extractTextFromFile;
}

declare module '../../utils/queueProcessor.js' {
  export function processSummaryBatches(...args: any[]): any;
  export function processFlashcardBatches(...args: any[]): any;
  export function determineProcessingMode(...args: any[]): any;
}

declare module '../../utils/medicalQueueProcessor.js' {
  export function processMedicalContent(...args: any[]): any;
  export function determineMedicalProcessingMode(...args: any[]): any;
}

declare module '../../utils/translation.js' {
  export function translateContent(...args: any[]): any;
  export function needsTranslation(...args: any[]): any;
  export const AVAILABLE_LANGUAGES: any;
}

declare module '../../utils/translation' {
  export function translateContent(...args: any[]): any;
  export function needsTranslation(...args: any[]): any;
  export const AVAILABLE_LANGUAGES: any;
}

declare module '../../utils/deduplication.js' {
  export function normalizeText(...args: any[]): any;
  export function generateTextHash(...args: any[]): any;
  export function checkCache(...args: any[]): any;
  export function storeInCache(...args: any[]): any;
  export const PREDEFINED_TOPICS: any;
}

declare module '../../utils/haikuClient.js' {
  const haikuClient: any;
  export default haikuClient;
}

declare module '../../utils/cleanupService.js' {
  const cleanupService: any;
  export default cleanupService;
}

declare module '../../utils/config.js' {
  const config: any;
  export default config;
}

declare module '../../utils/medStudentClient.js' {
  export function isMedStudentMode(...args: any[]): any;
  export default isMedStudentMode;
}
