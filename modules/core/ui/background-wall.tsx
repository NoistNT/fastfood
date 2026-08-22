export function BackgroundWall() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-background">
      {/* Faint dot grid for paper texture */}
      <div
        aria-hidden="true"
        className="fixed inset-0 h-full w-full opacity-40 [background-image:radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:24px_24px] dark:opacity-30"
      />
    </div>
  );
}
