import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { users } from "@shared/schema";

// Helper to determine if we are in Replit environment
const isReplitEnv = !!process.env.REPL_ID;

const getOidcConfig = memoize(
  async () => {
    if (!isReplitEnv) return null;
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days
  const PgStore = connectPg(session);
  const sessionStore = new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl / 1000,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-prod",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in prod
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  // If running locally, we might use a mock ID
  const id = claims.sub || "local-admin-id";
  
  await storage.upsertUser({
    id: id,
    email: claims.email,
    firstName: claims.first_name || "Admin",
    lastName: claims.last_name || "User",
    profileImageUrl: claims.profile_image_url,
    role: claims.role || "user" // Default role
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, cb) => {
    // We store the whole user object or just the ID in session
    // For simplicity with OIDC, we often store the claims/tokens
    cb(null, user);
  });
  
  passport.deserializeUser((user: any, cb) => cb(null, user));

  if (isReplitEnv) {
    // --- REPLIT AUTH FLOW ---
    const config = await getOidcConfig();
    if (config) {
      const verify: VerifyFunction = async (
        tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
        verified: passport.AuthenticateCallback
      ) => {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      };

      const strategy = new Strategy(
        {
          client_id: process.env.REPL_ID!,
          redirect_uri: `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/callback`,
          ...config,
          scope: "openid email profile offline_access",
        },
        verify
      );
      passport.use("replitauth", strategy);

      app.get("/api/login", passport.authenticate("replitauth", {
        successReturnToOrRedirect: "/",
      }));

      app.get("/api/callback", 
        passport.authenticate("replitauth", {
          successReturnToOrRedirect: "/",
          failureRedirect: "/api/login",
        })
      );
    }
  } else {
    // --- LOCAL DEV AUTH FLOW ---
    // This allows you to run the app locally without Replit headers
    
    // Mock user login route for local development
    app.get("/api/login", async (req, res) => {
      // Create a mock admin user in DB if not exists
      const mockAdmin = {
        id: "local-admin-id",
        email: "admin@skyline.local",
        firstName: "Local",
        lastName: "Admin",
        profileImageUrl: "",
        role: "admin", // AUTO-ADMIN for local dev
        balanceUsd: "10000.00"
      };

      await storage.upsertUser(mockAdmin);

      const user = {
        claims: {
          sub: mockAdmin.id,
          email: mockAdmin.email,
          first_name: mockAdmin.firstName,
          last_name: mockAdmin.lastName,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        },
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      };

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        return res.redirect("/");
      });
    });
  }

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) { console.error("Logout error", err); }
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (req.isAuthenticated()) {
    // Check expiration if it exists (Replit auth)
    const user = req.user as any;
    if (user.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now > user.expires_at) {
        // Token expired
        req.logout(() => {});
        return res.status(401).json({ message: "Session expired" });
      }
    }
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const dbUser = await storage.getUser(user.claims.sub);
  if (!dbUser || dbUser.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  
  return next();
};