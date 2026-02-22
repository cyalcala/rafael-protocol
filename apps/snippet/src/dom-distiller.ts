/**
 * DOM Distiller
 * Converts the live DOM into a compact SemanticTree
 */

import type { SemanticTree, SemanticElement } from '@rafael/types';

// PII field types to strip
const PII_FIELDS = [
  'password',
  'ssn',
  'social-security',
  'credit-card',
  'cc-number',
  'cvv',
  'bank-account',
  'routing-number'
];

export class DOMDistiller {
  private maxElements = 200;
  
  /**
   * Capture the current DOM state as a semantic tree
   */
  capture(): SemanticTree {
    const elements = this.extractElements(document.body);
    const url = window.location.href;
    const title = document.title;
    
    return {
      url,
      title,
      elements,
      timestamp: Date.now()
    };
  }

  /**
   * Extract meaningful elements from the DOM
   */
  private extractElements(root: Element): SemanticElement[] {
    const elements: SemanticElement[] = [];
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Element) => {
          if (this.isInteractiveElement(node) || this.isMeaningfulElement(node)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node: Element | null;
    while ((node = walker.nextNode() as Element) && elements.length < this.maxElements) {
      const semanticElement = this.elementToSemantic(node);
      if (semanticElement && !this.isPIIField(semanticElement)) {
        elements.push(semanticElement);
      }
    }

    return elements;
  }

  /**
   * Check if element is interactive
   */
  private isInteractiveElement(element: Element): boolean {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    return (
      tag === 'button' ||
      tag === 'a' ||
      tag === 'input' ||
      tag === 'select' ||
      tag === 'textarea' ||
      tag === 'checkbox' ||
      tag === 'radio' ||
      (role && ['button', 'link', 'menuitem', 'checkbox', 'radio'].includes(role))
    );
  }

  /**
   * Check if element is meaningful (containers, headings, etc.)
   */
  private isMeaningfulElement(element: Element): boolean {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    return (
      tag === 'h1' ||
      tag === 'h2' ||
      tag === 'h3' ||
      tag === 'h4' ||
      tag === 'h5' ||
      tag === 'h6' ||
      tag === 'nav' ||
      tag === 'header' ||
      tag === 'footer' ||
      tag === 'section' ||
      tag === 'article' ||
      (role && ['banner', 'navigation', 'main', 'complementary', 'contentinfo'].includes(role))
    );
  }

  /**
   * Convert DOM element to semantic element
   */
  private elementToSemantic(element: Element): SemanticElement | null {
    const tag = element.tagName.toLowerCase();
    const id = element.id || undefined;
    const classes = Array.from(element.classList).join(' ') || undefined;
    
    // Get accessible label in priority order
    const label = this.getAccessibleLabel(element);
    const placeholder = element.getAttribute('placeholder') || undefined;
    const text = this.getTextContent(element);
    const type = element.getAttribute('type') || undefined;
    const name = element.getAttribute('name') || undefined;
    const value = element.getAttribute('value') || undefined;
    const href = element.getAttribute('href') || undefined;
    const role = element.getAttribute('role') || undefined;
    const testId = element.getAttribute('data-testid') || undefined;
    
    // Get bounding rect for positioning
    const rect = element.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0;
    
    return {
      tag,
      id,
      classes,
      label,
      placeholder,
      text,
      type,
      name,
      value,
      href,
      role,
      testId,
      visible,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    };
  }

  /**
   * Get accessible label in priority order
   */
  private getAccessibleLabel(element: Element): string | undefined {
    // aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;
    
    // aria-labelledby
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return this.getTextContent(labelElement);
    }
    
    // label for
    const htmlFor = element.getAttribute('id');
    if (htmlFor) {
      const label = document.querySelector(`label[for="${htmlFor}"]`);
      if (label) return this.getTextContent(label);
    }
    
    // title
    const title = element.getAttribute('title');
    if (title) return title;
    
    return undefined;
  }

  /**
   * Get text content (trimmed)
   */
  private getTextContent(element: Element): string {
    return element.textContent?.trim() || '';
  }

  /**
   * Check if element is a PII field
   */
  private isPIIField(element: SemanticElement): boolean {
    const type = element.type?.toLowerCase();
    const name = element.name?.toLowerCase();
    const id = element.id?.toLowerCase();
    const label = element.label?.toLowerCase();
    
    const checkFields = [type, name, id, label].filter(Boolean);
    
    return checkFields.some(field => 
      PII_FIELDS.some(pii => field?.includes(pii))
    );
  }
}
