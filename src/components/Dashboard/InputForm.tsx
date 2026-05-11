import React, { useState, useRef, useContext } from 'react';
import { useI18n, I18nContext } from '../../contexts/I18nContext';
import { Upload, FileText, Settings, Info, Type, File, AlertCircle, X, Stethoscope, Scan, Globe } from 'lucide-react';
import { ScholarCard } from '../Scholar';
import { todo } from '../../utils/todoToast';
import { medStudentClient } from '../../utils/medStudentClient';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { useSubscription } from '../../hooks/useSubscription';
import { ErrorLogger } from '../../utils/errorLogger';
import { extractTextFromFile } from '../../utils/fileProcessor';
import type { AcademicsGenerationPreferences, QuizQuestionTypePreference } from '../../utils/academicsGenerationPreferences';
import {
  ALL_QUIZ_QUESTION_TYPES,
  DEFAULT_ACADEMICS_GENERATION_PREFERENCES,
  dashboardHasRunnableOutput,
} from '../../utils/academicsGenerationPreferences';

interface InputFormProps {
  onProcessInput: (
    input: File | string,
    flashcardCount: number,
    fromSummary: boolean,
    medicalMode?: boolean,
    useOCR?: boolean,
    generationPrefs?: AcademicsGenerationPreferences
  ) => void;
  /**
   * When true, all submission paths are short-circuited and primary CTAs are disabled.
   * Used by /scholar-preview to render the form for visual QA without triggering Supabase
   * calls, file extraction, or feature-usage tracking.
   */
  previewMode?: boolean;
}

