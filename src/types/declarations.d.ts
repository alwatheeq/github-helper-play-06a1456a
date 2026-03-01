// Module declarations for dependencies without type definitions

// Radix UI components (not installed, need declarations)
declare module '@radix-ui/react-accordion' { const m: any; export default m; export const Root: any; export const Item: any; export const Header: any; export const Trigger: any; export const Content: any; }
declare module '@radix-ui/react-alert-dialog' { const m: any; export default m; export const Root: any; export const Trigger: any; export const Portal: any; export const Overlay: any; export const Content: any; export const Header: any; export const Footer: any; export const Title: any; export const Description: any; export const Action: any; export const Cancel: any; }
declare module '@radix-ui/react-aspect-ratio' { const m: any; export default m; export const Root: any; }
declare module '@radix-ui/react-avatar' { const m: any; export default m; export const Root: any; export const Image: any; export const Fallback: any; }
declare module '@radix-ui/react-checkbox' { const m: any; export default m; export const Root: any; export const Indicator: any; }
declare module '@radix-ui/react-collapsible' { const m: any; export default m; export const Root: any; export const Trigger: any; export const Content: any; export const Collapsible: any; export const CollapsibleTrigger: any; export const CollapsibleContent: any; }
declare module '@radix-ui/react-context-menu' { const m: any; export default m; export const Root: any; export const Trigger: any; export const Portal: any; export const Content: any; export const Item: any; export const CheckboxItem: any; export const RadioItem: any; export const ItemIndicator: any; export const Label: any; export const Separator: any; export const Sub: any; export const SubTrigger: any; export const SubContent: any; export const Group: any; export const RadioGroup: any; }
declare module '@radix-ui/react-dialog' { const m: any; export default m; export const Root: any; export const Trigger: any; export const Portal: any; export const Overlay: any; export const Content: any; export const Header: any; export const Footer: any; export const Title: any; export const Description: any; export const Close: any; export type DialogProps = any; }
declare module '@radix-ui/react-dropdown-menu' { const m: any; export default m; export const Root: any; export const Trigger: any; export const Portal: any; export const Content: any; export const Item: any; export const CheckboxItem: any; export const RadioItem: any; export const ItemIndicator: any; export const Label: any; export const Separator: any; export const Sub: any; export const SubTrigger: any; export const SubContent: any; export const Group: any; export const RadioGroup: any; }
declare module '@radix-ui/react-hover-card' { const m: any; export default m; export const Root: any; export const Trigger: any; export const Content: any; }
declare module '@radix-ui/react-label' { const m: any; export default m; export const Root: any; }
declare module '@radix-ui/react-menubar' { const m: any; export default m; export const Root: any; export const Menu: any; export const Trigger: any; export const Portal: any; export const Content: any; export const Item: any; export const CheckboxItem: any; export const RadioItem: any; export const ItemIndicator: any; export const Label: any; export const Separator: any; export const Sub: any; export const SubTrigger: any; export const SubContent: any; export const Group: any; export const RadioGroup: any; }
declare module '@radix-ui/react-navigation-menu' { const m: any; export default m; export const Root: any; export const List: any; export const Item: any; export const Trigger: any; export const Content: any; export const Link: any; export const Viewport: any; export const Indicator: any; }
declare module '@radix-ui/react-popover' { const m: any; export default m; export const Root: any; export const Trigger: any; export const Portal: any; export const Content: any; export const Anchor: any; export const Close: any; export const Arrow: any; }
declare module '@radix-ui/react-progress' { const m: any; export default m; export const Root: any; export const Indicator: any; }
declare module '@radix-ui/react-radio-group' { const m: any; export default m; export const Root: any; export const Item: any; export const Indicator: any; }
declare module '@radix-ui/react-scroll-area' { const m: any; export default m; export const Root: any; export const Viewport: any; export const ScrollAreaScrollbar: any; export const ScrollAreaThumb: any; export const Corner: any; }
declare module '@radix-ui/react-select' { const m: any; export default m; export const Root: any; export const Group: any; export const Value: any; export const Trigger: any; export const Content: any; export const Viewport: any; export const Label: any; export const Item: any; export const ItemText: any; export const ItemIndicator: any; export const Separator: any; export const ScrollUpButton: any; export const ScrollDownButton: any; export const Icon: any; export const Portal: any; }
declare module '@radix-ui/react-separator' { const m: any; export default m; export const Root: any; }
declare module '@radix-ui/react-slider' { const m: any; export default m; export const Root: any; export const Track: any; export const Range: any; export const Thumb: any; }
declare module '@radix-ui/react-switch' { const m: any; export default m; export const Root: any; export const Thumb: any; }
declare module '@radix-ui/react-tabs' { const m: any; export default m; export const Root: any; export const List: any; export const Trigger: any; export const Content: any; }
declare module '@radix-ui/react-toast' { const m: any; export default m; export const Provider: any; export const Root: any; export const Action: any; export const Close: any; export const Viewport: any; export const Title: any; export const Description: any; export type ToastActionElement = any; export type ToastProps = any; }
declare module '@radix-ui/react-toggle' { const m: any; export default m; export const Root: any; }
declare module '@radix-ui/react-toggle-group' { const m: any; export default m; export const Root: any; export const Item: any; }
declare module '@radix-ui/react-tooltip' { const m: any; export default m; export const Provider: any; export const Root: any; export const Trigger: any; export const Content: any; }

// Third-party component libraries (not installed)
declare module 'cmdk' { export const Command: any; }
declare module 'embla-carousel-react' { export type UseEmblaCarouselType = [any, any]; const useEmblaCarousel: any; export default useEmblaCarousel; }
declare module 'input-otp' { export const OTPInput: any; export const OTPInputContext: any; export const REGEXP_ONLY_DIGITS_AND_CHARS: any; }
declare module 'next-themes' { export function useTheme(): any; }
declare module 'react-day-picker' { export const DayPicker: any; export type DayPickerProps = any; }
declare module 'react-hook-form' { export const Controller: any; export type ControllerProps<A = any, B = any, C = any> = any; export type FieldPath<T = any> = any; export type FieldValues = any; export const FormProvider: any; export function useFormContext(): any; }
declare module 'react-resizable-panels' { export const Panel: any; export const PanelGroup: any; export const PanelResizeHandle: any; }
declare module 'recharts' { export const ResponsiveContainer: any; export const BarChart: any; export const Bar: any; export const XAxis: any; export const YAxis: any; export const CartesianGrid: any; export const Tooltip: any; export const Legend: any; export const LineChart: any; export const Line: any; export const PieChart: any; export const Pie: any; export const Cell: any; export const AreaChart: any; export const Area: any; }
declare namespace RechartsPrimitive { type Config = any; type LegendProps = any; }
declare module 'sonner' { export function toast(...args: any[]): any; export const Toaster: any; }
declare module 'vaul' { export const Drawer: any; }

// Project JS modules
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
  export const PREDEFINED_TOPICS: any;
}

declare module '../../utils/medStudentClient.js' {
  export function isMedStudentMode(...args: any[]): any;
  export default isMedStudentMode;
}
