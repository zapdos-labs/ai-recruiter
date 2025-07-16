import { onMount, Show } from "solid-js";
import LandingPage from "~/components/LandingPage";
import Main from "~/components/Main";
import {
  loadVideo,
  loadVideoObject,
  parseHashParams,
  setVideoId,
  videoId,
} from "~/shared";

export default function Home() {
  onMount(() => {
    const params = parseHashParams(window.location.hash);
    if (!params.video_id) {
      console.log("No video ID in hash");
      return;
    }
    setVideoId(params.video_id);
    console.log("Loaded video ID from hash:", params.video_id);

    loadVideo(params.video_id);
    loadVideoObject();
  });

  return (
    <Show when={videoId()} fallback={<LandingPage />}>
      <Main />;
    </Show>
  );
}
