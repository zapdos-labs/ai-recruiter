import { Show } from "solid-js";
import { videoObject } from "~/shared";
import ImageGrid from "./ImageGrid";

export default function ScenesTab() {
  const scenesInfo = () => {
    const obj = videoObject();
    if (!obj || !obj.content?.scenes) return [];
    return obj.content.scenes.map((scene) => ({
      object_id: scene.object_id,
      start_ms: scene.start_ms,
      end_ms: scene.end_ms,
    }));
  };

  return (
    <Show
      when={scenesInfo().length > 0}
      fallback={<div class="text-zinc-500">No scenes found for this video</div>}
    >
      <ImageGrid scenes={scenesInfo} />
    </Show>
  );
}
