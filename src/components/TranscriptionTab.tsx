import {
  For,
  Show,
  createMemo,
  createSignal,
  createEffect,
  JSX,
  Accessor,
  onCleanup,
} from "solid-js";
import { videoObject } from "~/shared";

function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type Section = {
  speaker: string;
  startTime: number;
  segments: any[];
  text: string;
  words: any[];
};

type TranscriptionTabProps = {
  videoRef: Accessor<HTMLVideoElement | undefined>;
};

export default function TranscriptionTab(props: TranscriptionTabProps) {
  const segments = () => videoObject()?.content?.transcription?.segments || [];
  const [currentTime, setCurrentTime] = createSignal(0);

  // Listen to video time updates
  createEffect(() => {
    const videoRef = props.videoRef();
    if (!videoRef) return;

    let stop = false;
    const trackTime = () => {
      setCurrentTime(videoRef.currentTime * 1000);
      if (stop) return;
      requestAnimationFrame(trackTime);
    };

    requestAnimationFrame(trackTime);

    onCleanup(() => {
      stop = true;
    });
  });

  function seekToTimestamp(ms: number) {
    const videoRef = props.videoRef();
    if (videoRef) {
      videoRef.currentTime = ms / 1000;
    }
  }

  // Check if a word should be highlighted based on current video time
  function isWordActive(word: any): boolean {
    const current = currentTime();
    return current >= word.start_ms && current <= word.end_ms;
  }

  const sections = createMemo(() => {
    const rawSegments = segments();
    if (rawSegments.length === 0) return [];

    const sections: Section[] = [];
    const GAP_THRESHOLD = 1000;

    for (const segment of rawSegments) {
      const segmentAny = segment as any;
      const speaker = segmentAny.speaker_id || segmentAny.speaker || "Unknown";
      const startTime = segmentAny.start_ms || segmentAny.start;
      const endTime = segmentAny.end_ms || segmentAny.end;

      const lastSection = sections[sections.length - 1];

      // Check if we should start a new section
      const shouldStartNew =
        !lastSection ||
        lastSection.speaker !== speaker ||
        (startTime -
          (lastSection.segments[lastSection.segments.length - 1] as any)
            ?.end_ms ||
          (lastSection.segments[lastSection.segments.length - 1] as any)?.end) >
          GAP_THRESHOLD;

      if (shouldStartNew) {
        sections.push({
          speaker,
          startTime,
          segments: [segment],
          text: segmentAny.text,
          words: segmentAny.words || [],
        });
      } else {
        // Add to existing section
        lastSection.segments.push(segment);
        lastSection.text += " " + segmentAny.text;
        if (segmentAny.words) {
          lastSection.words.push(...segmentAny.words);
        }
      }
    }

    return sections;
  });

  return (
    <div class="space-y-6">
      <Show when={sections().length === 0}>
        <div class="text-zinc-500">No transcription available</div>
      </Show>

      <For each={sections()}>
        {(section) => (
          <div class="mb-6 text-lg">
            <div class="flex items-start gap-4">
              <div class="text-sm text-zinc-500 min-w-[100px]">
                <div class="font-medium">{section.speaker}</div>
                <button
                  class="text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                  onClick={() => seekToTimestamp(section.startTime)}
                >
                  {formatTimestamp(section.startTime)}
                </button>
              </div>
              <div class="flex-1">
                <div
                  class="text-zinc-900 dark:text-zinc-100"
                  style={{
                    "word-break": "break-word",
                    "white-space": "normal",
                  }}
                >
                  <Show when={section.words.length > 0}>
                    <span>
                      <For each={section.words}>
                        {(word: any, i) => (
                          <span>
                            <span
                              data-active={isWordActive(word)}
                              class="cursor-pointer rounded duration-200 hover:bg-fuchsia-200 hover:text-fuchsia-800 data-[active=true]:bg-fuchsia-200 data-[active=true]:text-fuchsia-800"
                              onClick={() => seekToTimestamp(word.start_ms)}
                            >
                              {word.text || word.word}
                            </span>{" "}
                          </span>
                        )}
                      </For>
                    </span>
                  </Show>
                  <Show when={section.words.length === 0}>
                    <span>{section.text}</span>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
