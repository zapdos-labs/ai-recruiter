import { VsArrowRight } from "solid-icons/vs";
import { FaBrandsGithub } from "solid-icons/fa";
import Uploader from "~/components/Uploader";

import { getUploadUrl$ } from "~/functions";
import {
  loadVideo,
  loadVideoObject,
  setIsIndexing,
  zapdosClient,
} from "~/shared";

export default function LandingPage() {
  function navigateToVideo(videoId: string) {
    window.location.hash = `video_id=${videoId}`;
    window.location.reload();
  }

  async function uploadFile(
    file: File,
    opts: {
      onProgress: (progress: number) => void;
    }
  ) {
    const result = await getUploadUrl$();

    const url = result.data?.at(0);
    if (!url) throw new Error("Cannot get signed URL");
    console.log("signedUrl", url);
    const uploadResult = await zapdosClient.upload(url, file, {
      onFailed(error) {
        console.error("Upload failed", error.message);
        throw new Error(error.message);
      },
      onProgress(progress) {
        opts.onProgress(progress.value);
      },
      onCompleted(args) {
        console.log("Upload completed", args);
        // Show video after upload
        loadVideo(args.object_id);
      },
      job: {
        onIndexingStarted() {
          setIsIndexing(true);
          console.log("Indexing started");
        },
        onIndexingCompleted() {
          setIsIndexing(false);
          // Load video object
          loadVideoObject();
          console.log("Indexing completed");
        },
        onIndexingFailed(error) {
          setIsIndexing(false);
          console.log("Indexing failed", error);
        },
      },
    });
    console.log("uploadResult", uploadResult);
  }

  return (
    <div class="bg-zinc-50 min-h-screen">
      <div class="flex items-center justify-between w-full max-w-6xl mx-auto px-4 h-20">
        <div class="flex items-center space-x-2">
          <div class="flex-none space-x-3 flex items-center">
            <img
              src="/brand/logo.svg"
              alt="Logo"
              class="w-8 h-8 dark:hidden block"
            />
            <div>
              <h1 class="text-3xl font-ibm-plex-mono font-semibold ">
                AI Recruiter
              </h1>
            </div>
          </div>

          <a
            href="https://zapdoslabs.com"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1.5 border rounded-full border-zinc-200 text-sm hover:bg-zinc-100 transition-colors flex items-center space-x-2 group"
          >
            <div>By Zapdos Labs</div>
            <div class="w-0 group-hover:w-auto transition-width duration-300 overflow-hidden opacity-0 group-hover:opacity-100">
              <VsArrowRight class="w-4 h-4" />
            </div>
          </a>
        </div>

        <a
          href="https://github.com/zapdos-labs/ai-recruiter"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 hover:bg-zinc-100 rounded-full transition-colors group"
          title="View on GitHub"
        >
          <FaBrandsGithub class="w-6 h-6 text-zinc-700 group-hover:text-black transition-colors" />
        </a>
      </div>

      <div class="w-full max-w-6xl mx-auto px-4 mt-10">
        <div
          class="border border-zinc-200 rounded-4xl h-[calc(100vh-200px)] px-12 flex items-center relative overflow-hidden bg-cover bg-center"
          style="background-image: url('/hero.jpg')"
        >
          <div class="relative">
            <div class="flex items-center gap-16">
              <div class="flex-none w-2/5">
                <div style="filter: grayscale(1);">
                  <h1 class="text-5xl font-medium text-white">
                    AI-Powered Interview Video Analysis
                  </h1>
                </div>
              </div>
              <div class="flex-1 relative">
                <Uploader uploadFile={uploadFile} />
              </div>
            </div>

            <div>
              <h2 class="text-3xl mt-16 w-4/5 text-white">
                We analyze interviews and surface what matters, so you can hire
                better and move faster
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full border-y border-zinc-500 py-6 mt-10 flex flex-col items-center">
        <h2 class="font-ibm-plex-mono uppercase">Explore Examples</h2>
      </div>

      <div class="w-full max-w-6xl mx-auto px-4 mt-10 flex justify-center gap-8">
        <div
          class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() =>
            navigateToVideo("c3db7dbe-2dd1-4c48-9a89-8639b278f868")
          }
        >
          <img
            src="/example_1.jpg"
            alt="Google Coding Interview"
            class="w-60 aspect-video object-cover"
          />
          <div class="mt-4 text-center text-sm">Google Coding Interview</div>
        </div>
        <div
          class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() =>
            navigateToVideo("0eaf2c59-d3ab-453e-a91c-13a7266210da")
          }
        >
          <img
            src="/example_2.jpg"
            alt="Consulting Case Interview by Bain Associate Consultant"
            class="w-60 aspect-video object-cover"
          />
          <div class="mt-4 text-center text-sm">
            Consulting Case Interview by Bain Associate Consultant
          </div>
        </div>
        <div
          class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() =>
            navigateToVideo("09009d00-421e-4c48-861d-300341110e30")
          }
        >
          <img
            src="/example_3.jpg"
            alt="DoorDash YC Interview"
            class="w-60 aspect-video object-cover"
          />
          <div class="mt-4 text-center text-sm">DoorDash YC Interview</div>
        </div>
      </div>

      <footer class="w-full border-t border-zinc-200 mt-20 py-12 bg-white">
        <div class="w-full max-w-6xl mx-auto px-4">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
            <div class="flex flex-col space-y-4">
              <div class="flex items-center space-x-3">
                <img
                  src="/brand/logo.svg"
                  alt="Zapdos Labs Logo"
                  class="w-6 h-6"
                />
                <div class="font-montserrat font-bold text-lg">Zapdos Labs</div>
              </div>
              <div class="text-sm text-zinc-600 max-w-md">
                Next-gen video search SDK for AI developers.
              </div>
            </div>

            <div class="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-12">
              <div class="flex flex-col space-y-3">
                <h3 class="font-semibold text-sm">Product</h3>
                <div class="flex flex-col space-y-2 text-sm text-zinc-600">
                  <a href="#" class="hover:text-zinc-900 transition-colors">
                    Features
                  </a>
                  <a href="#" class="hover:text-zinc-900 transition-colors">
                    Pricing
                  </a>
                  <a href="#" class="hover:text-zinc-900 transition-colors">
                    API
                  </a>
                </div>
              </div>

              <div class="flex flex-col space-y-3">
                <h3 class="font-semibold text-sm">Company</h3>
                <div class="flex flex-col space-y-2 text-sm text-zinc-600">
                  <a href="#" class="hover:text-zinc-900 transition-colors">
                    About
                  </a>
                  <a href="#" class="hover:text-zinc-900 transition-colors">
                    Contact
                  </a>
                  <a href="#" class="hover:text-zinc-900 transition-colors">
                    Support
                  </a>
                </div>
              </div>

              <div class="flex flex-col space-y-3">
                <h3 class="font-semibold text-sm">Legal</h3>
                <div class="flex flex-col space-y-2 text-sm text-zinc-600">
                  <a href="#" class="hover:text-zinc-900 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" class="hover:text-zinc-900 transition-colors">
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-zinc-200 mt-8 pt-8 text-center">
            <div class="text-sm text-zinc-500">
              © 2025 Zapdos Labs. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
