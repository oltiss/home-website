// server.js
// Główny plik serwera Node.js z Express i Nodemailer

// Ładowanie zmiennych środowiskowych z pliku .env
require("dotenv").config();

// Importowanie wymaganych bibliotek
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Inicjalizacja aplikacji Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE - Konfiguracja podstawowa
// ============================================

// Zaufaj pierwszemu proxy (np. Nginx) - ważne dla rate limitera
app.set("trust proxy", 1);

// Rate Limiter - ochrona przed atakami brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 10, // max 10 żądań z jednego IP w ciągu 15 minut
  standardHeaders: true, // Zwracaj informacje o limicie w nagłówkach `RateLimit-*`
  legacyHeaders: false, // Wyłącz nagłówki `X-RateLimit-*`
});

// CORS - pozwala na żądania z innych domen (frontend -> backend)
app.use(
  cors({
    origin: ["http://design-web.pl", "http://localhost:8080"], // W produkcji zmień na konkretną domenę: 'https://design-web.pl'
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Parsowanie JSON z body żądań
app.use(express.json());

// Parsowanie danych z formularzy URL-encoded
app.use(express.urlencoded({ extended: true }));

// Serwowanie plików statycznych (HTML, CSS, JS)
// Odkomentuj jeśli chcesz serwować frontend z tego samego serwera
// app.use(express.static(path.join(__dirname, 'public')));

// Logowanie żądań do konsoli (pomocne przy debugowaniu)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// KONFIGURACJA NODEMAILER
// ============================================

// Tworzenie transportera SMTP dla Mailcow
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // mail.design-web.pl
  port: parseInt(process.env.SMTP_PORT || "587"), // 587 dla STARTTLS
  secure: false, // false dla STARTTLS, true dla SSL (port 465)
  auth: {
    user: process.env.SMTP_USER, // kontakt@design-web.pl
    pass: process.env.SMTP_PASS, // Hasło z Mailcow
  },
});

// Weryfikacja połączenia z serwerem SMTP przy starcie
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Błąd połączenia z serwerem SMTP:", error);
  } else {
    console.log("✅ Serwer SMTP jest gotowy do wysyłania wiadomości");
  }
});

// ============================================
// ENDPOINTY API
// ============================================

