import { FaSolidPause, FaSolidPlay } from "solid-icons/fa";
import { createSignal, onCleanup } from "solid-js";
import { Slider } from "@ark-ui/solid";
import { ImPause2, ImPlay3 } from "solid-icons/im";

interface VideoCompProps {
  videoUrl: string;
  setVideoRef: (el: HTMLVideoElement) => void;
}

export default function VideoComp(props: VideoCompProps) {
  const [playing, setPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  let videoEl: HTMLVideoElement | undefined;

  function handlePlayPause() {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
      setPlaying(true);
    } else {
      videoEl.pause();
      setPlaying(false);
    }
  }

  function handleTimeUpdate() {
    if (videoEl) setCurrentTime(videoEl.currentTime);
  }

  function handleLoadedMetadata() {
    if (videoEl) setDuration(videoEl.duration);
  }

  function handleSliderChange(details: { value: number[] }) {
    if (!videoEl) return;
    videoEl.currentTime = details.value[0];
    setCurrentTime(videoEl.currentTime);
  }

  onCleanup(() => {
    if (videoEl) {
      videoEl.onplay = null;
      videoEl.onpause = null;
      videoEl.ontimeupdate = null;
      videoEl.onloadedmetadata = null;
    }
  });

  return (
    <div class="w-[400px] flex flex-col items-center">
      <video
        ref={(el) => {
          videoEl = el;
          props.setVideoRef(el);
        }}
        src={props.videoUrl}
        class="w-full max-h-[60vh] bg-black"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <div class="w-full flex items-center gap-4 px-4 py-3 bg-black text-white ">
        <button onClick={handlePlayPause} class="focus:outline-none">
          {playing() ? <ImPause2 size={24} /> : <ImPlay3 size={24} />}
        </button>
        <Slider.Root
          min={0}
          max={duration() || 0}
          step={0.01}
          value={[currentTime()]}
          onValueChange={handleSliderChange}
          class="flex-1"
        >
          <Slider.Control class="w-full">
            <Slider.Track class="bg-white/20 h-1 rounded">
              <Slider.Range class="bg-white h-1 rounded" />
            </Slider.Track>
            <Slider.Thumb
              index={0}
              class="w-4 h-4 bg-white border border-gray-400 rounded-full shadow"
            >
              <Slider.HiddenInput />
            </Slider.Thumb>
          </Slider.Control>
        </Slider.Root>
        <span class="text-xs min-w-[60px] text-right">
          {formatTime(currentTime())} / {formatTime(duration())}
        </span>
      </div>
    </div>
  );
}

function formatTime(sec: number) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
