import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCelebritySchema } from "@shared/schema";
import PDFDocument from "pdfkit";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs"; // Needed for password reset

// Configure Multer for file uploads
const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storageConfig });

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as any).role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}

async function getCryptoPrice(coin: string): Promise<number> {
  // Simple mock for local dev to avoid reliance on external APIs and rate limits
  if (coin === "BTC") return 95000;
  if (coin === "ETH") return 3500;
  if (coin === "USDT") return 1;
  return 1;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const wsClients = new Map<number, WebSocket>();

  wss.on("connection", (ws, req) => {
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === 'auth' && data.userId) {
                wsClients.set(data.userId, ws);
            }
        } catch(e) { console.error(e); }
    });
  });

  function broadcastToUser(userId: number, data: any) {
     const client = wsClients.get(userId);
     if (client && client.readyState === WebSocket.OPEN) {
         client.send(JSON.stringify(data));
     }
  }

  // --- PUBLIC ROUTES ---

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.json(null);
  });

  app.post("/api/upload", upload.array('images', 5), (req, res) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const files = req.files as Express.Multer.File[];
    // Return paths with leading slash
    const paths = files.map(f => `/uploads/${f.filename}`);
    res.json({ paths });
  });

  app.get("/api/celebrities", async (req, res) => {
    const celebrities = await storage.getAllCelebrities();
    res.json(celebrities);
  });

  app.get("/api/celebrities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const celebrity = await storage.getCelebrity(id);
    if (!celebrity) return res.status(404).json({ message: "Celebrity not found" });
    res.json(celebrity);
  });

  app.get("/api/crypto/prices", async (req, res) => {
    const [btc, eth, usdt] = await Promise.all([
      getCryptoPrice("BTC"),
      getCryptoPrice("ETH"),
      getCryptoPrice("USDT"),
    ]);
    res.json({ BTC: btc, ETH: eth, USDT: usdt });
  });

  app.get("/api/settings/wallets", async (req, res) => {
    const [btc, eth, usdt] = await Promise.all([
      storage.getSetting("wallet_btc"),
      storage.getSetting("wallet_eth"),
      storage.getSetting("wallet_usdt"),
    ]);
    res.json({
      BTC: btc?.value || "",
      ETH: eth?.value || "",
      USDT: usdt?.value || "",
    });
  });

  // --- ADMIN ROUTES ---
  
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [users, celebrities, bookings, campaigns, deposits] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllCelebrities(),
        storage.getAllBookings(),
        storage.getAllCampaigns(),
        storage.getAllDeposits(),
      ]);

      const totalRevenue = deposits
        .filter(d => d.status === "approved")
        .reduce((sum, d) => sum + parseFloat(d.amountUsd), 0);

      const pendingBookings = bookings.filter(b => b.status === "pending").length;
      const pendingCampaigns = campaigns.filter(c => c.status === "pending").length;
      const pendingDeposits = deposits.filter(d => d.status === "pending").length;

      res.json({
        totalUsers: users.length,
        totalCelebrities: celebrities.length,
        totalBookings: bookings.length,
        totalCampaigns: campaigns.length,
        totalRevenue,
        pendingBookings,
        pendingCampaigns,
        pendingDeposits,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/celebrities", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { images, priceUsd, ...rest } = req.body;
      
      const data = insertCelebritySchema.parse({
        ...rest,
        images: images || [],
        imageUrl: images && images.length > 0 ? images[0] : null,
        priceUsd: String(priceUsd)
      });
      
      const celebrity = await storage.createCelebrity(data);
      res.status(201).json(celebrity);
    } catch (err) {
      console.error("Error creating celebrity:", err);
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.patch("/api/celebrities/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { priceUsd, images, ...rest } = req.body;
      
      const updateData: any = {
        ...rest,
        priceUsd: priceUsd ? String(priceUsd) : undefined
      };

      if (images) {
          updateData.images = images;
          if (images.length > 0) {
              updateData.imageUrl = images[0];
          }
      }
      
      const celebrity = await storage.updateCelebrity(id, updateData);
      res.json(celebrity);
    } catch (err) {
      console.error("Error updating celebrity:", err);
      res.status(400).json({ message: "Update failed" });
    }
  });

  app.delete("/api/celebrities/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCelebrity(id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting celebrity:", err);
      res.status(400).json({ message: "Delete failed" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // NEW: Admin route to delete a user
  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Add delete logic to storage if missing or implement directly
        // For now, assuming storage handles standard user updates/soft delete
        // If storage.deleteUser exists use it, otherwise soft delete via update
        await storage.updateUser(id, { status: "deleted" });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ message: "Delete failed" });
    }
  });

  app.get("/api/admin/deposits", isAuthenticated, isAdmin, async (req, res) => {
    const deposits = await storage.getAllDeposits();
    res.json(deposits);
  });
  
  app.get("/api/admin/bookings", isAuthenticated, isAdmin, async (req, res) => {
    const bookings = await storage.getAllBookings();
    res.json(bookings);
  });

  app.get("/api/admin/campaigns", isAuthenticated, isAdmin, async (req, res) => {
    const campaigns = await storage.getAllCampaigns();
    res.json(campaigns);
  });

  app.patch("/api/admin/bookings/:id", isAuthenticated, isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const existingBooking = await storage.getBooking(id);
    if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    const booking = await storage.updateBookingStatus(id, status);
    
    // Refund logic
    if ((status === 'cancelled' || status === 'rejected') && existingBooking.status !== 'cancelled' && existingBooking.status !== 'rejected') {
        if (existingBooking.status === 'pending' || existingBooking.status === 'confirmed') {
             await storage.updateUserBalance(existingBooking.userId, parseFloat(existingBooking.priceUsd));
             
             await storage.createNotification({
                userId: existingBooking.userId,
                title: "Booking Refunded",
                message: `Your booking for ${existingBooking.celebrity.name} was ${status}. $${existingBooking.priceUsd} has been refunded to your wallet.`,
                type: 'wallet',
                isRead: false
            });
        }
    }
    
    if(booking) {
        await storage.createNotification({
            userId: booking.userId,
            title: `Booking ${status}`,
            message: `Your booking status has been updated to ${status}`,
            type: 'booking',
            isRead: false
        });
        broadcastToUser(booking.userId, { type: 'notification' });
    }
    
    res.json(booking);
  });

  app.patch("/api/admin/campaigns/:id", isAuthenticated, isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const campaign = await storage.updateCampaign(id, { status });
    
    if(campaign) {
        await storage.createNotification({
            userId: campaign.userId,
            title: `Campaign Request ${status}`,
            message: `Your campaign request status is now: ${status}`,
            type: 'campaign',
            isRead: false
        });
        broadcastToUser(campaign.userId, { type: 'notification' });
    }
    
    res.json(campaign);
  });
  
  app.patch("/api/admin/deposits/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const deposit = await storage.updateDepositStatus(id, status);
      
      if (status === 'approved' && deposit) {
         await storage.updateUserBalance(deposit.userId, parseFloat(deposit.amountUsd));
      }
      
      if(deposit) {
         await storage.createNotification({
             userId: deposit.userId,
             title: `Deposit ${status}`,
             message: `Your deposit of $${deposit.amountUsd} has been ${status}`,
             type: 'deposit',
             isRead: false
         });
         broadcastToUser(deposit.userId, { type: 'notification' });
      }
      
      res.json(deposit);
    } catch (err) {
      console.error("Error updating deposit:", err);
      res.status(400).json({ message: "Update failed" });
    }
  });

  // Updated Admin User Edit/Reset Password Route
  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { password, ...otherData } = req.body;
    
    let updatePayload = { ...otherData };
    
    if (password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatePayload.password = hashedPassword;
        } catch (error) {
            return res.status(500).json({ message: "Error hashing password" });
        }
    }

    try {
        const user = await storage.updateUser(id, updatePayload);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: "Failed to update user" });
    }
  });
  
  app.post("/api/admin/settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { BTC_WALLET, ETH_WALLET, USDT_WALLET } = req.body;
        if (BTC_WALLET) await storage.upsertSetting("wallet_btc", BTC_WALLET);
        if (ETH_WALLET) await storage.upsertSetting("wallet_eth", ETH_WALLET);
        if (USDT_WALLET) await storage.upsertSetting("wallet_usdt", USDT_WALLET);
        res.json({ success: true });
    } catch(err) {
        console.error("Settings error:", err);
        res.status(500).json({ message: "Failed to save settings" });
    }
  });
  
  app.get("/api/admin/settings", isAuthenticated, isAdmin, async (req, res) => {
      const settings = await storage.getAllSettings();
      const settingsMap: Record<string, string> = {};
      settings.forEach(s => settingsMap[s.key.toUpperCase()] = s.value);
      res.json(settingsMap);
  });

  // User routes
  app.get("/api/bookings", isAuthenticated, async (req: any, res) => {
    const bookings = await storage.getBookingsByUser(req.user.id);
    res.json(bookings);
  });

  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const { celebrityId, eventDate, eventDetails } = req.body;
      const celebrity = await storage.getCelebrity(celebrityId);
      
      if (!celebrity) return res.status(404).send("Celebrity not found");

      const result = await storage.createBookingWithBalanceDeduction(req.user.id, {
        userId: req.user.id,
        celebrityId,
        priceUsd: celebrity.priceUsd,
        status: "pending",
        eventDate: eventDate ? new Date(eventDate) : null,
        eventDetails,
      });
      
      await storage.createNotification({
          userId: req.user.id,
          title: "Booking Request Sent",
          message: `Your booking request for ${celebrity.name} has been sent.`,
          type: "booking",
          isRead: false
      });
      
      const threadId = `booking-${result.booking.id}`;
      await storage.createMessage({
          threadId,
          threadType: 'booking',
          referenceId: result.booking.id,
          sender: 'user',
          senderUserId: req.user.id,
          text: `Booking Request Details: ${eventDetails}`
      });
      
      res.status(201).json(result.booking);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/deposits", isAuthenticated, async (req: any, res) => {
    const deposits = await storage.getDepositsByUser(req.user.id);
    res.json(deposits);
  });

  app.post("/api/deposits", isAuthenticated, async (req: any, res) => {
    const { amountUsd, coin } = req.body;
    const price = await getCryptoPrice(coin);
    const cryptoAmount = parseFloat(amountUsd) / price;
    const walletSetting = await storage.getSetting(`wallet_${coin.toLowerCase()}`);
    
    const deposit = await storage.createDeposit({
      userId: req.user.id,
      amountUsd: amountUsd.toString(),
      coin,
      cryptoAmountExpected: cryptoAmount.toFixed(8),
      status: "pending",
      walletAddress: walletSetting?.value || "WALLET_ADDRESS_NOT_SET"
    });
    
    await storage.createNotification({
          userId: req.user.id,
          title: "Deposit Created",
          message: `Your deposit request for $${amountUsd} is pending approval.`,
          type: "deposit",
          isRead: false
      });
    
    res.status(201).json(deposit);
  });
  
  app.get("/api/campaigns", isAuthenticated, async (req: any, res) => {
    const campaigns = await storage.getCampaignsByUser(req.user.id);
    res.json(campaigns);
  });

  app.post("/api/campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const { celebrityId, campaignType, description } = req.body;
      const celebrity = await storage.getCelebrity(celebrityId);
      
      if (!celebrity) return res.status(404).send("Celebrity not found");

      const campaign = await storage.createCampaign({
        userId: req.user.id,
        celebrityId,
        campaignType,
        description,
        status: "pending",
        customPriceUsd: null 
      });
      
      await storage.createNotification({
          userId: req.user.id,
          title: "Campaign Request Sent",
          message: `Request sent to ${celebrity.name}. An agent will contact you shortly.`,
          type: "campaign",
          isRead: false
      });
      
      const threadId = `campaign-${campaign.id}`;
      await storage.createMessage({
          threadId,
          threadType: 'campaign',
          referenceId: campaign.id,
          sender: 'user',
          senderUserId: req.user.id,
          text: `New Campaign Request: ${campaignType}. Details: ${description}`
      });
      
      res.status(201).json(campaign);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });
  
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    const notifications = await storage.getNotificationsByUser(req.user.id);
    res.json(notifications);
  });
  
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    await storage.markNotificationRead(id);
    res.json({ success: true });
  });

  app.get("/api/messages/:threadId", isAuthenticated, async (req: any, res) => {
    try {
        const { threadId } = req.params;
        const messages = await storage.getMessagesByThread(threadId);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
      if((req.user as any).role === 'admin') {
          const threads = await storage.getAllThreads();
          res.json(threads);
      } else {
          const threads = await storage.getThreadsForUser(req.user.id);
          res.json(threads);
      }
  });

  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { threadId, threadType, referenceId, text, imageUrl } = req.body;

      const message = await storage.createMessage({
        threadId,
        threadType,
        referenceId: parseInt(referenceId),
        sender: "user",
        senderUserId: userId,
        text: text || null, // Ensure empty string becomes null if image provided
        imageUrl: imageUrl || null
      });
      
      res.status(201).json(message);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to send message" });
    }
  });

  app.post("/api/admin/messages", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const { threadId, threadType, referenceId, text, imageUrl } = req.body;

      const message = await storage.createMessage({
        threadId,
        threadType,
        referenceId: parseInt(referenceId),
        sender: "admin",
        senderUserId: adminId,
        text: text || null,
        imageUrl: imageUrl || null
      });

      let targetUserId: number | null = null;
      if (threadType === "booking") {
        const booking = await storage.getBooking(parseInt(referenceId));
        targetUserId = booking?.userId || null;
      } else if (threadType === "campaign") {
        const campaign = await storage.getCampaign(parseInt(referenceId));
        targetUserId = campaign?.userId || null;
      }
      
      if (targetUserId) {
        await storage.createNotification({
             userId: targetUserId,
             title: `New Message from Agent`,
             message: `You have a new message regarding your ${threadType} request.`,
             type: 'message',
             isRead: false
        });
        broadcastToUser(targetUserId, { type: "new_message", threadId, message });
      }

      res.status(201).json(message);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to send message" });
    }
  });

  return httpServer;
}