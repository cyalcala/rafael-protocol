/**
 * Action Executor
 * Executes AI tool calls in the live DOM
 */

export class ActionExecutor {
  /**
   * Execute a tool call in the DOM
   */
  async execute(tool: string, params: Record<string, unknown>): Promise<unknown> {
    switch (tool) {
      case 'click_element':
        return this.clickElement(params);
        
      case 'fill_field':
        return this.fillField(params);
        
      case 'select_option':
        return this.selectOption(params);
        
      case 'navigate':
        return this.navigate(params);
        
      case 'scroll_to':
        return this.scrollTo(params);
        
      case 'wait_for':
        return this.waitFor(params);
        
      case 'read_page':
        return this.readPage(params);
        
      case 'show_tooltip':
        return this.showTooltip(params);
        
      default:
        console.warn(`[ActionExecutor] Unknown tool: ${tool}`);
        return { error: `Unknown tool: ${tool}` };
    }
  }

  /**
   * Click an element using 6-strategy cascade
   */
  private async clickElement(params: Record<string, unknown>): Promise<{ success: boolean }> {
    const label = params.label as string;
    const confidence = params.confidence as number;
    
    if (confidence < 0.7) {
      return { success: false, error: 'Confidence too low' };
    }
    
    // Try strategies in order
    const strategies = [
      () => this.findByAriaLabelExact(label),
      () => this.findByAriaLabelPartial(label),
      () => this.findByTextExact(label),
      () => this.findByTextPartial(label),
      () => this.findByTestId(label),
      () => this.findByPlaceholder(label)
    ];
    
    for (const strategy of strategies) {
      const element = strategy();
      if (element) {
        return this.performClick(element);
      }
    }
    
    return { success: false, error: 'Element not found' };
  }

  /**
   * Fill a form field
   */
  private async fillField(params: Record<string, unknown>): Promise<{ success: boolean }> {
    const label = params.label as string;
    const value = params.value as string;
    
    const strategies = [
      () => this.findByAriaLabelExact(label),
      () => this.findByPlaceholder(label),
      () => this.findByLabelText(label)
    ];
    
    for (const strategy of strategies) {
      const element = strategy();
      if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
        return this.performType(element, value);
      }
    }
    
    return { success: false, error: 'Field not found' };
  }

  /**
   * Select an option from a dropdown
   */
  private async selectOption(params: Record<string, unknown>): Promise<{ success: boolean }> {
    const label = params.label as string;
    const value = params.value as string;
    
    const select = this.findByLabelText(label) as HTMLSelectElement;
    if (select) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { success: true };
    }
    
    return { success: false, error: 'Select not found' };
  }

  /**
   * Navigate to a relative path
   */
  private async navigate(params: Record<string, unknown>): Promise<{ success: boolean }> {
    const path = params.path as string;
    
    if (path.startsWith('http')) {
      window.location.href = path;
    } else {
      window.location.pathname = path;
    }
    
    return { success: true };
  }

  /**
   * Scroll to an element
   */
  private async scrollTo(params: Record<string, unknown>): Promise<{ success: boolean }> {
    const label = params.label as string;
    const element = this.findByTextPartial(label);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return { success: true };
    }
    
    return { success: false, error: 'Element not found' };
  }

  /**
   * Wait for an element to appear
   */
  private async waitFor(params: Record<string, unknown>): Promise<{ success: boolean }> {
    const label = params.label as string;
    const timeout = (params.timeout as number) || 5000;
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = this.findByTextPartial(label);
      if (element) {
        return { success: true };
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { success: false, error: 'Timeout waiting for element' };
  }

  /**
   * Read the current page
   */
  private async readPage(params: Record<string, unknown>): Promise<{ content: string }> {
    const focusArea = params.focus_area as string;
    
    // Just return document text for now
    return {
      content: document.body.innerText.substring(0, 5000)
    };
  }

  /**
   * Show a tooltip
   */
  private async showTooltip(params: Record<string, unknown>): Promise<{ success: boolean }> {
    const message = params.message as string;
    const label = params.label as string;
    
    console.log(`[Rafael Tooltip] ${label}: ${message}`);
    return { success: true };
  }

  // Element finding strategies
  private findByAriaLabelExact(label: string): Element | null {
    return document.querySelector(`[aria-label="${label}"]`);
  }

  private findByAriaLabelPartial(label: string): Element | null {
    return document.querySelector(`[aria-label*="${label}"]`);
  }

  private findByTextExact(text: string): Element | null {
    return Array.from(document.querySelectorAll('button, a, [role="button"]'))
      .find(el => el.textContent?.trim() === text) || null;
  }

  private findByTextPartial(text: string): Element | null {
    return Array.from(document.querySelectorAll('button, a, [role="button"]'))
      .find(el => el.textContent?.includes(text)) || null;
  }

  private findByTestId(testId: string): Element | null {
    return document.querySelector(`[data-testid="${testId}"]`);
  }

  private findByPlaceholder(placeholder: string): Element | null {
    return document.querySelector(`[placeholder*="${placeholder}"]`);
  }

  private findByLabelText(label: string): Element | null {
    const labelElement = Array.from(document.querySelectorAll('label'))
      .find(el => el.textContent?.includes(label));
    
    if (labelElement) {
      const htmlFor = labelElement.getAttribute('for');
      if (htmlFor) {
        return document.getElementById(htmlFor);
      }
      return labelElement.querySelector('input, select, textarea');
    }
    
    return null;
  }

  // Action helpers
  private async performClick(element: Element): Promise<{ success: boolean }> {
    // Scroll into view
    element.scrollIntoView({ block: 'center' });
    
    // Dispatch synthetic events for framework compatibility
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    
    return { success: true };
  }

  private async performType(element: HTMLInputElement | HTMLTextAreaElement, value: string): Promise<{ success: boolean }> {
    // Clear existing value
    element.value = '';
    
    // Type character by character with delays
    for (const char of value) {
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    return { success: true };
  }
}
