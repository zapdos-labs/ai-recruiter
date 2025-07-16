// Parses a window.location.hash string into a key-value dictionary
export function parseHashParams(hash: string): Record<string, string> {
  const hashStr = hash.startsWith("#") ? hash.slice(1) : hash;
  const params: Record<string, string> = {};
  for (const part of hashStr.split("&")) {
    if (!part) continue;
    const [key, value = ""] = part.split("=");
    params[key] = decodeURIComponent(value);
  }
  return params;
}
import { createSignal, untrack } from "solid-js";
import { createBrowserClient, VideoObject } from "zapdos-js";
import { getDownloadUrl$, getVideoObject$ } from "./functions";

export const zapdosClient = createBrowserClient();

export const [tabId, setTabId] = createSignal<"scenes" | "transcription">(
  "scenes"
);

export const [videoId, setVideoId] = createSignal<string>();
export const [videoObject, setVideoObject] = createSignal<VideoObject>();

export const [isIndexing, setIsIndexing] = createSignal(false);

export const [videoUrl, setVideoUrl] = createSignal<string>();

export const [videoRef, setVideoRef] = createSignal<
  HTMLVideoElement | undefined
>(undefined);

export async function loadVideoObject() {
  const video_id = untrack(videoId);
  if (!video_id) {
    setVideoObject(undefined);
    return;
  }

  const videoObjResult = await getVideoObject$(video_id);
  if (videoObjResult.error) {
    console.error("Error fetching video object:", videoObjResult.error.message);
    setVideoObject(undefined);
    return;
  }

  console.log("Fetched video object:", videoObjResult.data);
  setVideoObject(videoObjResult.data);
}

export async function loadVideo(video_id: string) {
  setVideoId(video_id);

  // Fetch link and show the video in video element
  const result = await getDownloadUrl$(video_id);
  if (result.error) {
    console.error("Error getting download URL:", result.error.message);
    return;
  }
  console.log("Set video URL:", result.data.url);
  setVideoUrl(result.data.url);
}
