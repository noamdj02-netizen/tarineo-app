/** Rejette si la promesse dépasse `ms` millisecondes. */
export function withTimeout<T>(promesse: Promise<T>, ms: number, message = "Délai dépassé"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promesse
      .then((v) => {
        window.clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        window.clearTimeout(timer);
        reject(e);
      });
  });
}
