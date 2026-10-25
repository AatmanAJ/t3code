import { describe, expect, it, vi } from "vite-plus/test";
import { page } from "vite-plus/test/browser";

import { render } from "../../../test/render";
import { anchoredToastManager } from "../ui/toast";
import { MarkdownCodeBlock } from "./MarkdownCodeBlock";

function CodeBlock() {
  return (
    <MarkdownCodeBlock
      code={"echo hi\n"}
      fenceTitle={null}
      isStreaming={false}
      language="sh"
      theme="light"
    >
      <pre>echo hi</pre>
    </MarkdownCodeBlock>
  );
}

// Plain HTTP (a LAN address) has no `navigator.clipboard`.
function withoutClipboardApi() {
  return vi.spyOn(navigator, "clipboard", "get").mockReturnValue(undefined as never);
}

describe("code block copy without the Clipboard API", () => {
  it("copies through the fallback", async () => {
    using _clipboard = withoutClipboardApi();
    using execCommand = vi.spyOn(document, "execCommand").mockReturnValue(true);
    await using _screen = await render(<CodeBlock />);

    await page.getByRole("button", { name: "Copy code" }).click();

    expect(execCommand).toHaveBeenCalledWith("copy");
    await expect.element(page.getByRole("button", { name: "Copied" })).toBeVisible();
  });

  it("says so when copying fails", async () => {
    using _clipboard = withoutClipboardApi();
    using _execCommand = vi.spyOn(document, "execCommand").mockReturnValue(false);
    using _console = vi.spyOn(console, "error").mockImplementation(() => undefined);
    using toast = vi.spyOn(anchoredToastManager, "add");
    await using _screen = await render(<CodeBlock />);

    await page.getByRole("button", { name: "Copy code" }).click();

    await expect.poll(() => toast.mock.calls.at(-1)?.[0].title).toBe("Failed to copy");
    await expect.element(page.getByRole("button", { name: "Copy code" })).toBeVisible();
  });
});
