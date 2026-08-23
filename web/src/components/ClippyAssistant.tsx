import { useEffect } from "react";
import { useClippy, ClippyProvider } from "@react95/clippy";

function ClippyInner({ isWindowOpen }: { isWindowOpen: boolean }) {
  const { clippy } = useClippy();

  useEffect(() => {
    if (!clippy) return;
    clippy.show(false);
    clippy.play("Wave");
    if (!isWindowOpen) {
      setTimeout(
        () => clippy.speak("Double-click DocChat to get started!", false),
        800,
      );
    }
  }, [clippy]);

  useEffect(() => {
    if (!clippy) return;
    let el: HTMLElement | null = null;
    const onClick = () => clippy.animate();

    const raf = requestAnimationFrame(() => {
      el = document.querySelector(".clippy");
      if (!el) return;
      el.style.cursor = "pointer";
      el.addEventListener("click", onClick);
    });

    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener("click", onClick);
    };
  }, [clippy]);

  return null;
}

export default function ClippyAssistant({
  isWindowOpen,
}: {
  isWindowOpen: boolean;
}) {
  return (
    <ClippyProvider>
      <ClippyInner isWindowOpen={isWindowOpen} />
    </ClippyProvider>
  );
}
