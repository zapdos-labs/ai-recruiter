import { VsListFlat, VsSearch } from "solid-icons/vs";
import { For } from "solid-js";
import UploadButton from "~/lib/upload/UploadButton";

export default function LeftBar() {
  return (
    <div class="flex flex-col bg-white dark:bg-zinc-900 h-full ">
      <div class="flex-none">
        <div class="flex items-center gap-2 p-2">
          <div class="flex-1 flex items-center gap-2">
            <VsListFlat class="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
            <h2 class="text-sm text-zinc-800 dark:text-zinc-200">Library</h2>
          </div>

          <div class="flex-none flex items-center gap-2">
            <UploadButton />
            <button class="action-btn">
              <VsSearch />
            </button>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden">
        <div class="space-y-2 h-full overflow-auto">
          <For each={Array.from({ length: 20 })}>
            {(_, i) => <img src={`/demo/${i()}.jpg`} />}
          </For>
        </div>
      </div>
    </div>
  );
}
