import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import {
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import type {
  OrchestrationExportThreadResult,
  OrchestrationThreadExportDetail,
  OrchestrationThreadExportFormat,
  ScopedThreadRef,
} from "@t3tools/contracts";
import {
  FileCodeIcon,
  FileTextIcon,
  ListTreeIcon,
  MessagesSquareIcon,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { create } from "zustand";

import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { useHtmlRenderTheme } from "~/hooks/useHtmlRenderTheme";
import { cn } from "~/lib/utils";
import { useThreadShell } from "~/state/entities";
import { orchestrationEnvironment } from "~/state/orchestration";
import { useAtomCommand } from "~/state/use-atom-command";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "./ui/dialog";
import { RadioGroup } from "./ui/radio-group";
import { Spinner } from "./ui/spinner";
import { toastManager } from "./ui/toast";

const useExportRequest = create<{ threadRef: ScopedThreadRef | null }>(() => ({
  threadRef: null,
}));

/**
 * Opens the export dialog for a thread. Any entry point can call it (thread
 * menus, the command palette); the dialog is mounted once at the app root, so
 * it outlives a palette or menu that closes as soon as it is used.
 */
export function openThreadExportDialog(threadRef: ScopedThreadRef): void {
  useExportRequest.setState({ threadRef });
}

function closeThreadExportDialog(): void {
  useExportRequest.setState({ threadRef: null });
}

export function ThreadExportDialogHost() {
  const threadRef = useExportRequest((state) => state.threadRef);
  useEffect(() => closeThreadExportDialog, []);
  return threadRef === null ? null : (
    <ThreadExportDialog
      key={`${threadRef.environmentId}:${threadRef.threadId}`}
      threadRef={threadRef}
    />
  );
}

interface Choice<Value extends string> {
  readonly value: Value;
  readonly label: string;
  readonly description: string;
  readonly Icon: LucideIcon;
}

const FORMATS: ReadonlyArray<Choice<OrchestrationThreadExportFormat>> = [
  {
    value: "markdown",
    label: "Markdown",
    description: "Paste into a PR, an issue or your notes",
    Icon: FileTextIcon,
  },
  {
    value: "html",
    label: "Web page",
    description: "One file in your theme, visual replies included",
    Icon: FileCodeIcon,
  },
];

const DETAILS: ReadonlyArray<Choice<OrchestrationThreadExportDetail>> = [
  {
    value: "conversation",
    label: "Conversation",
    description: "Messages, plans and visual replies",
    Icon: MessagesSquareIcon,
  },
  {
    value: "full",
    label: "Everything",
    description: "Adds commands, output, diffs and thinking",
    Icon: ListTreeIcon,
  },
];

// The last choice, so exporting a few threads in a row needs no re-picking.
let lastChoice: {
  format: OrchestrationThreadExportFormat;
  detail: OrchestrationThreadExportDetail;
} = { format: "markdown", detail: "conversation" };

function saveExportFile(file: OrchestrationExportThreadResult): void {
  const url = URL.createObjectURL(
    new Blob([file.content], { type: `${file.mimeType};charset=utf-8` }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.fileName;
  anchor.click();
  // The desktop save dialog reads the Blob after the click returns.
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

const SHORTENED_NOTE = "Long command output, diffs or large images were shortened.";

function ChoiceCards<Value extends string>(props: {
  readonly labelId: string;
  readonly label: string;
  readonly value: Value;
  readonly choices: ReadonlyArray<Choice<Value>>;
  readonly disabled: boolean;
  readonly onChange: (value: Value) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span id={props.labelId} className="text-xs font-medium text-foreground">
        {props.label}
      </span>
      <RadioGroup
        value={props.value}
        onValueChange={(value) => props.onChange(value as Value)}
        aria-labelledby={props.labelId}
        disabled={props.disabled}
        className="grid grid-cols-1 sm:grid-cols-2"
      >
        {props.choices.map((choice) => (
          <RadioPrimitive.Root
            key={choice.value}
            value={choice.value}
            className={cn(
              "relative flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left outline-none transition-[background-color,border-color,box-shadow]",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              props.value === choice.value
                ? "border-primary bg-background shadow-sm ring-2 ring-primary/35 dark:border-transparent dark:bg-primary/10 dark:shadow-none dark:ring-1 dark:ring-primary/30"
                : "border-border bg-background hover:border-foreground/20 hover:bg-muted/50 dark:border-transparent dark:bg-white/[0.035] dark:hover:bg-accent",
            )}
          >
            <choice.Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">{choice.label}</span>
              <span className="block text-xs text-muted-foreground">{choice.description}</span>
            </span>
          </RadioPrimitive.Root>
        ))}
      </RadioGroup>
    </div>
  );
}

function ThreadExportDialog(props: { readonly threadRef: ScopedThreadRef }) {
  const id = useId();
  const thread = useThreadShell(props.threadRef);
  const theme = useHtmlRenderTheme();
  const [format, setFormat] = useState(lastChoice.format);
  const [detail, setDetail] = useState(lastChoice.detail);
  const [pending, setPending] = useState<"save" | "copy" | null>(null);
  const exportThread = useAtomCommand(orchestrationEnvironment.exportThread, {
    reportFailure: false,
  });
  const { copyToClipboard } = useCopyToClipboard<{ readonly truncated: boolean }>({
    target: "thread",
    onCopy: ({ truncated }) => {
      toastManager.add({
        type: "success",
        title: "Thread copied as Markdown",
        ...(truncated ? { description: SHORTENED_NOTE } : {}),
      });
    },
    onError: (error) => {
      toastManager.add({
        type: "error",
        title: "Could not copy the thread",
        description: error.message,
      });
    },
  });

  const run = async (action: "save" | "copy") => {
    const chosenFormat = action === "copy" ? "markdown" : format;
    lastChoice = { format, detail };
    setPending(action);
    const result = await exportThread({
      environmentId: props.threadRef.environmentId,
      input: {
        threadId: props.threadRef.threadId,
        format: chosenFormat,
        detail,
        ...(chosenFormat === "html" ? { theme } : {}),
      },
    });
    setPending(null);
    if (result._tag === "Failure") {
      if (!isAtomCommandInterrupted(result)) {
        const error = squashAtomCommandFailure(result);
        toastManager.add({
          type: "error",
          title: "Could not export the thread",
          description: error instanceof Error ? error.message : "Try again in a moment.",
        });
      }
      return;
    }
    const file = result.value;
    if (action === "copy") {
      copyToClipboard(file.content, { truncated: file.truncated });
    } else {
      saveExportFile(file);
      toastManager.add({
        type: "success",
        title: `Saved ${file.fileName}`,
        ...(file.truncated ? { description: SHORTENED_NOTE } : {}),
      });
    }
    closeThreadExportDialog();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && pending === null) closeThreadExportDialog();
      }}
    >
      <DialogPopup className="sm:max-w-lg">
        <form
          className="flex min-h-0 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            void run("save");
          }}
        >
          <DialogHeader>
            <DialogTitle>Export thread</DialogTitle>
            <DialogDescription>
              {thread === null ? "Save this thread as a file to share or keep." : thread.title}
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div className="flex flex-col gap-5">
              <ChoiceCards
                labelId={`${id}-format`}
                label="Format"
                value={format}
                choices={FORMATS}
                disabled={pending !== null}
                onChange={setFormat}
              />
              <ChoiceCards
                labelId={`${id}-detail`}
                label="Include"
                value={detail}
                choices={DETAILS}
                disabled={pending !== null}
                onChange={setDetail}
              />
              <p className="text-xs text-muted-foreground">
                {detail === "full"
                  ? "Command output and diffs can contain file contents, paths and secrets from your machine. Check the file before you share it."
                  : "Only what you and the agent said, plus plans and visual replies. Check the file before you share it."}
              </p>
            </div>
          </DialogPanel>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending !== null}
              onClick={() => void run("copy")}
            >
              {pending === "copy" ? <Spinner /> : null}
              Copy as Markdown
            </Button>
            <Button type="submit" disabled={pending !== null}>
              {pending === "save" ? <Spinner /> : null}
              {format === "html" ? "Save web page" : "Save Markdown"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
