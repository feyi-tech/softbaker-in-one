interface Window {
    eruda?: {
      init: (options?: any) => void;
      show: () => void;
      hide: () => void;
      destroy: () => void;
    };
}  