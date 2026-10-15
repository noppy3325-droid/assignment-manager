import { useEffect } from 'react';
// The foreground dialog owns focus, including when a child dialog opens over a calendar.
export function useModalFocus(key: string) {
  useEffect(() => {
    if (!key) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    let dialog: HTMLElement | undefined;
    const frame = requestAnimationFrame(() => {
      const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
      dialog = dialogs.sort((a, b) => Number(getComputedStyle(a).zIndex) - Number(getComputedStyle(b).zIndex)).at(-1);
      if (!dialog) return;
      dialog.tabIndex = -1;
      const input = dialog.querySelector<HTMLElement>('[autofocus], input:not([type="hidden"]), button');
      (input || dialog).focus();
    });
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialog) return;
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>('button, input:not([type="hidden"]), select, textarea, a[href], [tabindex="0"]'))
        .filter(el => !el.hasAttribute('disabled') && el.getClientRects().length > 0);
      const first = elements[0], last = elements.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); }
      else if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', trap); document.body.style.overflow = overflow; previous?.focus(); };
  }, [key]);
}
