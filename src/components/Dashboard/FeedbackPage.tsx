import React, { useState, useEffect } from 'react';
import { MessageSquare, Lightbulb, X, Video, Send, CheckCircle, AlertCircle, Flag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { usePageTutorial } from '../../hooks/usePageTutorial';
import { PageTutorial } from '../Onboarding/PageTutorial';
import { PageHeader } from '../Scholar';

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

type FeedbackTab = 'note' | 'suggestion' | 'complaint';

export const FeedbackPage: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const { shouldShowTutorial, showTutorial, isTutorialOpen, completeTutorial, skipTutorial, config: tutorialConfig } = usePageTutorial('feedback');
  const [activeTab, setActiveTab] = useState<FeedbackTab>('note');
  const [feedbackText, setFeedbackText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const maxFiles = 5;
  const maxImageSize = 5 * 1024 * 1024;
  const maxVideoSize = 50 * 1024 * 1024;
  const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const acceptedVideoTypes = ['video/mp4', 'video/mov', 'video/webm'];

  const categories: { k: FeedbackTab; l: string; desc: string; Icon: React.FC<{ className?: string }> }[] = [
    { k: 'note',       l: 'A Note',       desc: 'A thought, observation, or anything on your mind.',        Icon: ({ className }) => <MessageSquare className={className} /> },
    { k: 'suggestion', l: 'A Suggestion', desc: 'Something you wish existed, or how to make it better.',    Icon: ({ className }) => <Lightbulb className={className} /> },
    { k: 'complaint',  l: 'A Complaint',  desc: 'Something broke or frustrated you — we want to know.',     Icon: ({ className }) => <Flag className={className} /> },
  ];

  const shipped = [
    { v: 'v2.4.1', n: 'Improved Arabic OCR accuracy',     date: 'May 3'  },
    { v: 'v2.4.0', n: 'Faster flashcard generation',      date: 'Apr 28' },
    { v: 'v2.3.7', n: 'Study Rooms — live collaboration', date: 'Apr 21' },
    { v: 'v2.3.5', n: 'Tags and topic filters in Library', date: 'Apr 12' },
    { v: 'v2.3.2', n: 'Dark mode for all six themes',     date: 'Apr 4'  },
  ];

  const activeCategory = categories.find(c => c.k === activeTab)!;

  // Show tutorial on first visit
  useEffect(() => {
    if (shouldShowTutorial) {
      const timer = setTimeout(() => {
        showTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTutorial, showTutorial]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    Array.from(files).forEach((file) => {
      if (uploadedFiles.length + newFiles.length >= maxFiles) {
        const errorMsg = `Maximum ${maxFiles} files allowed`;
        setErrorMessage(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      const isImage = acceptedImageTypes.includes(file.type);
      const isVideo = acceptedVideoTypes.includes(file.type);

      if (!isImage && !isVideo) {
        const errorMsg = 'Only images (JPG, PNG, GIF, WebP) and videos (MP4, MOV, WebM) are allowed';
        setErrorMessage(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      if (isImage && file.size > maxImageSize) {
        const errorMsg = 'Image files must be less than 5MB';
        setErrorMessage(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      if (isVideo && file.size > maxVideoSize) {
        const errorMsg = 'Video files must be less than 50MB';
        setErrorMessage(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      const preview = URL.createObjectURL(file);
      newFiles.push({
        file,
        preview,
        type: isImage ? 'image' : 'video'
      });
    });

    if (newFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      setErrorMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const uploadFilesToStorage = async (): Promise<string[]> => {
    if (isOffline()) {
      handleOfflineError(showErrorToast);
      throw new Error('You are currently offline. Please check your connection and try again.');
    }

    const uploadedUrls: string[] = [];

    for (const fileData of uploadedFiles) {
      const sanitizedFileName = fileData.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${user!.id}/${Date.now()}_${sanitizedFileName}`;

      try {
        const { data, error } = await supabase.storage
          .from('feedback-media')
          .upload(fileName, fileData.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          const message = handleSupabaseError(error, {
            component: 'FeedbackPage',
            action: 'uploadFilesToStorage',
            fileName: fileData.file.name,
            filePath: fileName
          });
          ErrorLogger.error(error, {
            component: 'FeedbackPage',
            action: 'uploadFilesToStorage',
            fileName: fileData.file.name,
            filePath: fileName,
            userId: user!.id
          });
          throw new Error(message);
        }

        if (!data) {
          const errorMsg = `Upload succeeded but no data returned for ${fileData.file.name}`;
          ErrorLogger.error(new Error(errorMsg), {
            component: 'FeedbackPage',
            action: 'uploadFilesToStorage',
            fileName: fileData.file.name
          });
          throw new Error(errorMsg);
        }

        const { data: urlData } = supabase.storage
          .from('feedback-media')
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      } catch (err) {
        const message = handleApiError(err, {
          component: 'FeedbackPage',
          action: 'uploadFilesToStorage',
          fileName: fileData.file.name
        });
        ErrorLogger.error(err, {
          component: 'FeedbackPage',
          action: 'uploadFilesToStorage',
          fileName: fileData.file.name
        });
        throw new Error(message);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showErrorToast('You must be logged in to submit feedback');
      return;
    }

    if (!feedbackText.trim()) {
      showErrorToast('Please enter your feedback or suggestion');
      return;
    }

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      let mediaUrls: string[] = [];

      if (uploadedFiles.length > 0) {
        try {
          mediaUrls = await uploadFilesToStorage();
        } catch (uploadError) {
          const message = handleApiError(uploadError, {
            component: 'FeedbackPage',
            action: 'handleSubmit',
            step: 'fileUpload'
          });
          showErrorToast(message);
          setSubmitStatus('error');
          return;
        }
      }

      const { error: dbError } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          feedback_type: activeTab,
          feedback_text: feedbackText,
          media_urls: mediaUrls,
          user_email: user.email || 'unknown@email.com'
        });

      if (dbError) {
        const message = handleSupabaseError(dbError, {
          component: 'FeedbackPage',
          action: 'handleSubmit',
          step: 'databaseInsert'
        });
        ErrorLogger.error(dbError, {
          component: 'FeedbackPage',
          action: 'handleSubmit',
          step: 'databaseInsert',
          userId: user.id
        });
        showErrorToast(message);
        setSubmitStatus('error');
        return;
      }

      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-feedback-email`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            feedbackType: activeTab,
            feedbackText: feedbackText,
            mediaUrls: mediaUrls,
            userEmail: user.email || 'unknown@email.com'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          ErrorLogger.error(new Error(`Email notification failed: ${response.status}`), {
            component: 'FeedbackPage',
            action: 'handleSubmit',
            step: 'emailNotification',
            status: response.status,
            errorText
          });
          // Non-blocking: feedback was saved, just email failed
        }
      } catch (emailError) {
        ErrorLogger.error(emailError, {
          component: 'FeedbackPage',
          action: 'handleSubmit',
          step: 'emailNotification'
        });
        // Non-blocking: feedback was saved, just email failed
      }

      setSubmitStatus('success');
      showSuccessToast(`Thank you! Your ${activeTab} has been submitted successfully.`);
      setFeedbackText('');
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
      setUploadedFiles([]);

      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);

    } catch (error) {
      const message = handleApiError(error, {
        component: 'FeedbackPage',
        action: 'handleSubmit'
      });
      ErrorLogger.error(error, {
        component: 'FeedbackPage',
        action: 'handleSubmit',
        userId: user.id
      });
      showErrorToast(message);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
        <PageHeader
          eyebrow="Correspondence"
          title="A letter to the editors."
          descriptor="Tell us what worked, what broke, or what could be lovelier."
          className="mb-5"
        />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-7">

          {/* ── LEFT — form ──────────────────────────────────────────── */}
          <div>
            {/* Category selector — 3 editorial cards */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {categories.map(({ k, l, desc, Icon }) => {
                const on = activeTab === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActiveTab(k)}
                    className={`relative text-left px-4 pt-4 pb-3.5 border transition-colors ${
                      on
                        ? 'bg-sidebar border-ink dark:border-divider-on-dark'
                        : 'bg-subtle dark:bg-subtle-on-dark border-divider dark:border-divider-on-dark hover:opacity-80'
                    }`}
                  >
                    {on && <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-gold" />}
                    <div className={`mb-2.5 ${on ? 'opacity-100' : 'opacity-60'}`}>
                      <Icon className={`h-5 w-5 ${on ? 'text-accent-gold' : 'text-ink dark:text-ink-on-dark'}`} />
                    </div>
                    <div className={`font-display text-[13.5px] font-semibold mb-1.5 ${on ? 'text-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>{l}</div>
                    <div className={`text-[10.5px] leading-[1.55] ${on ? 'text-ink-on-dark/70' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Letter panel */}
            <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark px-[26px] py-[22px]">
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">To the editors of Scholar</div>
              <div className="font-display text-[14px] text-muted-ink dark:text-muted-ink-on-dark mb-3.5">Dear Scholar,</div>

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={activeCategory.desc.charAt(0).toUpperCase() + activeCategory.desc.slice(1) + '…'}
                className="w-full bg-transparent border-none resize-none outline-none text-[13px] text-ink dark:text-ink-on-dark placeholder-muted-ink dark:placeholder-muted-ink-on-dark leading-relaxed min-h-[160px] pb-3.5 border-b border-divider dark:border-divider-on-dark"
                rows={8}
                maxLength={2000}
                disabled={isSubmitting}
              />

              <div className="flex justify-between items-end mt-3.5">
                <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{feedbackText.length} / 2000 characters</span>
                <div className="text-right">
                  <div className="font-display text-[12px] text-muted-ink dark:text-muted-ink-on-dark">Yours sincerely,</div>
                  <div className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark mt-0.5">— {user?.name || user?.email?.split('@')[0] || 'A user'}</div>
                </div>
              </div>

              {/* Attach + actions */}
              <div className="mt-4 pt-3.5 border-t border-divider dark:border-divider-on-dark flex justify-between items-center">
                <label htmlFor="file-upload-feedback" className="font-display text-[12px] text-accent-gold underline cursor-pointer hover:opacity-75 transition">
                  + attach a file or screenshot
                </label>
                <input
                  type="file"
                  id="file-upload-feedback"
                  multiple
                  accept={[...acceptedImageTypes, ...acceptedVideoTypes].join(',')}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setFeedbackText(''); setUploadedFiles([]); setSubmitStatus('idle'); setErrorMessage(''); }}
                    className="px-4 py-2 bg-transparent border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark font-display text-[13px] font-semibold hover:opacity-75 transition"
                    disabled={isSubmitting}
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !feedbackText.trim()}
                    className="px-5 py-2 bg-sidebar text-ink-on-dark border-none font-display text-[13px] font-semibold disabled:opacity-40 hover:opacity-80 transition flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send the letter
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* File drag-drop zone */}
            {uploadedFiles.length > 0 || isDragging ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-3 border border-dashed border-divider dark:border-divider-on-dark p-4 transition-colors ${isDragging ? 'bg-accent-gold-soft' : 'bg-subtle dark:bg-subtle-on-dark'}`}
              >
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {uploadedFiles.map((fileData, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square overflow-hidden bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark">
                          {fileData.type === 'image' ? (
                            <img src={fileData.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-8 w-8 text-muted-ink dark:text-muted-ink-on-dark" />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 p-0.5 bg-sidebar text-ink-on-dark opacity-0 group-hover:opacity-100 transition"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mt-1 truncate">{fileData.file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Drop zone hint */}
            {!isDragging && (
              <div
                onDragOver={handleDragOver}
                className="hidden"
              />
            )}

            {/* Hidden drag-drop overlay */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-3 border-2 border-dashed transition-colors ${isDragging ? 'block border-accent-gold bg-accent-gold-soft p-4 text-center text-[13px] text-accent-gold' : 'hidden'}`}
            >
              Drop files here
            </div>

            {/* Status messages */}
            {errorMessage && (
              <div className="mt-3 flex items-center gap-2 p-3.5 border border-red-500/40 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-[12px] text-red-600 dark:text-red-400">{errorMessage}</p>
              </div>
            )}

            {submitStatus === 'success' && (
              <div className="mt-3 flex items-center gap-2 p-3.5 bg-accent-gold-soft border border-accent-gold">
                <CheckCircle className="h-4 w-4 text-accent-gold flex-shrink-0" />
                <p className="text-[12px] text-ink dark:text-ink-on-dark">
                  Thank you! Your {activeTab} has been submitted successfully.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT rail ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-0">
            {/* From the editors — dark ink tile */}
            <div className="bg-sidebar px-6 py-[22px] mb-5">
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">From the editors</div>
              <div className="font-display text-[16px] text-ink-on-dark leading-relaxed">
                "This is just the beginning — there is better still to come."
              </div>
              <div className="font-display text-[11px] text-accent-gold mt-3">— the Scholar team</div>
            </div>

            {/* Recently Shipped */}
            <div className="mb-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase whitespace-nowrap">Recently Shipped</div>
                <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
              </div>
              {shipped.map((r, i) => (
                <div key={i} className={`flex items-baseline gap-3 py-2.5 ${i < shipped.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''}`}>
                  <span className="font-display text-[11px] text-accent-gold font-bold min-w-[46px]">{r.v}</span>
                  <span className="text-[12.5px] text-secondary-ink dark:text-muted-ink-on-dark leading-snug flex-1">{r.n}</span>
                  <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0">{r.date}</span>
                </div>
              ))}
            </div>

            {/* Other ways to reach us */}
            <div className="pt-3.5 border-t border-divider dark:border-divider-on-dark">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase whitespace-nowrap">Other Ways to Reach Us</div>
                <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
              </div>
              {[
                ['Support',   'support@scholar.app'],
                ['Community', 'Discord · @scholar'],
                ['Response',  'Within 36 hours'],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between items-baseline mb-2.5">
                  <span className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark">{k}</span>
                  <span className="font-display text-[12px] text-ink dark:text-ink-on-dark">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Feedback Tutorial */}
      {tutorialConfig && (
        <PageTutorial
          config={tutorialConfig}
          isOpen={isTutorialOpen}
          onClose={() => {}}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}
    </div>
  );
});
