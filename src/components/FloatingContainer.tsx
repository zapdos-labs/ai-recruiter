import { Accessor, createSignal, JSX, onMount } from "solid-js";
import { createStore } from "solid-js/store";

interface FloatingContainerProps {
  children: JSX.Element;
}

function useFloatingDrag(props: { ref: Accessor<HTMLDivElement | null> }) {
  const [state, setState] = createStore({
    x: 0,
    y: 0,
  });
  const [dragging, setDragging] = createSignal(false);
  let startX = 0;
  let startY = 0;
  let startPosX = 0;
  let startPosY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocityX = 0;
  let velocityY = 0;
  let momentumFrame: number | null = null;

  function getRect() {
    return props.ref()?.getBoundingClientRect();
  }

  function placeBottomRight() {
    const rect = getRect();
    const gap = 32;
    if (rect) {
      setState({
        x: window.innerWidth - rect.width - gap,
        y: window.innerHeight - rect.height - gap,
      });
    }
  }

  onMount(() => {
    placeBottomRight();
    const onResize = () => {
      placeBottomRight();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  function onMouseDown(e: MouseEvent) {
    setDragging(true);
    startX = e.clientX;
    startY = e.clientY;
    startPosX = state.x;
    startPosY = state.y;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();
    velocityX = 0;
    velocityY = 0;
    if (momentumFrame) {
      cancelAnimationFrame(momentumFrame);
      momentumFrame = null;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging()) return;
    const now = performance.now();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    setState({
      x: startPosX + dx,
      y: startPosY + dy,
    });
    // Calculate velocity
    const dt = now - lastTime;
    if (dt > 0) {
      velocityX = (e.clientX - lastX) / dt;
      velocityY = (e.clientY - lastY) / dt;
    }
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
  }

  function onMouseUp() {
    setDragging(false);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    // Attraction to closest corner (spring physics)
    let x = state.x;
    let y = state.y;
    const rect = getRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 32;
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;
    // Find closest corner using live width/height
    // For each corner, store anchor and offset for correct alignment
    // Each entry: { anchor: {x, y}, offset: {dx, dy} }
    const corners = [
      // top-left: align top-left (offset 0,0)
      { anchor: { x: gap, y: gap }, offset: { dx: 0, dy: 0 } },
      // top-right: align top-right (offset width,0)
      { anchor: { x: vw - gap, y: gap }, offset: { dx: width, dy: 0 } },
      // bottom-left: align bottom-left (offset 0,height)
      { anchor: { x: gap, y: vh - gap }, offset: { dx: 0, dy: height } },
      // bottom-right: align bottom-right (offset width,height)
      {
        anchor: { x: vw - gap, y: vh - gap },
        offset: { dx: width, dy: height },
      },
    ];
    let minDist = Infinity;
    let target = corners[0];
    for (const c of corners) {
      // Distance from current point to where the container's corner would be if aligned
      const dist = Math.hypot(
        x + c.offset.dx - c.anchor.x,
        y + c.offset.dy - c.anchor.y
      );
      if (dist < minDist) {
        minDist = dist;
        target = c;
      }
    }
    // Spring physics params
    const spring = 0.12; // attraction force
    const damping = 0.75; // velocity decay
    function animate() {
      // Move so that the correct corner aligns with the anchor
      const dx = target.anchor.x - target.offset.dx - x;
      const dy = target.anchor.y - target.offset.dy - y;
      velocityX += dx * spring;
      velocityY += dy * spring;
      velocityX *= damping;
      velocityY *= damping;
      x += velocityX;
      y += velocityY;
      setState({
        x,
        y,
      });
      const speed = Math.hypot(velocityX, velocityY);
      if (speed > 0.001) {
        momentumFrame = requestAnimationFrame(animate);
      } else {
        setState({
          x: target.anchor.x - target.offset.dx,
          y: target.anchor.y - target.offset.dy,
        });
        momentumFrame = null;
      }
    }
    momentumFrame = requestAnimationFrame(animate);
  }

  return {
    state,
    setState,
    onMouseDown,
  };
}

export default function FloatingContainer(props: FloatingContainerProps) {
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);
  const { state, setState, onMouseDown } = useFloatingDrag({ ref });
  return (
    <div
      ref={setRef}
      class="select-none fixed bg-black cursor-move z-[300]"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
      }}
      onMouseDown={onMouseDown}
    >
      {props.children}
    </div>
  );
}
