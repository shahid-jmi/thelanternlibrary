import LanternMark from './LanternMark';

export default function Loader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="lantern-loader-glow absolute h-10 w-10 rounded-full bg-accent/40 blur-md" />
        <LanternMark className="lantern-loader-icon relative h-12 w-auto text-accent" />
      </div>
      {label && <p className="text-sm italic opacity-70">{label}</p>}
    </div>
  );
}
