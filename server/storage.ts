import {
  users,
  celebrities,
  bookings,
  campaigns,
  messages,
  deposits,
  notifications,
  adminLogs,
  settings,
  type User,
  type InsertUser,
  type Celebrity,
  type InsertCelebrity,
  type Booking,
  type InsertBooking,
  type BookingWithDetails,
  type Campaign,
  type InsertCampaign,
  type CampaignWithDetails,
  type Message,
  type InsertMessage,
  type Deposit,
  type InsertDeposit,
  type DepositWithUser,
  type Notification,
  type InsertNotification,
  type AdminLog,
  type InsertAdminLog,
  type Setting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, sql } from "drizzle-orm";

// New type definition for threads with context (Celebrity and User info)
interface ThreadWithContext {
  threadId: string;
  threadType: "booking" | "campaign";
  referenceId: number;
  lastMessage: Message;
  user: User;
  celebrity: {
    name: string;
    imageUrl: string | null;
  };
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserBalance(id: number, amount: number): Promise<User | undefined>;

  getCelebrity(id: number): Promise<Celebrity | undefined>;
  getAllCelebrities(): Promise<Celebrity[]>;
  createCelebrity(data: InsertCelebrity): Promise<Celebrity>;
  updateCelebrity(id: number, data: Partial<Celebrity>): Promise<Celebrity | undefined>;
  deleteCelebrity(id: number): Promise<boolean>;

  getBooking(id: number): Promise<BookingWithDetails | undefined>;
  getBookingsByUser(userId: number): Promise<BookingWithDetails[]>;
  getAllBookings(): Promise<BookingWithDetails[]>;
  createBooking(data: InsertBooking): Promise<Booking>;
  createBookingWithBalanceDeduction(userId: number, data: InsertBooking): Promise<{ booking: Booking; user: User }>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;

