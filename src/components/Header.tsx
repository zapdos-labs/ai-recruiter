export default function Header() {
  return (
    <div class="sticky top-0 bg-white z-[200] flex items-center dark:border-zinc-800 px-2 sm:px-4 h-14 sm:h-16 min-h-12">
      <button
        onClick={() => {
          // Navigate to home
          window.location.hash = "";
          location.reload();
        }}
        class="flex items-center gap-2 sm:gap-3 min-w-0"
      >
        <div class="border border-gray-200 p-1 dark:border-zinc-800 flex-shrink-0">
          <img
            src="/brand/logo.svg"
            alt="Logo"
            class="w-8 h-8 dark:hidden block"
          />
          <img
            src="/brand/logo-dark.svg"
            alt="Logo"
            class="w-8 h-8 dark:block hidden"
          />
        </div>
        <span class="truncate font-montserrat text-base xs:text-lg sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-200 max-w-[60vw]">
          AI-Recruiter
        </span>
      </button>
    </div>
  );
}
