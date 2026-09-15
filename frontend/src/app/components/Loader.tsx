import LanternMark from '@/app/components/LanternMark';

export default function Loader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="lantern-loader-glow absolute h-14 w-14 rounded-full bg-accent/40 blur-md" />
        <LanternMark className="lantern-loader-icon relative h-16 w-auto text-accent" />
      </div>
      {label && <p className="text-sm italic opacity-70">{label}</p>}
    </div>
  );
}
