/**
 * AlgoViz State Engine
 *
 * Deterministic scene computation via left-fold.
 * Scene at step N = initial actors + apply(steps[0..N]).
 */

import type { Visualization, Actor, Action, Scene, TransitionHint } from "./types";

export interface EngineConfig {
  canvas: { width: number; height: number; padding: number; background: string };
  theme: Record<string, string>;
  playback: { stepDuration: number; autoPlay: boolean };
}

const DEFAULTS: EngineConfig = {
  canvas: { width: 1000, height: 600, padding: 40, background: "#ffffff" },
  theme: {
    default: "#e2e8f0", primary: "#3b82f6", secondary: "#8b5cf6",
    success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
    text: "#1e293b", muted: "#94a3b8",
  },
  playback: { stepDuration: 800, autoPlay: false },
};

export class Engine {
  readonly viz: Visualization;
  readonly config: EngineConfig;
  readonly totalSteps: number;

  private _currentStep: number;
  private _actorStates: Map<string, Actor>;

  constructor(viz: Visualization) {
    this.viz = viz;
    this.config = {
      canvas: { ...DEFAULTS.canvas, ...(viz.config?.canvas || {}) },
      theme: { ...DEFAULTS.theme, ...(viz.config?.theme || {}) },
      playback: { ...DEFAULTS.playback, ...(viz.config?.playback || {}) },
    };
    this.totalSteps = viz.steps.length;
    this._currentStep = -1;
    this._actorStates = new Map();
    this._init();
  }

  get currentStep(): number { return this._currentStep; }
  get atEnd(): boolean { return this._currentStep >= this.totalSteps - 1; }
  get atStart(): boolean { return this._currentStep <= -1; }

  /** Resolve $-prefixed theme color references to actual hex values. */
  resolveColor(color: string | undefined | null): string | null {
    if (!color) return null;
    if (color.startsWith("$")) return this.config.theme[color.slice(1)] || color;
    return color;
  }

  /** Compute scene at step N (recomputes from scratch). */
  goToStep(n: number): Scene {
    n = Math.max(-1, Math.min(n, this.totalSteps - 1));
    this._init();
    for (let i = 0; i <= n; i++) {
      this._applyActions(this.viz.steps[i].actions);
    }
    this._currentStep = n;
    return this.getScene();
  }

  nextStep(): Scene | null {
    if (this._currentStep < this.totalSteps - 1) return this.goToStep(this._currentStep + 1);
    return null;
  }

  prevStep(): Scene | null {
    if (this._currentStep >= 0) return this.goToStep(this._currentStep - 1);
    return null;
  }

  getScene(): Scene {
    return {
      stepIndex: this._currentStep,
      description: this._currentStep >= 0
        ? this.viz.steps[this._currentStep].description
        : (this.viz.metadata.description || "Initial state"),
      transition: (this._currentStep >= 0
        ? (this.viz.steps[this._currentStep].transition || "smooth")
        : "instant") as TransitionHint,
      actors: new Map(this._actorStates),
    };
  }

  /** Get all actor states at current step. */
  getActors(): Map<string, Actor> {
    return new Map(this._actorStates);
  }

  private _init(): void {
    this._actorStates.clear();
    for (const actor of this.viz.actors) {
      this._actorStates.set(actor.id, { ...actor } as Actor);
    }
    this._currentStep = -1;
  }

  private _applyActions(actions: Action[]): void {
    for (const action of actions) {
      switch (action.type) {
        case "update": {
          const state = this._actorStates.get(action.target);
          if (state) Object.assign(state, action.props);
          break;
        }
        case "create":
          this._actorStates.set(action.actor.id, { ...action.actor } as Actor);
          break;
        case "remove":
          this._actorStates.delete(action.target);
          break;
      }
    }
  }
}
