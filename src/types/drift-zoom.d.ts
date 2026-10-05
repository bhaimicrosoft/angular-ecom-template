declare module 'drift-zoom' {
  export interface DriftOptions {
    /** Namespace prefixed to generated class names. */
    namespace?: string | null;
    /** Show the zoom pane inline (overlaying the trigger) instead of in a separate container. */
    inlinePane?: boolean | number;
    /** Offset of the inline pane from the trigger edges, in pixels. */
    inlineOffsetX?: number;
    inlineOffsetY?: number;
    /** Element the (non-inline) zoom pane is appended to. */
    paneContainer?: HTMLElement;
    /** Draw a bounding box over the hovered region. */
    hoverBoundingBox?: boolean;
    touchBoundingBox?: boolean;
    /** Zoom magnification factor. */
    zoomFactor?: number;
    /** Delay (ms) before the pane appears. */
    hoverDelay?: number;
    touchDelay?: number;
    /** Attribute on the trigger holding the high-resolution image URL. */
    sourceAttribute?: string;
    /** Inject the library's base stylesheet automatically (default true). */
    injectBaseStyles?: boolean;
    onShow?: () => void;
    onHide?: () => void;
  }

  export default class Drift {
    constructor(triggerEl: HTMLElement, options?: DriftOptions);
    setZoomImageURL(url: string): void;
    enable(): void;
    disable(): void;
    destroy(): void;
  }
}
