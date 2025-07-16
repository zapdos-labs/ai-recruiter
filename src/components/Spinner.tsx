import { VsLoading } from "solid-icons/vs";

export default function Spinner(opts: { class?: string }) {
  return (
    <div class="flex justify-center">
      <div class="animate-spin">
        <VsLoading
          class={opts.class || "w-8 h-8 text-zinc-900 dark:text-zinc-200"}
        />
      </div>
    </div>
  );
}
