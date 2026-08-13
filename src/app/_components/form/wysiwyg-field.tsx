"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useFieldContext } from "./contexts";
import FieldErrors from "./field-errors";
import FieldLabel from "./field-label";

type WysiwygFieldProps = {
  label: string;
  description?: ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
};

export default function WysiwygField({
  label,
  description,
  className,
  disabled = false,
  required = false,
}: WysiwygFieldProps) {
  const field = useFieldContext<string>();
  const errorId = `${field.name}-error`;
  const showErrors = field.state.meta.isTouched && !field.state.meta.isValid;
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          enableClickSelection: true,
          HTMLAttributes: {
            target: null,
            rel: "noopener noreferrer nofollow",
          },
        },
      }),
    ],
    content: field.state.value,
    editorProps: {
      attributes: {
        id: field.name,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
        "aria-describedby": errorId,
        class:
          "min-h-32 px-3 py-2 text-sm outline-none [&_a]:cursor-text [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
      },
    },
    onBlur: () => {
      field.handleBlur();
      void field.validate("change");
    },
    onUpdate: ({ editor: updatedEditor }) => {
      field.handleChange(updatedEditor.isEmpty ? "" : updatedEditor.getHTML());
    },
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return null;
      }

      return {
        bold: currentEditor.isActive("bold"),
        bulletList: currentEditor.isActive("bulletList"),
        canRedo: currentEditor.can().chain().focus().redo().run(),
        canUndo: currentEditor.can().chain().focus().undo().run(),
        heading: currentEditor.isActive("heading", { level: 2 }),
        italic: currentEditor.isActive("italic"),
        orderedList: currentEditor.isActive("orderedList"),
        strike: currentEditor.isActive("strike"),
      };
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    // Empty headings/lists still count as empty HTML, but resetting them
    // to "" would undo markdown shortcuts like `# ` and `- `.
    if (field.state.value === "" && editor.isEmpty) return;
    if (editor.getHTML() === field.state.value) return;

    editor.commands.setContent(field.state.value, { emitUpdate: false });
  }, [editor, field.state.value]);

  return (
    <div className={cn("grid gap-1.5", className)}>
      <FieldLabel
        htmlFor={field.name}
        label={label}
        description={description}
        required={required}
      />
      <div
        className="border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 overflow-hidden border bg-transparent focus-within:ring-1"
        aria-invalid={showErrors}
        onClickCapture={preventLinkNavigation}
        onAuxClickCapture={preventLinkNavigation}
      >
        <div className="bg-muted/40 flex flex-wrap gap-0.5 border-b p-1">
          <ToolbarButton
            label="Undo"
            disabled={disabled || !editorState?.canUndo}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <Undo2 />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            disabled={disabled || !editorState?.canRedo}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <Redo2 />
          </ToolbarButton>
          <ToolbarButton
            label="Heading"
            active={editorState?.heading}
            disabled={disabled}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 />
          </ToolbarButton>
          <ToolbarButton
            label="Bold"
            active={editorState?.bold}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editorState?.italic}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            active={editorState?.strike}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Strikethrough />
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            active={editorState?.bulletList}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editorState?.orderedList}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      {showErrors && (
        <FieldErrors id={errorId} errors={field.state.meta.errors} />
      )}
    </div>
  );
}

function preventLinkNavigation(event: React.MouseEvent) {
  const target = event.target;
  const element =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;

  if (element?.closest("a")) {
    event.preventDefault();
  }
}

function ToolbarButton({
  active,
  label,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type" | "variant"> & {
  active?: boolean;
  label: string;
}) {
  return (
    <Button
      {...props}
      type="button"
      size="icon-xs"
      variant={active ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={active}
      title={label}
    />
  );
}
