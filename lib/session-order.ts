/** Only the newest session request may commit identity, including slow bootstrap reads. */
export class SessionOrder {
  private revision = 0;
  begin() { const revision = ++this.revision; return () => revision === this.revision; }
}

/** Clear the old identity as soon as login changes cookies, even if profile loading fails. */
export async function establishSession<T>(establish: () => Promise<unknown>, loadIdentity: () => Promise<T>, onEstablished: () => void): Promise<T> {
  await establish();
  onEstablished();
  return loadIdentity();
}
