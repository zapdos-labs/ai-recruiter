import { createSignal, ValidComponent, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { search$ } from "~/functions";
import ImageGrid from "./ImageGrid";
import { videoObject } from "~/shared";

// --- Small, focused types ---
type SearchResult = Awaited<ReturnType<typeof search$>>;

type SearchIdle = { type: "idle" };
type SearchLoading = { type: "loading" };
type SearchError = { type: "error"; error: string };
type SearchSuccess = { type: "result"; result: SearchResult; query: string };

type SearchState = SearchIdle | SearchLoading | SearchError | SearchSuccess;

// --- Main hook ---
export default function useSearch(
  videoRef?: () => HTMLVideoElement | undefined
) {
  const [state, setState] = createSignal<SearchState>({ type: "idle" });

  async function doSearch(video_id: string, queryText: string) {
    setState({ type: "loading" });
    try {
      const result = await search$(queryText, {
        limit: 10,
        video_id,
      });
      setState({ type: "result", result, query: queryText });
    } catch (err: any) {
      setState({ type: "error", error: err?.message || "Unknown error" });
    }
  }

  // Helper component to render scene matches
  function ScenesMatches(props: { ids: string[] }) {
    return (
      <div class="mb-2">
        <h3 class="text-lg font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
          Scene Matches (top {props.ids.length} results)
        </h3>
      </div>
    );
  }

  function SearchResultComp() {
    const currentState = () => state() as SearchSuccess;
    const items = () => currentState().result?.data?.items ?? [];
    const query = () => currentState().query || "";
    // Build array of scene info objects
    const scenes = () =>
      items().map((item) => ({
        object_id: item.metadata.scene_image_object_id,
        start_ms: item.metadata.start_ms,
        end_ms: item.metadata.end_ms,
      }));
    return (
      <div class="space-y-2">
        <ScenesMatches ids={scenes().map((s) => s.object_id)} />
        <ImageGrid scenes={scenes} />
        <TextMatches query={query()} />
      </div>
    );
  }

  // Helper function to find text matches in transcription
  function findTextMatches(query: string, transcription: any) {
    if (!transcription?.segments || !query.trim()) return [];

    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    // Helper: clean a word for comparison
    function clean(str: string) {
      return (str || "").toLowerCase().replace(/[^\w]/g, "");
    }

    // First pass: collect obvious matches (exact or near-exact)
    const obviousMatches: Array<{
      segment: any;
      word: any;
      snippet: string;
      startTime: number;
    }> = [];
    const fuzzyMatches: Array<{
      segment: any;
      word: any;
      snippet: string;
      startTime: number;
    }> = [];

    transcription.segments.forEach((segment: any) => {
      const words = segment.words || [];
      words.forEach((word: any, index: number) => {
        const wordText = clean(word.text || word.word || "");

        // Check for obvious match: exact match with any search term
        const isObvious = searchTerms.some((term) => {
          const cleanTerm = clean(term);
          // Exact match (case-insensitive, ignore punctuation)
          return wordText === cleanTerm && cleanTerm.length > 0;
        });

        // Fuzzy match logic (as before)
        const isFuzzy = searchTerms.some((term) => {
          const cleanTerm = clean(term);
          if (wordText === cleanTerm) return true;
          if (wordText.includes(cleanTerm) || cleanTerm.includes(wordText))
            return true;
          if (cleanTerm.length > 2 && wordText.length > 2) {
            return (
              wordText.includes(cleanTerm.slice(0, -1)) ||
              cleanTerm.includes(wordText.slice(0, -1))
            );
          }
          return false;
        });

        if (isObvious || isFuzzy) {
          // Create snippet with context
          const contextBefore = 3;
          const contextAfter = 3;
          const startIndex = Math.max(0, index - contextBefore);
          const endIndex = Math.min(words.length, index + contextAfter + 1);
          const beforeWords = words.slice(startIndex, index);
          const afterWords = words.slice(index + 1, endIndex);
          let snippet = "";
          if (startIndex > 0) snippet += "...";
          if (beforeWords.length > 0) {
            snippet +=
              beforeWords.map((w: any) => w.text || w.word).join(" ") + " ";
          }
          snippet += `<mark>${word.text || word.word}</mark>`;
          if (afterWords.length > 0) {
            snippet +=
              " " + afterWords.map((w: any) => w.text || w.word).join(" ");
          }
          if (endIndex < words.length) snippet += "...";
          const matchObj = {
            segment,
            word,
            snippet,
            startTime: word.start_ms || word.start || 0,
          };
          if (isObvious) {
            obviousMatches.push(matchObj);
          } else if (isFuzzy) {
            fuzzyMatches.push(matchObj);
          }
        }
      });
    });

    // Remove duplicates based on start time
    function dedupe(arr: typeof obviousMatches) {
      return arr.filter(
        (match, index, all) =>
          all.findIndex((m) => m.startTime === match.startTime) === index
      );
    }

    // Combine obvious and fuzzy matches, with obvious first, no duplicates
    const allMatches = [
      ...obviousMatches,
      ...fuzzyMatches.filter(
        (fm) => !obviousMatches.some((om) => om.startTime === fm.startTime)
      ),
    ];
    return dedupe(allMatches);
  }

  // Helper component to render text matches
  function TextMatches(props: { query: string }) {
    const transcription = () => videoObject()?.content?.transcription;
    const matches = () => findTextMatches(props.query, transcription());

    function formatTimestamp(ms: number): string {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    function seekToTimestamp(ms: number) {
      const video = videoRef?.();
      if (video) {
        video.currentTime = ms / 1000;
      }
    }

    return (
      <div class="mt-4">
        <Show when={matches().length > 0}>
          <h3 class="text-lg font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
            Text Matches ({matches().length} results)
          </h3>
          <div class="space-y-2">
            <For each={matches()}>
              {(match) => (
                <div class="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800">
                  <button
                    class="text-sm bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-200 px-2 py-1 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-800 transition-colors shrink-0"
                    onClick={() => seekToTimestamp(match.startTime)}
                  >
                    {formatTimestamp(match.startTime)}
                  </button>
                  <div
                    class="text-sm text-zinc-700 dark:text-zinc-300 flex-1"
                    innerHTML={match.snippet}
                    style={{
                      "word-break": "break-word",
                    }}
                  />
                </div>
              )}
            </For>
          </div>
        </Show>
        <Show when={matches().length === 0 && transcription()}>
          <div class="text-sm text-zinc-500">
            No text matches found in transcription
          </div>
        </Show>
      </div>
    );
  }

  const components: Record<SearchState["type"], ValidComponent> = {
    idle: () => <div class="text-zinc-500">Enter a query to search...</div>,
    error: () => (
      <div class="text-red-500">{(state() as SearchError).error}</div>
    ),
    loading: () => <div class="text-zinc-500">Loading...</div>,
    result: SearchResultComp,
  };

  return {
    setState,
    state,
    doSearch,
    resultComponent: () => <Dynamic component={components[state().type]} />,
  };
}
