// Progress through the article's scrollable distance, excluding page chrome.
// A short article qualifies for depth only when its entire body is visible.
export function contentProgress(top: number, height: number, viewport: number) {
  if (height <= 0) return 0;
  if (height <= viewport) return top >= 0 && top + height <= viewport ? 1 : 0;
  return Math.min(1, Math.max(0, -top / (height - viewport)));
}

export class EngagementProgress {
  activeMs = 0;
  depth = 0;
  private last: number | undefined;
  private active = false;
  private engaged = false;
  private completed = false;

  update(now: number, active: boolean, depth: number) {
    if (this.last !== undefined && this.active)
      this.activeMs += Math.max(0, now - this.last);
    this.last = now;
    this.active = active;
    if (active) this.depth = Math.max(this.depth, depth);
    const engaged =
      !this.engaged && this.activeMs >= 10_000 && this.depth >= 0.25;
    const completed = !this.completed && this.depth >= 0.9;
    this.engaged ||= engaged;
    this.completed ||= completed;
    return { engaged, completed };
  }
}
