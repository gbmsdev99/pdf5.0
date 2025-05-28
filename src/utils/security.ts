import { SecurityViolationType } from '../types';

type SecurityConfig = {
  onViolation: (type: SecurityViolationType) => void;
  enableFullscreenCheck: boolean;
  enableTabFocusCheck: boolean;
  enableCopyPasteCheck: boolean;
};

export function setupSecurityMonitoring(config: SecurityConfig): () => void {
  const { 
    onViolation, 
    enableFullscreenCheck, 
    enableTabFocusCheck, 
    enableCopyPasteCheck 
  } = config;
  
  const handlers: { event: string; element: Element | Document | Window; handler: EventListener }[] = [];
  
  // Fullscreen change event
  if (enableFullscreenCheck) {
    const fullscreenChangeHandler = () => {
      if (!document.fullscreenElement) {
        onViolation(SecurityViolationType.EXIT_FULLSCREEN);
      }
    };
    
    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    handlers.push({
      event: 'fullscreenchange',
      element: document,
      handler: fullscreenChangeHandler
    });
  }
  
  // Tab focus change
  if (enableTabFocusCheck) {
    const visibilityChangeHandler = () => {
      if (document.visibilityState === 'hidden') {
        onViolation(SecurityViolationType.TAB_SWITCH);
      }
    };
    
    document.addEventListener('visibilitychange', visibilityChangeHandler);
    handlers.push({
      event: 'visibilitychange',
      element: document,
      handler: visibilityChangeHandler
    });
    
    const blurHandler = () => {
      onViolation(SecurityViolationType.TAB_SWITCH);
    };
    
    window.addEventListener('blur', blurHandler);
    handlers.push({
      event: 'blur',
      element: window,
      handler: blurHandler
    });
  }
  
  // Copy/paste prevention
  if (enableCopyPasteCheck) {
    const copyHandler = (e: Event) => {
      e.preventDefault();
      onViolation(SecurityViolationType.COPY_PASTE);
    };
    
    document.addEventListener('copy', copyHandler);
    document.addEventListener('cut', copyHandler);
    document.addEventListener('paste', copyHandler);
    
    handlers.push({
      event: 'copy',
      element: document,
      handler: copyHandler
    });
    handlers.push({
      event: 'cut',
      element: document,
      handler: copyHandler
    });
    handlers.push({
      event: 'paste',
      element: document,
      handler: copyHandler
    });
  }
  
  // Return cleanup function
  return () => {
    handlers.forEach(({ event, element, handler }) => {
      element.removeEventListener(event, handler);
    });
  };
}

// Request fullscreen mode
export function requestFullscreen(element: HTMLElement = document.documentElement): Promise<void> {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  }
  return Promise.reject(new Error('Fullscreen API not supported'));
}

// Exit fullscreen mode
export function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }
  return Promise.reject(new Error('Fullscreen API not supported'));
}