// Internal component that uses hooks
const InputFormContent: React.FC<InputFormProps> = ({ onProcessInput, previewMode = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [fromSummary, setFromSummary] = useState(false);
  const [medicalMode, setMedicalMode] = useState(false);
  const [medicalValidation, setMedicalValidation] = useState<{ isValid: boolean; score: number; feedback: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [generationPrefs, setGenerationPrefs] = useState<AcademicsGenerationPreferences>(() => ({
    includeSummary: DEFAULT_ACADEMICS_GENERATION_PREFERENCES.includeSummary,
    includeFlashcards: DEFAULT_ACADEMICS_GENERATION_PREFERENCES.includeFlashcards,
    quizQuestionTypes: [...DEFAULT_ACADEMICS_GENERATION_PREFERENCES.quizQuestionTypes],
  }));
  const [inputMode, setInputMode] = useState<'file' | 'text' | 'ocr' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const ocrFileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'error' }>({
    show: false,
    message: '',
    type: 'error'
  });
  const { canAccessFeature, trackFeatureUsage } = useFeatureAccess();
  const { hasActiveSubscription } = useSubscription();

  // Auto-dismiss notification
  React.useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message: string) => {
    setNotification({ show: true, message, type: 'error' });
  };

  // Validate medical content when text changes
  React.useEffect(() => {
    if (previewMode) return;
    const validateContent = async () => {
      if (medicalMode && textInput.trim().length > 100) {
        try {
          const validation = await medStudentClient.validateMedicalContent(textInput);
          setMedicalValidation(validation);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          ErrorLogger.error(err, { component: 'InputForm', action: 'validateMedicalContent', textLength: textInput.length });
          setMedicalValidation(null);
        }
      } else {
        setMedicalValidation(null);
      }
    };

    const timeoutId = setTimeout(validateContent, 500); // Debounce validation
    return () => clearTimeout(timeoutId);
  }, [textInput, medicalMode, previewMode]);

  React.useEffect(() => {
    if (!generationPrefs.includeSummary && fromSummary) {
      setFromSummary(false);
    }
  }, [generationPrefs.includeSummary, fromSummary]);

  const toggleDashboardQuizType = (qt: QuizQuestionTypePreference) => {
    setGenerationPrefs((prev) => {
      const has = prev.quizQuestionTypes.includes(qt);
      const next = has ? prev.quizQuestionTypes.filter((x) => x !== qt) : [...prev.quizQuestionTypes, qt];
      return { ...prev, quizQuestionTypes: next };
    });
  };

  const assertRunnablePrefs = (): boolean => {
    if (!dashboardHasRunnableOutput(generationPrefs)) {
      showNotification(t('dashboard.error_generation_prefs_required'));
      return false;
    }
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (previewMode) { e.preventDefault(); return; }
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      ErrorLogger.debug('Files dropped', { component: 'InputForm', action: 'handleDrop', fileCount: files.length });
      if (files.length === 1) {
        // Single file: use original flow (pass File to Dashboard)
        handleFile(files[0]).catch(error => {
          const err = error instanceof Error ? error : new Error(String(error));
          ErrorLogger.error(err, { component: 'InputForm', action: 'handleDrop', fileName: files[0].name });
          showNotification('Error processing file. Please try again.');
        });
      } else {
        // Multiple files: extract and combine
        handleFiles(files);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previewMode) { e.preventDefault(); return; }
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      ErrorLogger.debug('Files selected', { component: 'InputForm', action: 'handleChange', fileCount: files.length });
      if (files.length === 1) {
        // Single file: use original flow (pass File to Dashboard)
        handleFile(files[0]).catch(error => {
          const err = error instanceof Error ? error : new Error(String(error));
          ErrorLogger.error(err, { component: 'InputForm', action: 'handleChange', fileName: files[0].name });
          showNotification('Error processing file. Please try again.');
        });
      } else {
        // Multiple files: extract and combine
        handleFiles(files);
      }
    }
  };

  const handleFiles = async (files: File[]) => {
    if (previewMode) return;
    if (files.length === 0) return;
    if (!assertRunnablePrefs()) return;

    if (!hasActiveSubscription()) {
      showNotification('Please subscribe to process files');
      return;
    }

    if (!canAccessFeature('summary_generation')) {
      showNotification('You have used your trial limit for this feature. Please upgrade to continue.');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // Validate all files
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        showNotification(`${file.name}: ${t('dashboard.alert_invalid_file_type')}`);
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showNotification(`${file.name}: ${t('dashboard.alert_file_too_large')}`);
        return;
      }
    }

    await trackFeatureUsage('summary_generation');
    
    // Process all files and combine text
    try {
      const extractedTexts: string[] = [];
      
      // Process files sequentially to avoid overwhelming the system
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Extract text with progress callback (no-op for now, progress handled in Dashboard)
          const extractedData = await extractTextFromFile(file, () => {
            // Progress callback - can be used to update UI if needed
          });
          
          if (extractedData && extractedData.text && extractedData.text.trim()) {
            extractedTexts.push(extractedData.text);
          } else {
            ErrorLogger.warn('No text extracted from file', { 
              component: 'InputForm', 
              action: 'handleFiles', 
              fileName: file.name 
            });
          }
        } catch (fileError) {
          const err = fileError instanceof Error ? fileError : new Error(String(fileError));
          ErrorLogger.error(err, { 
            component: 'InputForm', 
            action: 'handleFiles', 
            fileName: file.name,
            fileIndex: i 
          });
          // Continue with other files even if one fails
          showNotification(`Error processing ${file.name}: ${err.message}`);
        }
      }
      
      if (extractedTexts.length === 0) {
        showNotification('No text could be extracted from the selected files.');
        return;
      }
      
      // Combine all text with double newlines between files
      const combinedText = extractedTexts.join('\n\n');
      
      // Pass combined text as string to onProcessInput
      onProcessInput(combinedText, flashcardCount, fromSummary, medicalMode, false, generationPrefs);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'InputForm', action: 'handleFiles', fileCount: files.length });
      showNotification('Error processing files. Please try again.');
    }
  };

  const handleFile = async (file: File) => {
    if (previewMode) return;
    try {
      ErrorLogger.debug('Processing single file', { component: 'InputForm', action: 'handleFile', fileName: file.name, fileType: file.type, fileSize: file.size });

      if (!assertRunnablePrefs()) return;

      if (!hasActiveSubscription()) {
        showNotification('Please subscribe to process files');
        return;
      }

      if (!canAccessFeature('summary_generation')) {
        showNotification('You have used your trial limit for this feature. Please upgrade to continue.');
        return;
      }

      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        showNotification(t('dashboard.alert_invalid_file_type'));
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showNotification(t('dashboard.alert_file_too_large'));
        return;
      }

      await trackFeatureUsage('summary_generation');
      ErrorLogger.debug('Calling onProcessInput with file', { component: 'InputForm', action: 'handleFile', fileName: file.name });
      onProcessInput(file, flashcardCount, fromSummary, medicalMode, false, generationPrefs);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'InputForm', action: 'handleFile', fileName: file.name });
      showNotification('Error processing file. Please try again.');
    }
  };

  const handleOCRFile = async (file: File) => {
    if (previewMode) return;
    if (!assertRunnablePrefs()) return;

    if (!hasActiveSubscription()) {
      showNotification('Please subscribe to process images with OCR');
      return;
    }

    if (!canAccessFeature('summary_generation')) {
      showNotification('You have used your trial limit for this feature. Please upgrade to continue.');
      return;
    }

    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/bmp',
      'image/tiff',
      'image/gif',
    ];

    if (!allowedImageTypes.includes(file.type)) {
      showNotification('Invalid file type for OCR. Please upload an image (JPG, PNG, BMP, TIFF, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit for images
      showNotification('File too large. Maximum size is 10MB for images.');
      return;
    }

    await trackFeatureUsage('summary_generation');
    onProcessInput(file, flashcardCount, fromSummary, medicalMode, true, generationPrefs);
  };

  const handleOCRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previewMode) { e.preventDefault(); return; }
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleOCRFile(e.target.files[0]);
    }
  };

  const handleOCRDrop = (e: React.DragEvent) => {
    if (previewMode) { e.preventDefault(); return; }
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleOCRFile(e.dataTransfer.files[0]);
    }
  };

  const handleTextSubmit = async () => {
    if (previewMode) return;
    if (!assertRunnablePrefs()) return;

    if (!hasActiveSubscription()) {
      showNotification('Please subscribe to process text');
      return;
    }

    if (!canAccessFeature('summary_generation')) {
      showNotification('You have used your trial limit for this feature. Please upgrade to continue.');
      return;
    }

    if (!textInput.trim()) {
      showNotification(t('dashboard.alert_empty_text'));
      return;
    }

    if (textInput.trim().length < 100) {
      showNotification(t('dashboard.alert_short_text'));
      return;
    }

    if (textInput.length > 100000) {
      showNotification(t('dashboard.alert_long_text'));
      return;
    }

    // Additional validation for medical mode
    if (medicalMode && medicalValidation && !medicalValidation.isValid) {
      showNotification(`Medical Mode: ${medicalValidation.feedback}`);
      return;
    }

    await trackFeatureUsage('summary_generation');
    onProcessInput(textInput, flashcardCount, fromSummary, medicalMode, false, generationPrefs);
  };

  // Tab button helper — hairline tab strip, active = gold underline
  const tabBtnCls = (active: boolean) =>
    `flex items-center gap-2 px-1 pb-3 -mb-px border-b-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
      active
        ? 'border-accent-gold text-ink dark:text-ink-on-dark'
        : 'border-transparent text-secondary-ink dark:text-muted-ink-on-dark hover:text-ink dark:hover:text-ink-on-dark'
    }`;

  // Dropzone container — hairline dashed, v4 radius token, 220px min-height (v4 spec)
  const dropzoneCls = (active: boolean) =>
    `relative border border-dashed rounded-[var(--s4-radius-card)] min-h-[220px] flex items-center justify-center py-10 px-8 text-center transition-colors duration-150 ${
      active
        ? 'border-accent-gold bg-accent-gold/5'
        : 'border-divider dark:border-divider-on-dark bg-transparent hover:border-accent-gold/60'
    }`;

  const handleUrlSubmit = () => {
    // TODO #18 — URL import has no edge function yet. Stub via todo() toast.
    todo(t('workshop.url_cta'));
  };

  return (
   <div className="w-full">
      {medicalMode && (
        <div className="mb-4 inline-flex items-center gap-2 bg-chip dark:bg-card-dark px-3 py-1 rounded-[4px] border border-divider dark:border-divider-on-dark">
          <Stethoscope className="h-4 w-4 text-accent-gold" aria-hidden />
          <span className="text-ink dark:text-ink-on-dark text-xs font-semibold tracking-[0.06em] uppercase">
            {t('dashboard.med_student_mode_label')}
          </span>
        </div>
      )}

      <ScholarCard padding="lg">
        {/* Notification */}
        {notification.show && (
          <div className="mb-6 p-4 rounded-lg flex items-center space-x-3 bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Tab Navigation — hairline strip, horizontally scrollable on small viewports */}
        <div
          role="tablist"
          aria-label="Input source"
          className="flex gap-8 mb-8 border-b border-divider dark:border-divider-on-dark overflow-x-auto sm:overflow-visible -mx-2 px-2 sm:mx-0 sm:px-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'file'}
            onClick={() => setInputMode('file')}
            className={tabBtnCls(inputMode === 'file')}
          >
            <File className="h-4 w-4" />
            <span>{t('dashboard.upload_file')}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'text'}
            onClick={() => setInputMode('text')}
            className={tabBtnCls(inputMode === 'text')}
          >
            <Type className="h-4 w-4" />
            <span>{t('dashboard.paste_text')}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'ocr'}
            onClick={() => setInputMode('ocr')}
            className={tabBtnCls(inputMode === 'ocr')}
          >
            <Scan className="h-4 w-4" />
            <span>{t('dashboard.ocr_scan')}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'url'}
            onClick={() => setInputMode('url')}
            className={tabBtnCls(inputMode === 'url')}
          >
            <Globe className="h-4 w-4" />
            <span>{t('workshop.url_tab')}</span>
          </button>
        </div>

        {/* File Upload Mode */}
        {inputMode === 'file' && (
          <div
            className={dropzoneCls(dragActive)}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.docx"
              multiple
              onChange={handleChange}
              disabled={previewMode}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            <div className="flex flex-col items-center">
              <Upload size={32} strokeWidth={1.5} className="text-accent-gold" aria-hidden />
              <p className="font-display text-xl font-semibold text-ink dark:text-ink-on-dark mt-2">
                {t('dashboard.drop_file')}
              </p>
              <p className="font-light text-[13px] text-muted-ink dark:text-muted-ink-on-dark mt-1.5">
                Or click to browse — PDF, DOCX, PPTX up to 25 MB
              </p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-sidebar text-ink-on-dark rounded-[4px] text-[13px] font-semibold mt-4">
                Choose a file <span aria-hidden>→</span>
              </span>
            </div>
          </div>
        )}

        {/* Meta row removed — TODO #17 will re-introduce it once real processing/storage stats are wired. */}

        {/* OCR Scan Mode */}
        {inputMode === 'ocr' && (
          <div
            className={dropzoneCls(dragActive)}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleOCRDrop}
          >
            <input
              ref={ocrFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.bmp,.tiff,.gif,image/jpeg,image/jpg,image/png,image/bmp,image/tiff,image/gif"
              onChange={handleOCRChange}
              disabled={previewMode}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-subtle rounded-full flex items-center justify-center border border-divider dark:border-divider-on-dark">
                <Scan className="h-8 w-8 text-ink dark:text-ink-on-dark" />
              </div>

              <div>
                <p className="text-xl font-semibold text-ink dark:text-ink-on-dark mb-2">{t('dashboard.ocr_scan_title')}</p>
                <p className="text-muted-ink dark:text-muted-ink-on-dark">{t('dashboard.ocr_upload_hint')}</p>
              </div>

              <div className="flex justify-center space-x-4 text-sm text-muted-ink dark:text-muted-ink-on-dark">
                <div className="flex items-center"><FileText className="h-4 w-4 mr-1" />JPG</div>
                <div className="flex items-center"><FileText className="h-4 w-4 mr-1" />PNG</div>
                <div className="flex items-center"><FileText className="h-4 w-4 mr-1" />BMP</div>
                <div className="flex items-center"><FileText className="h-4 w-4 mr-1" />TIFF</div>
                <div className="flex items-center"><FileText className="h-4 w-4 mr-1" />GIF</div>
              </div>
            </div>
          </div>
        )}

        {/* Text Input Mode */}
        {inputMode === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">{t('dashboard.paste_content')}</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={t('dashboard.paste_placeholder')}
                className="w-full h-64 px-4 py-3 border border-divider dark:border-divider-on-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent resize-none bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark"
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-ink dark:text-muted-ink-on-dark">
                {textInput.length.toLocaleString()} {t('dashboard.characters')}
                {textInput.length > 0 && (
                  <span className="ml-2">
                    (~{Math.ceil(textInput.length / 2000)} {t('dashboard.pages')})
                  </span>
                )}
              </span>
              <span className="text-muted-ink dark:text-muted-ink-on-dark">{t('dashboard.min_characters')} | {t('dashboard.max_characters')}</span>
            </div>

            <button
              onClick={handleTextSubmit}
              disabled={
                previewMode ||
                textInput.trim().length < 100 ||
                textInput.length > 100000 ||
                (medicalMode && medicalValidation && !medicalValidation.isValid)
              }
              className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                medicalMode
                  ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                  : 'bg-accent-gold text-ink-on-dark hover:opacity-90'
              }`}
            >
              {medicalMode ? `🩺 ${t('dashboard.process_medical_content')}` : t('dashboard.process_text')}
            </button>

            {/* Medical Validation Feedback */}
            {medicalMode && medicalValidation && textInput.trim().length > 100 && (
              <div className={`mt-3 p-3 rounded-lg border text-sm ${
                medicalValidation.isValid
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                  : 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    medicalValidation.isValid ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="font-medium">
                    {t('dashboard.medical_content_score')}: {medicalValidation.score}/100
                  </span>
                </div>
                <p className="mt-1">{medicalValidation.feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* URL Mode — stub. TODO #18: wire to a url→text edge function. */}
        {inputMode === 'url' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">
              {t('workshop.url_label')}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
                className="flex-1 px-4 py-3 border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-btn)] focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={previewMode || urlInput.trim().length === 0}
                className="px-5 py-3 bg-accent-gold text-ink-on-dark rounded-[var(--s4-radius-btn)] text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('workshop.url_cta')} <span aria-hidden>→</span>
              </button>
            </div>
            <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark font-light">
              {t('workshop.url_helper')}
            </p>
          </div>
        )}


        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition duration-150"
          >
            <Settings className="h-4 w-4" />
            <span>{t('dashboard.processing_settings')}</span>
          </button>

          <div className="flex items-center space-x-2 text-sm text-muted-ink dark:text-muted-ink-on-dark">
            <Info className="h-4 w-4" />
            <span>{t('dashboard.content_secure')}</span>
          </div>
        </div>

        {showSettings && (
          <div className="mt-6 p-6 bg-subtle rounded-lg space-y-4 border border-divider dark:border-divider-on-dark">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">{t('dashboard.flashcard_count')}</label>
                <select
                  value={flashcardCount}
                  onChange={(e) => setFlashcardCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-divider dark:border-divider-on-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark"
                >
                  <option value={10}>10 {t('dashboard.cards')}</option>
                  <option value={20}>20 {t('dashboard.cards')}</option>
                  <option value={30}>30 {t('dashboard.cards')}</option>
                  <option value={40}>40 {t('dashboard.cards')}</option>
                  <option value={50}>50 {t('dashboard.cards')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">{t('dashboard.generate_from')}</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!fromSummary}
                      onChange={() => setFromSummary(false)}
                      className="h-4 w-4 text-accent-gold focus:ring-focus border-divider dark:border-divider-on-dark"
                    />
                    <span className="ml-2 text-sm text-secondary-ink dark:text-muted-ink-on-dark">{t('dashboard.full_content')}</span>
                  </label>
                  <label className={`flex items-center ${!generationPrefs.includeSummary ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      checked={fromSummary}
                      onChange={() => generationPrefs.includeSummary && setFromSummary(true)}
                      disabled={!generationPrefs.includeSummary}
                      className="h-4 w-4 text-accent-gold focus:ring-focus border-divider dark:border-divider-on-dark"
                    />
                    <span className="ml-2 text-sm text-secondary-ink dark:text-muted-ink-on-dark">{t('dashboard.summary')}</span>
                  </label>
                </div>
                {!generationPrefs.includeSummary && (
                  <p className="text-xs mt-1 text-muted-ink dark:text-muted-ink-on-dark">{t('dashboard.summary_disabled_hint')}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">{t('dashboard.generation_outputs_title')}</p>
              <label className="flex items-center gap-2 text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                <input
                  type="checkbox"
                  checked={generationPrefs.includeSummary}
                  onChange={(e) =>
                    setGenerationPrefs((p) => ({ ...p, includeSummary: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-divider dark:border-divider-on-dark text-accent-gold focus:ring-focus"
                />
                {t('dashboard.include_summary')}
              </label>
              <label className="flex items-center gap-2 text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                <input
                  type="checkbox"
                  checked={generationPrefs.includeFlashcards}
                  onChange={(e) =>
                    setGenerationPrefs((p) => ({ ...p, includeFlashcards: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-divider dark:border-divider-on-dark text-accent-gold focus:ring-focus"
                />
                {t('dashboard.include_flashcards')}
              </label>
              <p className="text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark">{t('dashboard.quiz_types_label')}</p>
              <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">{t('dashboard.quiz_types_dashboard_hint')}</p>
              <div className="flex flex-wrap gap-3">
                {ALL_QUIZ_QUESTION_TYPES.map((qt) => (
                  <label key={qt} className="flex items-center gap-1.5 text-xs text-secondary-ink dark:text-muted-ink-on-dark">
                    <input
                      type="checkbox"
                      checked={generationPrefs.quizQuestionTypes.includes(qt)}
                      onChange={() => toggleDashboardQuizType(qt)}
                      className="h-3.5 w-3.5 rounded border-divider dark:border-divider-on-dark text-accent-gold focus:ring-focus"
                    />
                    {t(`dashboard.quiz_type_${qt}`)}
                  </label>
                ))}
              </div>
            </div>

            <div className={`text-sm rounded-lg p-3 ${
              medicalMode
                ? 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
                : 'bg-accent-gold/10 border border-accent-gold/30 text-secondary-ink dark:text-muted-ink-on-dark'
            }`}>
              <p className="font-medium mb-1">
                {medicalMode ? '🩺 Medical Processing Tips' : t('dashboard.processing_tips')}
              </p>
              <ul className="space-y-1">
                {medicalMode ? (
                  <>
                    <li>• Best for textbooks, lecture notes, clinical cases, and research papers</li>
                    <li>• Include pathophysiology, pharmacology, and clinical correlations</li>
                    <li>• Higher text quality = better board exam-style questions</li>
                    <li>• Medical terminology will be preserved and emphasized</li>
                  </>
                ) : (
                  <>
                    <li>• {t('dashboard.tip_full_content')}</li>
                    <li>• {t('dashboard.tip_summary')}</li>
                    <li>• {t('dashboard.tip_larger_text')}</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Medical Mode Toggle - Compact Version */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-md border border-red-200 dark:border-red-800">
                <Stethoscope className="h-5 w-5 text-red-700 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">{t('dashboard.medical_student_mode_title')}</h3>
                <p className="text-sm text-red-700 dark:text-red-200">
                  {t('dashboard.medical_student_mode_subtitle')}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={medicalMode}
                onChange={(e) => setMedicalMode(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-colors duration-150 ${
                medicalMode
                  ? 'bg-red-600'
                  : 'bg-divider dark:bg-divider-on-dark'
              }`}>
                <div className={`w-5 h-5 bg-card-light rounded-full shadow-[var(--scholar-shadow-sm)] border border-divider transform transition duration-200 ${
                  medicalMode ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`}></div>
              </div>
            </label>
          </div>
        </div>
      </ScholarCard>

    </div>
  );
};

// Wrapper component that checks context availability
export const InputForm: React.FC<InputFormProps> = (props) => {
  // Check if context is available before rendering
  const i18nContext = useContext(I18nContext);
  
  // If context is not available, don't render (this should never happen in normal flow)
  if (!i18nContext) {
    console.warn('InputForm: I18nContext not available, skipping render');
    return null;
  }
  
  // Context is available, render the component
  return <InputFormContent {...props} />;
};
