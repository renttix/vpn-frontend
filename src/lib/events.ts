import { event, EventName, EventCategory, trackScrollDepth, trackOutboundLinks, trackArticleView } from './analytics';

// Form tracking
export const trackFormStart = (formId: string, formName: string) => {
  event({
    action: EventName.FORM_START,
    category: EventCategory.FORM,
    label: formName,
    form_id: formId,
    form_name: formName
  });
};

export const trackFormSubmit = (formId: string, formName: string) => {
  event({
    action: EventName.FORM_SUBMIT,
    category: EventCategory.FORM,
    label: formName,
    form_id: formId,
    form_name: formName
  });
};

export const trackFormError = (formId: string, formName: string, errorMessage: string) => {
  event({
    action: EventName.FORM_ERROR,
    category: EventCategory.FORM,
    label: errorMessage,
    form_id: formId,
    form_name: formName,
    error_message: errorMessage
  });
};

export const trackFormComplete = (formId: string, formName: string) => {
  event({
    action: EventName.FORM_COMPLETE,
    category: EventCategory.FORM,
    label: formName,
    form_id: formId,
    form_name: formName
  });
};

// Search tracking
export const trackSearch = (query: string, resultsCount: number) => {
  event({
    action: EventName.SEARCH,
    category: EventCategory.SEARCH,
    label: query,
    search_term: query,
    search_results_count: resultsCount
  });
};

// Filter tracking
export const trackFilter = (filterType: string, filterValue: string) => {
  event({
    action: EventName.FILTER,
    category: EventCategory.CONTENT,
    label: `${filterType}: ${filterValue}`,
    filter_type: filterType,
    filter_value: filterValue
  });
};

// Sort tracking
export const trackSort = (sortField: string, sortDirection: string) => {
  event({
    action: EventName.SORT,
    category: EventCategory.CONTENT,
    label: `${sortField} ${sortDirection}`,
    sort_field: sortField,
    sort_direction: sortDirection
  });
};

// Share tracking
export const trackShare = (contentType: string, contentId: string, shareMethod: string) => {
  event({
    action: EventName.SHARE,
    category: EventCategory.ENGAGEMENT,
    label: shareMethod,
    content_type: contentType,
    content_id: contentId,
    share_method: shareMethod
  });
};

// Video tracking
export const trackVideoStart = (videoId: string, videoTitle: string, videoDuration: number) => {
  event({
    action: EventName.VIDEO_START,
    category: EventCategory.VIDEO,
    label: videoTitle,
    video_id: videoId,
    video_title: videoTitle,
    video_duration: videoDuration
  });
};

export const trackVideoProgress = (videoId: string, videoTitle: string, progress: number) => {
  event({
    action: EventName.VIDEO_PROGRESS,
    category: EventCategory.VIDEO,
    label: `${videoTitle} - ${progress}%`,
    video_id: videoId,
    video_title: videoTitle,
    video_progress: progress
  });
};

export const trackVideoComplete = (videoId: string, videoTitle: string) => {
  event({
    action: EventName.VIDEO_COMPLETE,
    category: EventCategory.VIDEO,
    label: videoTitle,
    video_id: videoId,
    video_title: videoTitle
  });
};

// Download tracking
export const trackDownload = (fileUrl: string, fileName: string, fileType: string) => {
  event({
    action: EventName.DOWNLOAD,
    category: EventCategory.CONTENT,
    label: fileName,
    file_url: fileUrl,
    file_name: fileName,
    file_type: fileType
  });
};

// Error tracking
export const trackError = (errorCode: string, errorMessage: string, errorContext?: string) => {
  event({
    action: EventName.ERROR,
    category: EventCategory.ERROR,
    label: errorMessage,
    error_code: errorCode,
    error_message: errorMessage,
    error_context: errorContext,
    non_interaction: true
  });
};

// Subscription tracking
export const trackSubscribe = (subscriptionType: string, plan?: string) => {
  event({
    action: EventName.SUBSCRIBE,
    category: EventCategory.USER,
    label: subscriptionType,
    subscription_type: subscriptionType,
    subscription_plan: plan
  });
};

export const trackUnsubscribe = (subscriptionType: string, reason?: string) => {
  event({
    action: EventName.UNSUBSCRIBE,
    category: EventCategory.USER,
    label: subscriptionType,
    subscription_type: subscriptionType,
    unsubscribe_reason: reason
  });
};

// Category view tracking
export const trackCategoryView = (category: any) => {
  if (!category) return;
  
  const { title, slug, description } = category;
  
  event({
    action: EventName.CATEGORY_VIEW,
    category: EventCategory.CONTENT,
    label: title,
    category_id: slug?.current,
    category_title: title,
    category_description: description
  });
  
  // Start tracking scroll depth for this category page
  trackScrollDepth();
  
  // Track outbound links
  trackOutboundLinks();
};

// Author view tracking
export const trackAuthorView = (author: any) => {
  if (!author) return;
  
  const { name, slug, bio } = author;
  
  event({
    action: EventName.AUTHOR_VIEW,
    category: EventCategory.CONTENT,
    label: name,
    author_id: slug?.current,
    author_name: name,
    author_has_bio: !!bio
  });
  
  // Start tracking scroll depth for this author page
  trackScrollDepth();
  
  // Track outbound links
  trackOutboundLinks();
};

// Re-export base tracking functions for convenience
export { trackScrollDepth, trackOutboundLinks, trackArticleView };
