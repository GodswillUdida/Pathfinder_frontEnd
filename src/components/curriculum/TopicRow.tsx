"use client";

import { Paperclip, FileText, Loader2 } from "lucide-react";
// import { InlineEditableText } from "./InlineEditableText";
import { ItemActionsMenu } from "./ItemActionsMenu";
import type { Topic } from "@/types/curriculum";

interface Props {
  topic: Topic;
  onRename: (title: string) => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDuplicating?: boolean;
}

export function TopicRow({ topic, onRename, onEdit, onDelete, isDuplicating }: Props) {
  const resourceCount = topic.resources?.length ?? 0;

  return (
    <div className="group flex items-center gap-2 pl-8 pr-2 py-2 rounded-lg hover:bg-black/[0.025] dark:hover:bg-white/[0.03] transition-colors duration-150">
      <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-white/35 shrink-0" aria-hidden="true" />

      {/* <div className="flex-1 min-w-0">
        <InlineEditableText
          value={topic.title}
          onSave={onRename}
          placeholder="Untitled topic"
          className="text-[12.5px] text-gray-700 dark:text-white/80"
        />
      </div> */}

      {resourceCount > 0 && (
        <span className="flex items-center gap-1 text-[10.5px] text-gray-400 dark:text-white/30 shrink-0 tabular-nums">
          <Paperclip className="w-3 h-3" aria-hidden="true" />
          {resourceCount}
        </span>
      )}

      {isDuplicating && <Loader2 className="w-3 h-3 animate-spin text-gray-400" aria-hidden="true" />}

      <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        <ItemActionsMenu onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}