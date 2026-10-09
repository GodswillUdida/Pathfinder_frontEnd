"use client";

import { FileText, ExternalLink, Paperclip } from "lucide-react";
import { ItemActionsMenu } from "./ItemActionsMenu";
import type { Topic } from "@/types/curriculum";

interface Props {
  topic: Topic;
  moduleId: string;
  onEdit: () => void;
  onDelete: () => void;
}

function isUrl(value: string) {
  return /^https?:\/\//.test(value);
}

export function TopicListItem({ topic, onEdit, onDelete }: Props) {
  const resources = topic.resources ?? [];

  return (
    <div className="pl-8 pr-2 py-2.5 rounded-lg hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
      <div className="flex items-start gap-2">
        <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-white/35 shrink-0 mt-0.5" aria-hidden="true" />

        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={onEdit}
            className="text-left text-[12.5px] font-medium text-gray-800 dark:text-white/85 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            {topic.title}
          </button>

          {resources.length > 0 && (
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {resources.map((resource, i) =>
                isUrl(resource) ? (
                  <li key={i}>
                    <a
                      href={resource}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10.5px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-full px-2 py-0.5 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                    >
                      <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                      {resource.length > 28 ? `${resource.slice(0, 28)}…` : resource}
                    </a>
                  </li>
                ) : (
                  <li
                    key={i}
                    className="flex items-center gap-1 text-[10.5px] text-gray-500 dark:text-white/45 bg-gray-100 dark:bg-white/[0.06] rounded-full px-2 py-0.5"
                  >
                    <Paperclip className="w-2.5 h-2.5" aria-hidden="true" />
                    {resource}
                  </li>
                ),
              )}
            </ul>
          )}
        </div>

        <ItemActionsMenu onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}