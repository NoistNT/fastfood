export function BackgroundWall() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900">
      {/* Grid for Light Mode */}
      <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_0.5rem,transparent_1rem),linear-gradient(to_bottom,#f0f0f0_0.5rem,transparent_1rem)] bg-[size:1rem_2rem] dark:hidden" />

      {/* Grid for Dark Mode */}
      <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#1f2937_0.5rem,transparent_1rem),linear-gradient(to_bottom,#1f2937_0.5rem,transparent_1rem)] bg-[size:1rem_2rem] hidden dark:block" />

      {/* First Radial Gradient (Light Mode) */}
      <div className="fixed bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] opacity-50 animate-pulse backdrop-blur-xs dark:hidden" />

      {/* First Radial Gradient (Dark Mode) */}
      <div className="fixed bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#4c1d95,transparent)] opacity-50 animate-pulse backdrop-blur-xs hidden dark:block" />

      {/* Second Radial Gradient (Light Mode) */}
      <div className="fixed bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_0%_800px,#ffd5c5,transparent)] opacity-50 animate-pulse delay-1000 backdrop-blur-xs dark:hidden" />

      {/* Second Radial Gradient (Dark Mode) */}
      <div className="fixed bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_0%_800px,#7c3aed,transparent)] opacity-50 animate-pulse delay-1000 backdrop-blur-xs hidden dark:block" />
    </div>
  );
}