// Endpoint testowy - sprawdzenie czy serwer działa
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Backend formularza kontaktowego design-web.pl",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint do healthcheck
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// GŁÓWNY ENDPOINT - Obsługa formularza kontaktowego
// ============================================
app.post("/api/contact", limiter, async (req, res) => {
  console.log("📧 Otrzymano żądanie wysłania emaila");
  console.log("Dane formularza:", req.body);

  try {
    // Pobieranie danych z body żądania
    const { name, email, phone, message } = req.body;

    // ============================================
    // WALIDACJA DANYCH
    // ============================================

    // Sprawdzenie czy wszystkie wymagane pola są wypełnione
    if (!name || !email || !message) {
      console.warn("⚠️ Brakuje wymaganych pól");
      return res.status(400).json({
        status: "error",
        message:
          "Brakuje wymaganych pól: imię, email i wiadomość są obowiązkowe",
      });
    }

    // Walidacja formatu email za pomocą regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn("⚠️ Nieprawidłowy format email:", email);
      return res.status(400).json({
        status: "error",
        message: "Nieprawidłowy format adresu email",
      });
    }

    // Walidacja długości wiadomości (max 5000 znaków)
    if (message.length > 10000) {
      console.warn("⚠️ Wiadomość za długa");
      return res.status(400).json({
        status: "error",
        message: "Wiadomość jest zbyt długa (max 5000 znaków)",
      });
    }

    // Zabezpieczenie przed spamem - sprawdzenie czy nazwa nie zawiera podejrzanych fraz
    const spamKeywords = ["viagra", "casino", "lottery", "pills"];
    const containsSpam = spamKeywords.some(
      (keyword) =>
        name.toLowerCase().includes(keyword) ||
        message.toLowerCase().includes(keyword)
    );

    if (containsSpam) {
      console.warn("⚠️ Wykryto potencjalny spam");
      return res.status(400).json({
        status: "error",
        message: "Wiadomość została odrzucona",
      });
    }

    // ============================================
    // PRZYGOTOWANIE I WYSYŁANIE EMAIL
    // ============================================

    // Konfiguracja wiadomości email
    const mailOptions = {
      from: `"Formularz design-web.pl" <${process.env.SMTP_USER}>`, // Nadawca
      to: process.env.EMAIL_TO, // Odbiorca (kontakt@design-web.pl)
      replyTo: email, // Odpowiedz bezpośrednio do klienta
      subject: `🔔 Nowa wiadomość od: ${name}`, // Temat

      // Treść tekstowa (plain text) - dla klientów email bez HTML
      text: `
Otrzymałeś nową wiadomość z formularza kontaktowego design-web.pl

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DANE KONTAKTOWE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Imię i nazwisko: ${name}
📧 Email: ${email}
📱 Telefon: ${phone || "Nie podano"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TREŚĆ WIADOMOŚCI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Data wysłania: ${new Date().toLocaleString("pl-PL")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `.trim(),

      // Treść HTML (sformatowana) - dla nowoczesnych klientów email
      html: `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nowa wiadomość - design-web.pl</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                🔔 Nowa wiadomość z formularza
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.9; font-size: 14px;">
                                design-web.pl
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">

                            <!-- Dane kontaktowe -->
                            <h2 style="color: #333333; font-size: 18px; margin: 0 0 20px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                                📋 Dane kontaktowe
                            </h2>

                            <table cellpadding="8" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 10px; background-color: #f8f9fa; border-left: 3px solid #667eea;">
                                        <strong style="color: #555;">👤 Imię i nazwisko:</strong><br>
                                        <span style="color: #333; font-size: 16px;">${name}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; background-color: #f8f9fa; border-left: 3px solid #667eea;">
                                        <strong style="color: #555;">📧 Email:</strong><br>
                                        <a href="mailto:${email}" style="color: #667eea; text-decoration: none; font-size: 16px;">${email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; background-color: #f8f9fa; border-left: 3px solid #667eea;">
                                        <strong style="color: #555;">📱 Telefon:</strong><br>
                                        <span style="color: #333; font-size: 16px;">${
                                          phone || "Nie podano"
                                        }</span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Treść wiadomości -->
                            <h2 style="color: #333333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                                💬 Treść wiadomości
                            </h2>

                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin-bottom: 20px;">
                                <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap; font-size: 15px;">${message}</p>
                            </div>

                            <!-- Przycisk odpowiedzi -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="mailto:${email}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">
                                            ✉️ Odpowiedz na wiadomość
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0; color: #666; font-size: 12px;">
                                📅 Data wysłania: ${new Date().toLocaleString(
                                  "pl-PL",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                            </p>
                            <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
                                Ta wiadomość została wysłana automatycznie z formularza kontaktowego na stronie design-web.pl
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `.trim(),
    };

    // Wysyłanie emaila
    console.log("📤 Wysyłanie emaila...");
    const info = await transporter.sendMail(mailOptions);

    // Logowanie sukcesu
    console.log("✅ Email wysłany pomyślnie!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    // Zwracamy odpowiedź sukcesu do frontendu
    res.status(200).json({
      status: "success",
      message: "Wiadomość została wysłana pomyślnie!",
      messageId: info.messageId,
    });
  } catch (error) {
    // Obsługa błędów
    console.error("❌ Błąd podczas wysyłania emaila:", error);

    // Zwracamy szczegółowy błąd w trybie development
    if (process.env.NODE_ENV === "development") {
      return res.status(500).json({
        status: "error",
        message: "Wystąpił błąd podczas wysyłania wiadomości",
        error: error.message,
        details: error.toString(),
      });
    }

    // W produkcji zwracamy ogólny komunikat błędu
    res.status(500).json({
      status: "error",
      message:
        "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.",
    });
  }
});

// ============================================
// OBSŁUGA BŁĘDÓW 404
// ============================================
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint nie został znaleziony",
  });
});

// ============================================
// URUCHOMIENIE SERWERA
// ============================================
app.listen(PORT, () => {
  console.log("");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   🚀 Serwer design-web.pl uruchomiony!          ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("");
  console.log(`📍 Adres lokalny:  http://localhost:${PORT}`);
  console.log(`📍 Endpoint API:   http://localhost:${PORT}/api/contact`);
  console.log(`📧 SMTP Host:      ${process.env.SMTP_HOST}`);
  console.log(`📧 Email docelowy: ${process.env.EMAIL_TO}`);
  console.log("");
  console.log("Naciśnij Ctrl+C aby zatrzymać serwer");
  console.log("");
});

// Graceful shutdown - zamknięcie połączeń przy wyłączeniu serwera
process.on("SIGTERM", () => {
  console.log("👋 Otrzymano SIGTERM, zamykanie serwera...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n👋 Otrzymano SIGINT, zamykanie serwera...");
  process.exit(0);
});
