/**
 * Markdown to sanitized HTML for HTML thread exports. The unified toolchain is
 * imported on first use, so a server that never exports never loads it.
 */

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Array<HastNode>;
}

export interface ThreadExportMarkdownRenderer {
  /** Parses and sanitizes, the way the thread view renders assistant text. */
  readonly parse: (markdown: string) => HastNode;
  /** Absolute local paths the tree's images point at. */
  readonly localImagePaths: (tree: HastNode) => ReadonlyArray<string>;
  /** Serializes, swapping each local image for its data URL or its alt text. */
  readonly toHtml: (tree: HastNode, imageDataUrl: (path: string) => string | null) => string;
}

function visit(node: HastNode, visitor: (node: HastNode, parent: HastNode | null) => void) {
  const walk = (current: HastNode, parent: HastNode | null) => {
    visitor(current, parent);
    for (const child of current.children ?? []) walk(child, current);
  };
  walk(node, null);
}

/** `/abs/path`, `C:\path` or `file:///abs/path`, as agents write local images. */
export function threadExportLocalImagePath(src: unknown): string | null {
  if (typeof src !== "string" || src.length === 0) return null;
  if (src.startsWith("file://")) {
    try {
      return decodeURIComponent(new URL(src).pathname).replace(/^\/([A-Za-z]:\/)/, "$1");
    } catch {
      return null;
    }
  }
  if (src.startsWith("/") && !src.startsWith("//")) return decodeURIComponent(src);
  if (/^[A-Za-z]:[\\/]/.test(src)) return src;
  return null;
}

let loading: Promise<ThreadExportMarkdownRenderer> | null = null;

export function loadThreadExportMarkdownRenderer(): Promise<ThreadExportMarkdownRenderer> {
  loading ??= (async () => {
    const [unified, remarkParse, remarkGfm, remarkRehype, rehypeSanitize, hastToHtml] =
      await Promise.all([
        import("unified"),
        import("remark-parse"),
        import("remark-gfm"),
        import("remark-rehype"),
        import("rehype-sanitize"),
        import("hast-util-to-html"),
      ]);
    // Sanitizing would drop `file:` image URLs, so rewrite them to plain
    // paths first; serialization then inlines or removes them.
    const keepLocalImages = () => (tree: HastNode) => {
      visit(tree, (node) => {
        if (node.type !== "element" || node.tagName !== "img" || !node.properties) return;
        const path = threadExportLocalImagePath(node.properties.src);
        if (path !== null) node.properties.src = path;
      });
    };
    const processor = unified
      .unified()
      .use(remarkParse.default)
      .use(remarkGfm.default)
      .use(remarkRehype.default)
      .use(keepLocalImages)
      .use(rehypeSanitize.default);
    return {
      parse: (markdown) => processor.runSync(processor.parse(markdown)) as unknown as HastNode,
      localImagePaths: (tree) => {
        const paths: Array<string> = [];
        visit(tree, (node) => {
          if (node.type !== "element" || node.tagName !== "img") return;
          const path = threadExportLocalImagePath(node.properties?.src);
          if (path !== null) paths.push(path);
        });
        return paths;
      },
      toHtml: (tree, imageDataUrl) => {
        visit(tree, (node, parent) => {
          if (node.type !== "element" || !node.properties) return;
          if (node.tagName === "img") {
            const path = threadExportLocalImagePath(node.properties.src);
            if (path === null) return;
            const url = imageDataUrl(path);
            if (url !== null) {
              node.properties.src = url;
              return;
            }
            // A path only means something on the machine that wrote it.
            const alt = typeof node.properties.alt === "string" ? node.properties.alt : "";
            const index = parent?.children?.indexOf(node) ?? -1;
            if (parent?.children && index >= 0) {
              parent.children[index] = { type: "text", value: alt } as HastNode;
            }
            return;
          }
          if (node.tagName === "a" && typeof node.properties.href === "string") {
            if (/^https?:/i.test(node.properties.href)) {
              node.properties.target = "_blank";
              node.properties.rel = ["noopener", "noreferrer"];
            }
          }
        });
        return hastToHtml.toHtml(tree as never);
      },
    } satisfies ThreadExportMarkdownRenderer;
  })().catch((cause: unknown) => {
    // Let the next export try again rather than repeat a failed import forever.
    loading = null;
    throw cause;
  });
  return loading;
}
