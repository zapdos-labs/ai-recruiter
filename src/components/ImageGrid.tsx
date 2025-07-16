import { Accessor, createEffect, createSignal, For } from "solid-js";
import { Portal } from "solid-js/web";
import { Dialog } from "@ark-ui/solid/dialog";
import { getDownloadUrls$ } from "~/functions";
import { VsClose } from "solid-icons/vs";
import XImg from "./XImg";

export default function ImageGrid(props: {
  scenes: Accessor<{ object_id: string; start_ms: number; end_ms: number }[]>;
}) {
  const [urls, setUrls] = createSignal<string[]>([]);
  const [selectedImage, setSelectedImage] = createSignal<string>("");
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [selectedInfo, setSelectedInfo] = createSignal<{
    start_ms: number;
    end_ms: number;
  } | null>(null);

  createEffect(async () => {
    const scenes = props.scenes();
    const ids = scenes.map((scene) => scene.object_id);
    const result = await getDownloadUrls$(ids);
    const newUrls = Object.values(result.data?.urls || {});
    setUrls(newUrls);
  });

  const handleImageClick = (
    url: string,
    info: { start_ms: number; end_ms: number }
  ) => {
    setSelectedImage(url);
    setSelectedInfo(info);
    setDialogOpen(true);
  };

  // Helper to format ms to mm:ss
  const formatMs = (ms: number) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 sm:gap-1 md:gap-2 ">
        <For each={props.scenes()}>
          {(scene, i) => (
            <div class="relative">
              <XImg
                src={urls()[i()]}
                alt="Scene"
                class="w-full aspect-video object-cover border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity"
                loading="lazy"
                onClick={() =>
                  handleImageClick(urls()[i()], {
                    start_ms: scene.start_ms,
                    end_ms: scene.end_ms,
                  })
                }
              />
              <div class="absolute bottom-0 left-0 w-full bg-black/50 bg-opacity-90 text-white text-xs px-2 py-1 flex justify-between items-center">
                <span>{formatMs(scene.start_ms)}</span>
                <span>{formatMs(scene.end_ms)}</span>
              </div>
            </div>
          )}
        </For>
      </div>

      <Dialog.Root open={dialogOpen()} onOpenChange={setDialogOpen}>
        <Portal>
          <Dialog.Backdrop class="fixed inset-0 bg-black bg-opacity-50 z-40" />
          <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center ">
            <Dialog.Content class="bg-white dark:bg-zinc-800 shadow-xl max-w-4xl max-h-full overflow-hidden">
              <div class="relative">
                <XImg
                  src={selectedImage()}
                  alt="Selected scene"
                  class="max-w-full max-h-[80vh] object-contain"
                />
                {selectedInfo() && (
                  <div class="absolute bottom-0 left-0 w-full bg-black/50 bg-opacity-90 text-white text-xs px-2 py-1 flex justify-between items-center">
                    <span>{formatMs(selectedInfo()!.start_ms)}</span>
                    <span>{formatMs(selectedInfo()!.end_ms)}</span>
                  </div>
                )}
                <Dialog.CloseTrigger
                  onClick={() => setDialogOpen(false)}
                  class="absolute top-2 right-2  w-8 h-8 flex items-center justify-center "
                  aria-label="Close image dialog"
                >
                  <VsClose class="w-6 h-6 text-white" />
                </Dialog.CloseTrigger>
              </div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
