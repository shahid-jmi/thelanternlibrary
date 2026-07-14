export default function Divider() {
  return (
    <div className="mx-auto my-12 flex max-w-6xl items-center justify-center px-4">
      <div className="h-px flex-1 bg-current opacity-20" />
      <div className="mx-4 h-2 w-2 rotate-45 border border-current opacity-30" />
      <div className="h-px flex-1 bg-current opacity-20" />
    </div>
  );
}
