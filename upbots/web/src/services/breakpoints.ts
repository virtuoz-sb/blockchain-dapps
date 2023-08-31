export class Breakpoint {
  // Public
  public xs = false;
  public sm = false;
  public md = false;
  public lg = false;
  public xl = false;
  public xsOnly = false;
  public smOnly = false;
  public smAndDown = false;
  public smAndUp = false;
  public mdOnly = false;
  public mdAndDown = false;
  public mdAndUp = false;
  public lgOnly = false;
  public lgAndDown = false;
  public lgAndUp = false;
  public xlOnly = false;
  public name = "";
  public height = 0;
  public width = 0;
  public thresholds: any;
  public scrollBarWidth: any;
  private resizeTimeout = 0;

  constructor(preset: any) {
    const { scrollBarWidth, thresholds } = preset;

    this.scrollBarWidth = scrollBarWidth;
    this.thresholds = thresholds;

    this.init();
  }

  public init() {
    /* istanbul ignore if */
    if (typeof window === "undefined") return;

    window.addEventListener("resize", this.onResize.bind(this), { passive: true });

    this.update();
  }

  private onResize() {
    clearTimeout(this.resizeTimeout);

    this.resizeTimeout = window.setTimeout(this.update.bind(this), 200);
  }

  /* eslint-disable-next-line max-statements */
  private update() {
    const height = this.getClientHeight();
    const width = this.getClientWidth();

    const xs = width < this.thresholds.xs;
    const sm = width < this.thresholds.sm && !xs;
    const md = width < this.thresholds.md - this.scrollBarWidth && !(sm || xs);
    const lg = width < this.thresholds.lg - this.scrollBarWidth && !(md || sm || xs);
    const xl = width >= this.thresholds.lg - this.scrollBarWidth;

    this.height = height;
    this.width = width;

    this.xs = xs;
    this.sm = sm;
    this.md = md;
    this.lg = lg;
    this.xl = xl;

    this.xsOnly = xs;
    this.smOnly = sm;
    this.smAndDown = (xs || sm) && !(md || lg || xl);
    this.smAndUp = !xs && (sm || md || lg || xl);
    this.mdOnly = md;
    this.mdAndDown = (xs || sm || md) && !(lg || xl);
    this.mdAndUp = !(xs || sm) && (md || lg || xl);
    this.lgOnly = lg;
    this.lgAndDown = (xs || sm || md || lg) && !xl;
    this.lgAndUp = !(xs || sm || md) && (lg || xl);
    this.xlOnly = xl;

    switch (true) {
      case xs:
        this.name = "xs";
        break;
      case sm:
        this.name = "sm";
        break;
      case md:
        this.name = "md";
        break;
      case lg:
        this.name = "lg";
        break;
      default:
        this.name = "xl";
        break;
    }
  }

  private getClientWidth() {
    /* istanbul ignore if */
    if (typeof document === "undefined") return 0; // SSR
    return Math.max(document.documentElement!.clientWidth, window.innerWidth || 0);
  }

  private getClientHeight() {
    /* istanbul ignore if */
    if (typeof document === "undefined") return 0; // SSR
    return Math.max(document.documentElement!.clientHeight, window.innerHeight || 0);
  }
}

const breakpoint = {
  scrollBarWidth: 0,
  thresholds: {
    xs: 501,
    sm: 768,
    md: 1025,
    lg: 1920,
  },
};

export default new Breakpoint(breakpoint);
