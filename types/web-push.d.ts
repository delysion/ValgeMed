declare module "web-push" {
  interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  function generateVAPIDKeys(): VapidKeys;
  function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;
  function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer,
    options?: Record<string, unknown>
  ): Promise<void>;

  export { generateVAPIDKeys, setVapidDetails, sendNotification };
}