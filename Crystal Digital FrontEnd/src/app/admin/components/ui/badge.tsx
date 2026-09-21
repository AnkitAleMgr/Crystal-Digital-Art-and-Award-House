import { STATUS_BG, STATUS_COLORS } from "../../constants/admin";
import { QuoteRequest } from "../../types/interface/quoteRequest/quoteRequest";

export function Badge({ status }: { status: QuoteRequest["status"] }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
      style={{ color: STATUS_COLORS[status], background: STATUS_BG[status] }}
    >
      {status}
    </span>
  );
}