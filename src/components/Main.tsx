import { VsAdd } from "solid-icons/vs";
import { createEffect, createSignal, Show } from "solid-js";
import FloatingContainer from "~/components/FloatingContainer";
import Header from "~/components/Header";
import ScenesTab from "~/components/ScenesTab";
import TranscriptionTab from "~/components/TranscriptionTab";
import useSearch from "~/components/useSearch";
import {
  isIndexing,
  setTabId,
  setVideoRef,
  tabId,
  videoId,
  videoRef,
  videoUrl,
} from "~/shared";
import VideoComp from "./VideoComp";

export default function Main() {
  const __search = useSearch(videoRef);

  createEffect(() => {
    const _ = tabId();
    setQueryText(""); // Reset search query when tab changes
    __search.setState({ type: "idle" });
  });

  // Update URL hash when videoId changes
  createEffect(() => {
    const vId = videoId();
    if (vId) {
      window.location.hash = `video_id=${encodeURIComponent(vId)}`;
    }
  });

  const [queryText, setQueryText] = createSignal("");

  return (
    <div class="min-h-screen  bg-white dark:bg-zinc-900 flex flex-col">
      <Header />

      {/* Sub Header - Responsive for mobile */}
      <Show when={videoId()}>
        <div class="border-b px-2 sm:px-4 py-2 sm:py-3 border-zinc-200 border-t flex flex-col sm:flex-row items-stretch sm:items-center sticky top-16 z-[200] bg-white w-full gap-2 sm:gap-0 min-h-14">
          <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <button
              class="btn-secondary flex-none w-full sm:w-auto"
              onClick={() => {
                // Window reload without hash
                window.location.hash = "";
                location.reload();
              }}
            >
              <span class="flex items-center justify-center gap-1">
                <VsAdd />
                <span class="hidden xs:inline">New Upload</span>
                <span class="inline xs:hidden">New</span>
              </span>
            </button>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button
                data-active={tabId() == "scenes"}
                onClick={() => setTabId("scenes")}
                class="flex-1 sm:flex-none px-3 py-1 border border-zinc-200 data-[active=true]:border-fuchsia-500 data-[active=true]:bg-fuchsia-50 data-[active=true]:text-fuchsia-600 transition-all"
              >
                Scenes
              </button>
              <button
                data-active={tabId() == "transcription"}
                class="flex-1 sm:flex-none px-3 py-1 border border-zinc-200 data-[active=true]:border-fuchsia-500 data-[active=true]:bg-fuchsia-50 data-[active=true]:text-fuchsia-600 transition-all"
                onClick={() => setTabId("transcription")}
              >
                Transcription
              </button>
            </div>
          </div>

          <Show when={isIndexing() === false}>
            {/* Minimalistic search input, responsive */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const video_id = videoId();
                const query = queryText().trim();
                if (!video_id || !query) {
                  return;
                }
                __search.doSearch(video_id, query);
              }}
              class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0"
            >
              <input
                type="text"
                value={queryText()}
                onInput={(e) => setQueryText(e.currentTarget.value)}
                placeholder="Search..."
                class="w-full sm:w-[180px] px-2 py-1 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none transition"
              />
              <button
                type="submit"
                class="btn-primary"
                disabled={
                  __search.state().type === "loading" || !queryText().trim()
                }
              >
                {__search.state().type === "loading"
                  ? "Searching..."
                  : "Search"}
              </button>
            </form>
          </Show>
        </div>
      </Show>

      <div class="dark:bg-zinc-950">
        <div class="p-4 w-full max-w-6xl mx-auto">
          <Show
            when={isIndexing()}
            fallback={
              <div>
                <Show
                  when={__search.state().type === "idle"}
                  fallback={__search.resultComponent()}
                >
                  <Show when={tabId() === "scenes"}>
                    <ScenesTab />
                  </Show>
                  <Show when={tabId() === "transcription"}>
                    <TranscriptionTab videoRef={videoRef} />
                  </Show>
                </Show>
              </div>
            }
          >
            <div class="text-zinc-500">Indexing...</div>
            <div class="text-sm text-zinc-500">
              This may take 1-3 minutes depending on the video length
            </div>
          </Show>
        </div>
        <Show when={videoUrl()}>
          {(url) => (
            <FloatingContainer>
              <VideoComp videoUrl={url()} setVideoRef={setVideoRef} />
            </FloatingContainer>
          )}
        </Show>
      </div>
    </div>
  );
}
