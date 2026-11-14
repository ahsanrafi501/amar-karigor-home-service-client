export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{message}</div>
    </div>
  );
}
