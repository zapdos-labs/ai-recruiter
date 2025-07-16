import { createClient } from "zapdos-js";

export async function getDownloadUrl$(object_id: string) {
  "use server";
  const zapdosClient = createClient({
    apiKey: process.env.ZAPDOS_API_KEY!,
  });

  return await zapdosClient.getDownloadUrl(object_id);
}

export async function getUploadUrl$() {
  "use server";
  const zapdosClient = createClient({
    apiKey: process.env.ZAPDOS_API_KEY!,
  });
  return zapdosClient.getUploadUrls(1);
}

export async function search$(
  text: string,
  opts?: { limit?: number; video_id?: string }
) {
  "use server";
  const zapdosClient = createClient({
    apiKey: process.env.ZAPDOS_API_KEY!,
  });
  return zapdosClient.search(text, opts);
}

export async function getVideoObject$(video_id: string) {
  "use server";
  console.log(
    "Fetching video object for ID:",
    video_id,
    process.env.ZAPDOS_API_KEY
  );
  const zapdosClient = createClient({
    apiKey: process.env.ZAPDOS_API_KEY!,
  });

  const result = await zapdosClient
    .videos()
    .where("id", "=", video_id)
    .single();
  return result;
}

export async function getDownloadUrls$(object_ids: string[]) {
  "use server";
  const zapdosClient = createClient({
    apiKey: process.env.ZAPDOS_API_KEY!,
  });
  return zapdosClient.getDownloadUrls(object_ids);
}
