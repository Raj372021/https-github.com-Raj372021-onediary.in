import html2canvas, { Options } from 'html2canvas';

/**
 * Safe wrapper around html2canvas that prevents "Attempting to parse an unsupported color function oklch" error.
 * Tailwind v4 uses oklch() color functions by default which causes html2canvas CSS parser to crash.
 * This helper resolves computed RGB values onto elements and sanitizes oklch() from CSS stylesheets before rendering.
 */
export async function safeHtml2Canvas(element: HTMLElement, options?: Partial<Options>): Promise<HTMLCanvasElement> {
  const customOnClone = options?.onclone;

  const mergedOptions: Partial<Options> = {
    ...options,
    onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
      // 1. Process container and all child elements to apply computed RGB styles
      try {
        if (element instanceof HTMLElement && clonedElement instanceof HTMLElement) {
          const comp = window.getComputedStyle(element);
          if (comp.color && !comp.color.includes('oklch')) clonedElement.style.color = comp.color;
          if (comp.backgroundColor && !comp.backgroundColor.includes('oklch')) clonedElement.style.backgroundColor = comp.backgroundColor;
          if (comp.borderColor && !comp.borderColor.includes('oklch')) clonedElement.style.borderColor = comp.borderColor;
        }

        const origChildren = Array.from(element.querySelectorAll('*'));
        const clonedChildren = Array.from(clonedElement.querySelectorAll('*'));

        origChildren.forEach((origChild, idx) => {
          const clonedChild = clonedChildren[idx];
          if (origChild instanceof HTMLElement && clonedChild instanceof HTMLElement) {
            const comp = window.getComputedStyle(origChild);
            if (comp.color && !comp.color.includes('oklch')) {
              clonedChild.style.color = comp.color;
            }
            if (comp.backgroundColor && !comp.backgroundColor.includes('oklch')) {
              clonedChild.style.backgroundColor = comp.backgroundColor;
            }
            if (comp.borderColor && !comp.borderColor.includes('oklch')) {
              clonedChild.style.borderColor = comp.borderColor;
            }
          }
        });
      } catch (err) {
        console.warn('Safe html2canvas computed style clone warning:', err);
      }

      // 2. Sanitize all <style> blocks in cloned document to remove oklch() functions that break html2canvas parser
      try {
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach((styleTag) => {
          if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
            styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]+\)/gi, 'transparent');
          }
        });
      } catch (err) {
        console.warn('Safe html2canvas style sanitize warning:', err);
      }

      // 3. Also sanitize inline style attributes if any contain oklch
      try {
        const allCloned = clonedDoc.querySelectorAll('*');
        allCloned.forEach((el) => {
          const styleAttr = el.getAttribute('style');
          if (styleAttr && styleAttr.includes('oklch')) {
            el.setAttribute('style', styleAttr.replace(/oklch\([^)]+\)/gi, 'transparent'));
          }
        });
      } catch (err) {
        console.warn('Safe html2canvas inline style sanitize warning:', err);
      }

      if (customOnClone) {
        customOnClone(clonedDoc, clonedElement);
      }
    }
  };

  return html2canvas(element, mergedOptions);
}
