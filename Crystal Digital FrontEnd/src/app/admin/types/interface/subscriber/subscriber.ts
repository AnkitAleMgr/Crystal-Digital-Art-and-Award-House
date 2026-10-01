/**
 * One row of the newsletter list. Created by the public footer form as
 * "pending" and only promoted to "active" when the recipient clicks the link in
 * their confirmation email — "active" is the only status the product broadcast
 * reads, and "unsubscribed" rows are kept so the same address can rejoin.
 */
export interface Subscriber {
  id: string;
  email: string;
  status: "pending" | "active" | "unsubscribed";
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
