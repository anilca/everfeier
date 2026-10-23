import { describe, expect, it, vi } from "vitest";
import { makeOrder } from "./test-fixtures";
import { parseWithdrawalInput, processWithdrawal, type Mail, type WithdrawalDeps } from "./withdrawal";

const input = { name: "Erika Musterfrau", orderNo: "ef-7k3qxm", email: "Kunde@example.de", message: "" };
const receivedAt = new Date("2026-10-30T14:05:00Z");

function deps(order = makeOrder()) {
  const mails: Mail[] = [];
  const d = {
    findOrderByNo: vi.fn(async () => order),
    markWithdrawal: vi.fn(async () => {}),
    sendMail: vi.fn(async (m: Mail) => {
      mails.push(m);
    }),
    operatorEmail: "shop@example.de",
    now: () => receivedAt,
  } satisfies WithdrawalDeps;
  return { d, mails };
}

describe("processWithdrawal", () => {
  it("marks a matching order and confirms with content and timestamp", async () => {
    const { d, mails } = deps();
    const result = await processWithdrawal(input, d);
    expect(result).toMatchObject({ ok: true, matchedOrderNo: "EF-7K3QXM", customerMailSent: true });
    expect(d.markWithdrawal).toHaveBeenCalledWith(expect.objectContaining({ orderNo: "EF-7K3QXM" }), receivedAt);

    const [customer, operator] = mails;
    expect(customer.to).toBe("Kunde@example.de");
    expect(customer.text).toContain("Erika Musterfrau");
    expect(customer.text).toContain("ef-7k3qxm");
    expect(customer.text).toContain("30. Oktober 2026 um 15:05:00");
    expect(operator.to).toBe("shop@example.de");
    expect(operator.subject).toBe("Widerruf EF-7K3QXM");
  });

  it("still confirms an unmatched declaration and flags it for the operator", async () => {
    const { d, mails } = deps(makeOrder({ email: "jemand@anders.de" }));
    const result = await processWithdrawal(input, d);
    expect(result).toMatchObject({ ok: true, matchedOrderNo: null });
    expect(d.markWithdrawal).not.toHaveBeenCalled();
    expect(mails).toHaveLength(2);
    expect(mails[1].subject).toContain("nicht zugeordnet");
  });

  it("does not look up malformed order numbers", async () => {
    const { d, mails } = deps();
    await processWithdrawal({ ...input, orderNo: "weiß nicht" }, d);
    expect(d.findOrderByNo).not.toHaveBeenCalled();
    expect(mails).toHaveLength(2);
  });

  it("reports a failed customer confirmation", async () => {
    const { d } = deps();
    d.sendMail.mockRejectedValueOnce(new Error("down"));
    const result = await processWithdrawal(input, d);
    expect(result).toMatchObject({ ok: true, customerMailSent: false });
  });
});

describe("parseWithdrawalInput", () => {
  it("requires name, order number and a valid e-mail", () => {
    const result = parseWithdrawalInput({ name: " ", orderNo: "", email: "x" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["email", "name", "orderNo"]);
  });

  it("trims valid input", () => {
    expect(parseWithdrawalInput({ name: " Erika ", orderNo: " EF-7K3QXM ", email: " e@x.de " })).toEqual({
      ok: true,
      input: { name: "Erika", orderNo: "EF-7K3QXM", email: "e@x.de", message: "" },
    });
  });
});
