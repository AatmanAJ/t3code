import { describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";

import { render } from "../../test/render";
import { usePersistedSidebarOpen } from "./AppSidebarLayout";
import { THREAD_SIDEBAR_OPEN_STORAGE_KEY } from "./threadSidebarWidth";
import { SidebarProvider, useSidebar } from "./ui/sidebar";

function ToggleButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <button onClick={toggleSidebar} type="button">
      Toggle
    </button>
  );
}

function PersistedSidebar() {
  const [open, setOpen] = usePersistedSidebarOpen();
  return (
    <SidebarProvider onOpenChange={setOpen} open={open}>
      <ToggleButton />
    </SidebarProvider>
  );
}

async function desktopWithFreshStorage(): Promise<Disposable> {
  await page.viewport(1280, 900);
  localStorage.removeItem(THREAD_SIDEBAR_OPEN_STORAGE_KEY);
  return { [Symbol.dispose]: () => localStorage.removeItem(THREAD_SIDEBAR_OPEN_STORAGE_KEY) };
}

function sidebarState() {
  return document.querySelector("[data-sidebar-state]")?.getAttribute("data-sidebar-state");
}

// regression: #24191
describe("persisted sidebar open state", () => {
  it("starts expanded on first launch", async () => {
    using _storage = await desktopWithFreshStorage();
    await using _screen = await render(<PersistedSidebar />);

    expect(sidebarState()).toBe("expanded");
  });

  it("stays collapsed after a remount", async () => {
    using _storage = await desktopWithFreshStorage();
    {
      await using _screen = await render(<PersistedSidebar />);
      await page.getByRole("button", { name: "Toggle" }).click();
      expect(sidebarState()).toBe("collapsed");
    }

    await using _screen = await render(<PersistedSidebar />);
    expect(sidebarState()).toBe("collapsed");
  });
});
