import { Toast, Toaster } from "@ark-ui/solid/toast";
import { VsClose } from "solid-icons/vs";
import { toaster } from "./utils";

export function ToastProvider() {
  return (
    <Toaster toaster={toaster}>
      {(toast) => (
        <Toast.Root>
          <Toast.Title>{toast().title}</Toast.Title>
          <Toast.Description>{toast().description}</Toast.Description>
          <Toast.CloseTrigger>
            <VsClose />
          </Toast.CloseTrigger>
        </Toast.Root>
      )}
    </Toaster>
  );
}
