export default function Divider() {
  return (
    <div className="mx-auto my-12 flex max-w-6xl items-center justify-center px-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-current to-current opacity-40" />
      <div className="mx-3 h-1 w-1 rotate-45 bg-accent opacity-70" />
      <div className="mx-2 h-2.5 w-2.5 rotate-45 border border-accent bg-accent/20" />
      <div className="mx-3 h-1 w-1 rotate-45 bg-accent opacity-70" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-current to-current opacity-40" />
    </div>
  );
}
