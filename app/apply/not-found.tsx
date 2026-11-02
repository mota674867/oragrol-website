// A link that is unknown, expired or switched off gets this plain page and nothing more: no hint about why.
export default function ApplyNotFound() {
  return (
    <main className="ap-shell ap-center">
      <h1 className="ap-h1">Page not found</h1>
      <p className="ap-muted">We could not find the page you asked for.</p>
    </main>
  );
}