  getCampaign(id: number): Promise<CampaignWithDetails | undefined>;
  getCampaignsByUser(userId: number): Promise<CampaignWithDetails[]>;
  getAllCampaigns(): Promise<CampaignWithDetails[]>;
  createCampaign(data: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined>;

  getMessagesByThread(threadId: string): Promise<Message[]>;
  getThreadsForUser(userId: number): Promise<ThreadWithContext[]>;
  getAllThreads(): Promise<ThreadWithContext[]>;
  createMessage(data: InsertMessage): Promise<Message>;

  getDeposit(id: number): Promise<DepositWithUser | undefined>;
  getDepositsByUser(userId: number): Promise<Deposit[]>;
  getAllDeposits(): Promise<DepositWithUser[]>;
  createDeposit(data: InsertDeposit): Promise<Deposit>;
  updateDepositStatus(id: number, status: string, txHash?: string): Promise<Deposit | undefined>;

  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;

  createAdminLog(data: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(): Promise<AdminLog[]>;

  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(key: string, value: string): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        balanceUsd: sql`${users.balanceUsd} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getCelebrity(id: number): Promise<Celebrity | undefined> {
    const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, id));
    return celebrity;
  }

  async getAllCelebrities(): Promise<Celebrity[]> {
    return db.select().from(celebrities).where(eq(celebrities.status, "active")).orderBy(desc(celebrities.createdAt));
  }

  async createCelebrity(data: InsertCelebrity): Promise<Celebrity> {
    const [celebrity] = await db.insert(celebrities).values(data).returning();
    return celebrity;
  }

  async updateCelebrity(id: number, data: Partial<Celebrity>): Promise<Celebrity | undefined> {
    const { createdAt, updatedAt, ...safeData } = data as any;
    
    const [celebrity] = await db
      .update(celebrities)
      .set({ ...safeData })
      .where(eq(celebrities.id, id))
      .returning();
    return celebrity;
  }

  async deleteCelebrity(id: number): Promise<boolean> {
    await db
      .update(celebrities)
      .set({ status: "deleted" })
      .where(eq(celebrities.id, id));
    return true;
  }

  async getBooking(id: number): Promise<BookingWithDetails | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    
    if (!booking) return undefined;

    const [user] = await db.select().from(users).where(eq(users.id, booking.userId));
    const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, booking.celebrityId));

    if (!user || !celebrity) return undefined;

    return { ...booking, user, celebrity };
  }

  async getBookingsByUser(userId: number): Promise<BookingWithDetails[]> {
    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));

    const result: BookingWithDetails[] = [];
    for (const booking of userBookings) {
      const [user] = await db.select().from(users).where(eq(users.id, booking.userId));
      const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, booking.celebrityId));
      if (user && celebrity) {
        result.push({ ...booking, user, celebrity });
      }
    }
    return result;
  }

  async getAllBookings(): Promise<BookingWithDetails[]> {
    const allBookings = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));

    const result: BookingWithDetails[] = [];
    for (const booking of allBookings) {
      const [user] = await db.select().from(users).where(eq(users.id, booking.userId));
      const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, booking.celebrityId));
      if (user && celebrity) {
        result.push({ ...booking, user, celebrity });
      }
    }
    return result;
  }

  async createBooking(data: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(data).returning();
    return booking;
  }

  async createBookingWithBalanceDeduction(userId: number, data: InsertBooking): Promise<{ booking: Booking; user: User }> {
    const priceNum = parseFloat(data.priceUsd);
    
    return await db.transaction(async (tx) => {
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).for("update");
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const balanceNum = parseFloat(user.balanceUsd);
      if (balanceNum < priceNum) {
        throw new Error("Insufficient wallet balance");
      }

      const [updatedUser] = await tx
        .update(users)
        .set({
          balanceUsd: sql`${users.balanceUsd} - ${priceNum}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      const [booking] = await tx.insert(bookings).values(data).returning();
      
      return { booking, user: updatedUser };
    });
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status: status as any })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async getCampaign(id: number): Promise<CampaignWithDetails | undefined> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id));
    
    if (!campaign) return undefined;

    const [user] = await db.select().from(users).where(eq(users.id, campaign.userId));
    const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, campaign.celebrityId));

    if (!user || !celebrity) return undefined;

    return { ...campaign, user, celebrity };
  }

  async getCampaignsByUser(userId: number): Promise<CampaignWithDetails[]> {
    const userCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));

    const result: CampaignWithDetails[] = [];
    for (const campaign of userCampaigns) {
      const [user] = await db.select().from(users).where(eq(users.id, campaign.userId));
      const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, campaign.celebrityId));
       if (user && celebrity) {
        result.push({ ...campaign, user, celebrity });
      }
    }
    return result;
  }

  async getAllCampaigns(): Promise<CampaignWithDetails[]> {
    const allCampaigns = await db
      .select()
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt));

    const result: CampaignWithDetails[] = [];
    for (const campaign of allCampaigns) {
      const [user] = await db.select().from(users).where(eq(users.id, campaign.userId));
      const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, campaign.celebrityId));
      if (user && celebrity) {
        result.push({ ...campaign, user, celebrity });
      }
    }
    return result;
  }

  async createCampaign(data: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(data).returning();
    return campaign;
  }

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined> {
    const [campaign] = await db
      .update(campaigns)
      .set(data)
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async getMessagesByThread(threadId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(messages.createdAt);
  }

  // --- THREAD LIST FUNCTIONS MODIFIED TO INCLUDE CELEBRITY CONTEXT ---

  async getThreadsForUser(userId: number): Promise<ThreadWithContext[]> {
    // 1. Get all messages for user to determine unique threads
    const allUserMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.senderUserId, userId))
        .orderBy(desc(messages.createdAt));
        
    const threadMap = new Map<string, Message>();
    allUserMessages.forEach(m => {
        if (!threadMap.has(m.threadId)) {
            threadMap.set(m.threadId, m);
        }
    });
    
    const threads: ThreadWithContext[] = [];

    for (const lastMessage of threadMap.values()) {
        const referenceId = lastMessage.referenceId;
        const threadType = lastMessage.threadType;
        let celebrityId: number | null = null;
        
        // Find associated Celebrity ID from Booking or Campaign table
        if (threadType === "booking") {
            const [booking] = await db.select().from(bookings).where(eq(bookings.id, referenceId));
            celebrityId = booking?.celebrityId || null;
        } else if (threadType === "campaign") {
            const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, referenceId));
            celebrityId = campaign?.celebrityId || null;
        }

        if (celebrityId) {
            const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, celebrityId));
            
            if (celebrity) {
                threads.push({
                    threadId: lastMessage.threadId,
                    threadType: threadType,
                    referenceId: referenceId,
                    lastMessage: lastMessage,
                    user: (await this.getUser(userId))!, // User is guaranteed to exist
                    celebrity: { name: celebrity.name, imageUrl: celebrity.imageUrl || null },
                });
            }
        }
    }
    return threads;
  }

  async getAllThreads(): Promise<ThreadWithContext[]> {
    // 1. Get all messages ordered by date desc
    const allMessages = await db
        .select()
        .from(messages)
        .orderBy(desc(messages.createdAt));

    const threadMap = new Map<string, Message>();
    allMessages.forEach(msg => {
        if (!threadMap.has(msg.threadId)) {
            threadMap.set(msg.threadId, msg);
        }
    });

    const threads: ThreadWithContext[] = [];

    for (const lastMessage of threadMap.values()) {
      const referenceId = lastMessage.referenceId;
      const threadType = lastMessage.threadType;
      let userId: number | null = null;
      let celebrityId: number | null = null;

      // Find associated User and Celebrity
      if (threadType === "booking") {
        const [booking] = await db.select().from(bookings).where(eq(bookings.id, referenceId));
        userId = booking?.userId || null;
        celebrityId = booking?.celebrityId || null;
      } else if (threadType === "campaign") {
        const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, referenceId));
        userId = campaign?.userId || null;
        celebrityId = campaign?.celebrityId || null;
      }

      if (userId && celebrityId) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        const [celebrity] = await db.select().from(celebrities).where(eq(celebrities.id, celebrityId));
        
        if (user && celebrity) {
          threads.push({
            threadId: lastMessage.threadId,
            threadType: threadType,
            referenceId: referenceId,
            lastMessage: lastMessage,
            user: user,
            celebrity: { name: celebrity.name, imageUrl: celebrity.imageUrl || null },
          });
        }
      }
    }
    return threads;
  }

  // --- End Thread List Functions ---

  async createMessage(data: InsertMessage): Promise<Message> {
    // Ensure that at least text or imageUrl is present before creating a message
    if (!data.text && !data.imageUrl) {
        throw new Error("Message content (text or image) is required.");
    }
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }

  async getDeposit(id: number): Promise<DepositWithUser | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id));
    if (!deposit) return undefined;

    const [user] = await db.select().from(users).where(eq(users.id, deposit.userId));
    if (!user) return undefined;
    return { ...deposit, user };
  }

  async getDepositsByUser(userId: number): Promise<Deposit[]> {
    return db
      .select()
      .from(deposits)
      .where(eq(deposits.userId, userId))
      .orderBy(desc(deposits.createdAt));
  }

  async getAllDeposits(): Promise<DepositWithUser[]> {
    const allDeposits = await db
      .select()
      .from(deposits)
      .orderBy(desc(deposits.createdAt));

    const result: DepositWithUser[] = [];
    for (const deposit of allDeposits) {
      const [user] = await db.select().from(users).where(eq(users.id, deposit.userId));
      if (user) {
        result.push({ ...deposit, user });
      }
    }
    return result;
  }

  async createDeposit(data: InsertDeposit): Promise<Deposit> {
    const [deposit] = await db.insert(deposits).values(data).returning();
    return deposit;
  }

  async updateDepositStatus(id: number, status: string, txHash?: string): Promise<Deposit | undefined> {
    const updateData: any = { status: status as any };
    if (txHash) updateData.txHash = txHash;

    const [deposit] = await db
      .update(deposits)
      .set(updateData)
      .where(eq(deposits.id, id))
      .returning();
    return deposit;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async createAdminLog(data: InsertAdminLog): Promise<AdminLog> {
    const [log] = await db.insert(adminLogs).values(data).returning();
    return log;
  }

  async getAdminLogs(): Promise<AdminLog[]> {
    return db.select().from(adminLogs).orderBy(desc(adminLogs.createdAt)).limit(100);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async upsertSetting(key: string, value: string): Promise<Setting> {
    const [setting] = await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }
}

export const storage = new DatabaseStorage();