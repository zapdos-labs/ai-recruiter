import { BsMoon, BsSun } from "solid-icons/bs";
import useTheme from "./useTheme";
import { Show } from "solid-js";

export default function ThemeButton() {
  const theme = useTheme();
  return (
    <button
      class="action-btn"
      onClick={() => {
        theme.toggleTheme();
      }}
    >
      <Show when={theme.theme() === "dark"} fallback={<BsMoon />}>
        <BsSun />
      </Show>
    </button>
  );
}
