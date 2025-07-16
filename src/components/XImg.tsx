import { HTMLProps } from "@ark-ui/solid";
import { createSignal } from "solid-js";

export default function XImg(props: HTMLProps<"img">) {
  const [loaded, setLoaded] = createSignal(false);

  return (
    <div class="w-full aspect-video">
      {!loaded() && (
        <div class="absolute top-0 left-0 right-0 bottom-0  aspect-video bg-zinc-200 dark:bg-zinc-800 animate-pulse border border-zinc-300 dark:border-zinc-700" />
      )}
      <img
        {...props}
        style={{ opacity: loaded() ? "1" : "0" }}
        class={`w-full aspect-video object-cover border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity ${
          props.class || ""
        }`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
