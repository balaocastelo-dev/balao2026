import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn();
const createTransport = vi.fn((_c: unknown) => ({ sendMail }));
vi.mock("nodemailer", () => ({ default: { createTransport: (c: unknown) => createTransport(c) } }));
vi.mock("@/lib/mail-templates", () => ({ getAdminNotificationTemplate: () => "", getNewOrderAdminTemplate: () => "" }));
vi.mock("@/lib/config", () => ({ SITE_CONFIG: { email: "loja@exemplo.com" } }));

import { sendEmail } from "@/lib/mail";

const base = { to: "cliente@exemplo.com", subject: "Orçamento", html: "<p>oi</p>", bcc: "balaocastelo@gmail.com", replyTo: "balaocastelo@gmail.com" };

describe("sendEmail sem Resend", () => {
  beforeEach(() => {
    sendMail.mockReset().mockResolvedValue({ messageId: "gm_1" });
    createTransport.mockClear();
    for (const k of ["SMTP_PASS", "SMTP_USER", "SMTP_HOST", "SMTP_PORT", "BREVO_API_KEY", "BREVO_FROM", "RESEND_API_KEY"]) delete process.env[k];
  });
  afterEach(() => vi.unstubAllGlobals());

  it("nada configurado: falha dizendo o que falta, sem tentar a Resend", async () => {
    process.env.RESEND_API_KEY = "re_x";
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const r = await sendEmail(base);
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/SMTP_PASS/);
    expect(r.error).toMatch(/apppasswords/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("com SMTP_PASS: sai pelo Gmail da loja, com nome do vendedor, resposta e cópia", async () => {
    process.env.SMTP_PASS = "abcd efgh ijkl mnop";
    const r = await sendEmail({ ...base, fromName: "Brendon · Balão da Informática" });
    expect(r).toMatchObject({ success: true, provider: "smtp", messageId: "gm_1" });
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: "smtp.gmail.com", port: 465, secure: true, auth: { user: "balaocastelo@gmail.com", pass: "abcdefghijklmnop" },
    }));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: { name: "Brendon · Balão da Informática", address: "balaocastelo@gmail.com" },
      to: "cliente@exemplo.com", replyTo: "balaocastelo@gmail.com", bcc: ["balaocastelo@gmail.com"],
    }));
  });

  it("Gmail recusa a senha: explica como trocar", async () => {
    process.env.SMTP_PASS = "errada";
    sendMail.mockRejectedValue(new Error("Invalid login: 535-5.7.8 Username and Password not accepted"));
    const r = await sendEmail(base);
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/Gmail recusou a senha/);
  });

  it("Gmail falha e a Brevo está configurada: sai pela Brevo", async () => {
    process.env.SMTP_PASS = "x";
    process.env.BREVO_API_KEY = "xkeysib-1";
    sendMail.mockRejectedValue(new Error("timeout"));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ messageId: "<br_1>" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchSpy);
    const r = await sendEmail(base);
    expect(r).toMatchObject({ success: true, provider: "brevo", messageId: "<br_1>" });
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    const corpo = JSON.parse(String(init.body));
    expect(corpo.sender.email).toBe("balaocastelo@gmail.com");
    expect(corpo.to).toEqual([{ email: "cliente@exemplo.com" }]);
    expect(corpo.bcc).toEqual([{ email: "balaocastelo@gmail.com" }]);
  });
});
