'use client';

import { useEffect } from 'react';

const INTERACTIVE_SELECTOR =
  'a[href], button, [role="button"], [data-interactive], .cta-primary, .cta-secondary, .plan-button, .menu-button, .nav-overlay__link, .store-pill';
const DANGER_SELECTOR = '[data-cursor="danger"]';

export default function CursorController() {
  useEffect(() => {
    // Smooth follow without jumps.
    let rafId: number | null = null;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    const smoothing = 0.2; // lower = snappier

    const updateStyle = () => {
      document.documentElement.style.setProperty('--cursor-x', `${currentX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${currentY}px`);
      document.documentElement.style.setProperty('--cursor-visible', '1');
    };

    const animate = () => {
      currentX += (targetX - currentX) * smoothing;
      currentY += (targetY - currentY) * smoothing;
      updateStyle();
      rafId = requestAnimationFrame(animate);
    };

    const setTarget = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      // If animation loop isn't running yet, start it and align immediately to avoid jump.
      if (rafId === null) {
        currentX = targetX;
        currentY = targetY;
        updateStyle();
        rafId = requestAnimationFrame(animate);
      }
    };

    // Force-hide native cursor via JS as well, to avoid any UA overrides.
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    // Initialize and start loop immediately so position never snaps away when idle.
    document.documentElement.style.setProperty('--cursor-visible', '1');
    updateStyle();
    if (rafId === null) {
      rafId = requestAnimationFrame(animate);
    }
    const setPosOnWheel = (event: WheelEvent) => {
      if (event.clientX || event.clientY) {
        targetX = event.clientX;
        targetY = event.clientY;
        if (rafId === null) {
          currentX = targetX;
          currentY = targetY;
          updateStyle();
          rafId = requestAnimationFrame(animate);
        }
      }
    };
    window.addEventListener('pointermove', setTarget, { passive: true });
    window.addEventListener('pointerdown', setTarget, { passive: true });
    window.addEventListener('pointerenter', setTarget, { passive: true });
    // Keep cursor visible and synced on wheel/scroll
    window.addEventListener('wheel', setPosOnWheel, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', setTarget);
      window.removeEventListener('pointerdown', setTarget);
      window.removeEventListener('pointerenter', setTarget);
      window.removeEventListener('wheel', setPosOnWheel as any);
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    if (!body) return;
    let hoverState: 'default' | 'interactive' = 'default';
    const brightnessThreshold = 185;

    type RGB = { r: number; g: number; b: number; a: number };

    const parseColor = (value: string): RGB | null => {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/i);
      if (!match) return null;
      const [, r, g, b, a] = match;
      return {
        r: Number(r),
        g: Number(g),
        b: Number(b),
        a: a === undefined ? 1 : Number(a),
      };
    };

    const getBackgroundColor = (element: Element | null): RGB | null => {
      let current: Element | null = element;
      while (current) {
        const style = getComputedStyle(current);
        const parsed = parseColor(style.backgroundColor);
        if (parsed && parsed.a > 0.05) {
          return parsed;
        }
        current = current.parentElement;
      }
      const bodyColor = getComputedStyle(document.body).backgroundColor;
      return parseColor(bodyColor);
    };

    const updateContrast = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        body.dataset.cursorContrast = 'light';
        return;
      }
      const bg = getBackgroundColor(target);
      if (!bg) {
        body.dataset.cursorContrast = 'light';
        return;
      }
      const brightness = (bg.r * 299 + bg.g * 587 + bg.b * 114) / 1000;
      body.dataset.cursorContrast = brightness > brightnessThreshold ? 'dark' : 'light';
    };

    const applyState = (state: 'default' | 'interactive' | 'active' | 'danger') => {
      body.dataset.cursorState = state;
    };

    const evaluateTarget = (target: EventTarget | null) => {
      if (target instanceof Element && target.closest(DANGER_SELECTOR)) {
        applyState('danger');
        return;
      }
      if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
        hoverState = 'interactive';
      } else {
        hoverState = 'default';
      }
      if (body.dataset.cursorState !== 'active') {
        applyState(hoverState);
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      evaluateTarget(event.target);
      updateContrast(event.target);
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateContrast(event.target);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)) {
        applyState('active');
      } else {
        applyState(hoverState);
      }
    };

    const handlePointerUp = () => {
      applyState(hoverState);
      body.dataset.cursorContrast = body.dataset.cursorContrast || 'light';
    };

    const resetState = () => {
      hoverState = 'default';
      applyState('default');
      body.dataset.cursorContrast = 'light';
    };

    applyState('default');
    body.dataset.cursorContrast = 'light';
    document.addEventListener('pointerover', handlePointerOver, true);
    document.addEventListener('pointermove', handlePointerMove, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('pointerup', handlePointerUp, true);
    document.addEventListener('pointerleave', resetState, true);
    window.addEventListener('blur', resetState);

    return () => {
      document.removeEventListener('pointerover', handlePointerOver, true);
      document.removeEventListener('pointermove', handlePointerMove, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('pointerup', handlePointerUp, true);
      document.removeEventListener('pointerleave', resetState, true);
      window.removeEventListener('blur', resetState);
    };
  }, []);

  return null;
}
