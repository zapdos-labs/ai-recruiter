import { VsCloudUpload } from "solid-icons/vs";
import { createSignal, Show } from "solid-js";
import Spinner from "~/components/Spinner";
import { toaster } from "~/components/toast/utils";
type UploaderProps = {
  uploadFile: (
    file: File,
    opts: {
      onProgress: (progress: number) => void;
    }
  ) => Promise<void>;
  toast?: {
    success?: string;
    error?: string;
  };
};

export default function Uploader(props: UploaderProps) {
  const [file, setFile] = createSignal<File | null>(null);
  const [isUploading, setIsUploading] = createSignal(false);
  const [uploadProgress, setUploadProgress] = createSignal(0);

  const [dragActive, setDragActive] = createSignal(false);

  const handleFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      setFile(input.files[0]);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  const handleUpload = async () => {
    const currentFile = file();
    if (!currentFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await props.uploadFile(currentFile, {
        onProgress(progress) {
          setUploadProgress(progress);
        },
      });

      // Upload to server completed
      setUploadProgress(100);

      toaster.success({
        title: "Upload Success",
        description:
          props.toast?.success || `Your video is uploaded and being processed`,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toaster.error({
        title: "Upload Failed",
        description:
          props.toast?.error || "An error occurred during the upload",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setFile(null);
      const fileInput = document.getElementById(
        "fileInput"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  return (
    <>
      <div>
        <div
          class={`relative border overflow-hidden transition-colors rounded-lg  ${
            dragActive()
              ? "border-blue-500"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div class="flex flex-col items-center justify-center px-4 py-6 bg-zinc-50 dark:bg-zinc-900">
            <VsCloudUpload class="h-8 w-8 text-zinc-500 mb-3" />
            <Show
              when={file()}
              fallback={
                <div class="text-center">
                  <p class="text-sm text-zinc-700 dark:text-zinc-200">
                    Drag & drop your video here
                  </p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    or browse to select a file
                  </p>
                </div>
              }
            >
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {file()?.name || ""}
              </p>
              <Show when={file()}>
                {(f) => (
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">
                    {(f().size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </Show>
            </Show>
            <input
              type="file"
              id="fileInput"
              class="hidden"
              accept=".mp4,.m4v,.webm.mkv,.mov"
              onChange={handleFileChange}
            />

            <Show
              when={file()}
              fallback={
                <label
                  for="fileInput"
                  class="mt-3 px-4 py-2 text-sm text-white  border border-zinc-200  cursor-pointer hover:bg-zinc-700  transition-colors bg-zinc-950 "
                >
                  Select Video
                </label>
              }
            >
              <div class="flex flex-col items-center mt-3">
                <Show
                  when={isUploading()}
                  fallback={
                    <>
                      <button
                        onClick={handleUpload}
                        class="px-4 py-2 text-sm cursor-pointer bg-[#eab8ff] text-[#730ba0] hover:bg-[#DB93FA] dark:bg-[#a855f7] dark:text-white dark:hover:bg-[#9333ea] transition-colors"
                      >
                        Upload Video
                      </button>
                      <label
                        for="fileInput"
                        class="mt-2 text-xs text-zinc-600 dark:text-zinc-200 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-100"
                      >
                        Select another file
                      </label>
                    </>
                  }
                >
                  <Spinner />
                  <label class="mt-2 text-xs text-zinc-600 dark:text-zinc-200 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-100">
                    Uploading to server...
                  </label>
                </Show>

                <Show when={isUploading()}>
                  <div class="mt-2 w-full">
                    <div class="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5">
                      <div
                        class="h-2.5 transition-all duration-300 ease-in-out bg-[#730ba0] dark:bg-[#a855f7]"
                        style={{ width: `${uploadProgress()}%` }}
                      />
                    </div>
                    <div class="text-xs mt-1 text-center text-zinc-700 dark:text-zinc-200">
                      {Math.round(uploadProgress())}%
                    </div>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}
