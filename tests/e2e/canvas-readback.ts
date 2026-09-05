import type { Page } from "@playwright/test";

export async function enableCanvasReadback(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      options?: unknown,
    ) {
      const attributes =
        contextId === "webgl2" || contextId === "webgl"
          ? {
              ...(options as WebGLContextAttributes | undefined),
              preserveDrawingBuffer: true,
            }
          : options;
      return original.call(this, contextId, attributes);
    } as typeof original;
  });
}
