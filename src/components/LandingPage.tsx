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
      {/* Header */}
      <div class="flex flex-col sm:flex-row items-center justify-between w-full max-w-6xl mx-auto px-2 sm:px-4 h-auto sm:h-20 py-4 sm:py-0">
        <div class="flex flex-col sm:flex-row items-center gap-2 sm:space-x-2 w-full sm:w-auto">
          <div class="flex-none flex items-center gap-2 sm:space-x-3">
            <img
              src="/brand/logo.svg"
              alt="Logo"
              class="w-8 h-8 dark:hidden block"
            />
            <div>
              <h1 class="text-2xl sm:text-3xl font-ibm-plex-mono font-semibold ">
                AI Recruiter
              </h1>
            </div>
          </div>

          <a
            href="https://zapdoslabs.com"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 sm:mt-0 px-3 py-1.5 border rounded-full border-zinc-200 text-sm hover:bg-zinc-100 transition-colors flex items-center space-x-2 group"
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
          class="mt-2 sm:mt-0 p-2 hover:bg-zinc-100 rounded-full transition-colors group"
          title="View on GitHub"
        >
          <FaBrandsGithub class="w-6 h-6 text-zinc-700 group-hover:text-black transition-colors" />
        </a>
      </div>

      {/* Hero Section */}
      <div class="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-6 sm:mt-10">
        <div
          class="border border-zinc-200 rounded-3xl sm:rounded-4xl h-auto sm:h-[calc(100vh-200px)] px-2 sm:px-12 flex flex-col sm:flex-row items-center relative overflow-hidden bg-cover bg-center min-h-[420px]"
          style="background-image: url('/hero.jpg')"
        >
          <div class="relative w-full py-8 sm:py-0">
            <div class="flex flex-col sm:flex-row items-center w-full">
              <div class="flex-none w-full sm:w-2/5 mb-4 sm:mb-0 flex flex-col items-center sm:items-start">
                <div style="filter: grayscale(1);">
                  <h1 class="text-3xl sm:text-5xl font-medium text-white text-center sm:text-left mb-4 sm:mb-8">
                    AI-Powered Interview Video Analysis
                  </h1>
                </div>
              </div>
              <div class="flex-1 relative w-full max-w-full flex flex-col items-center sm:items-start">
                <div class="w-full max-w-md">
                  <Uploader uploadFile={uploadFile} />
                </div>
              </div>
            </div>

            <div class="mt-6 sm:mt-12 flex justify-center sm:justify-start">
              <h2 class="text-xl sm:text-3xl w-full sm:w-4/5 text-white text-center sm:text-left">
                We analyze interviews and surface what matters, so you can hire
                better and move faster
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Examples Section */}
      <div class="w-full border-y border-zinc-500 py-4 sm:py-6 mt-8 sm:mt-10 flex flex-col items-center">
        <h2 class="font-ibm-plex-mono uppercase text-base sm:text-lg">
          Explore Examples
        </h2>
      </div>

      <div class="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-6 sm:mt-10 flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 items-center">
        <div
          class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity w-full sm:w-auto"
          onClick={() =>
            navigateToVideo("c3db7dbe-2dd1-4c48-9a89-8639b278f868")
          }
        >
          <img
            src="/example_1.jpg"
            alt="Google Coding Interview"
            class="w-full max-w-xs sm:w-60 aspect-video object-cover rounded-lg"
          />
          <div class="mt-2 sm:mt-4 text-center text-xs sm:text-sm">
            Google Coding Interview
          </div>
        </div>
        <div
          class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity w-full sm:w-auto"
          onClick={() =>
            navigateToVideo("0eaf2c59-d3ab-453e-a91c-13a7266210da")
          }
        >
          <img
            src="/example_2.jpg"
            alt="Consulting Case Interview by Bain Associate Consultant"
            class="w-full max-w-xs sm:w-60 aspect-video object-cover rounded-lg"
          />
          <div class="mt-2 sm:mt-4 text-center text-xs sm:text-sm">
            Consulting Case Interview by Bain Associate Consultant
          </div>
        </div>
        <div
          class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity w-full sm:w-auto"
          onClick={() =>
            navigateToVideo("09009d00-421e-4c48-861d-300341110e30")
          }
        >
          <img
            src="/example_3.jpg"
            alt="DoorDash YC Interview"
            class="w-full max-w-xs sm:w-60 aspect-video object-cover rounded-lg"
          />
          <div class="mt-2 sm:mt-4 text-center text-xs sm:text-sm">
            DoorDash YC Interview
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer class="w-full border-t border-zinc-200 mt-12 sm:mt-20 py-8 sm:py-12 bg-white">
        <div class="w-full max-w-6xl mx-auto px-2 sm:px-4">
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
              <div class="text-xs sm:text-sm text-zinc-600 max-w-md">
                Next-gen video search SDK for AI developers.
              </div>
            </div>

            <div class="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-12">
              <div class="flex flex-col space-y-3">
                <h3 class="font-semibold text-xs sm:text-sm">Product</h3>
                <div class="flex flex-col space-y-2 text-xs sm:text-sm text-zinc-600">
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
                <h3 class="font-semibold text-xs sm:text-sm">Company</h3>
                <div class="flex flex-col space-y-2 text-xs sm:text-sm text-zinc-600">
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
                <h3 class="font-semibold text-xs sm:text-sm">Legal</h3>
                <div class="flex flex-col space-y-2 text-xs sm:text-sm text-zinc-600">
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

          <div class="border-t border-zinc-200 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <div class="text-xs sm:text-sm text-zinc-500">
              © 2025 Zapdos Labs. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
