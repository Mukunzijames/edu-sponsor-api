import { pgTable, varchar, timestamp, uuid, numeric, date, text, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const Role = pgEnum("role", ["Admin", "School", "Sponsor", "Student"]);

export const User = pgTable("user", {
  Id: uuid().primaryKey().defaultRandom(),
  Name: varchar({ length: 255 }).notNull(),
  Age: varchar({ length: 10 }).notNull(),
  Email: varchar({ length: 255 }).notNull().unique(),
  Password: varchar({ length: 255 }).notNull(),
  Role: Role(),
  CreatedAt: timestamp("created_at").defaultNow(),
  UpdatedAt: timestamp("updated_at").defaultNow(),
});

export const School = pgTable("school", {
  Id: uuid().primaryKey().defaultRandom(),
  Name: varchar({ length: 255 }).notNull(),
  District: varchar({ length: 255 }).notNull(),
  CreatedAt: timestamp("created_at").defaultNow(),
  UpdatedAt: timestamp("updated_at").defaultNow(),
});

export const StudentProfile = pgTable("student_profile", {
  Id: uuid().primaryKey().defaultRandom(),
  UserId: uuid().notNull().references(() => User.Id),
  SchoolId: uuid().notNull().references(() => School.Id),
  CreatedAt: timestamp("created_at").defaultNow(),
  UpdatedAt: timestamp("updated_at").defaultNow(),
});

export const Sponsorship = pgTable("sponsorship", {
  Id: uuid().primaryKey().defaultRandom(),
  SponsorId: uuid().notNull().references(() => User.Id),
  StudentId: uuid().notNull().references(() => User.Id),
  StartDate: date().notNull(),
  Status: varchar({ length: 255 }).notNull(),
}); 

export const Donation = pgTable("donation", {
  Id: uuid().primaryKey().defaultRandom(),
  SponsorshipId: uuid().notNull().references(() => Sponsorship.Id),
  Amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  DonatedAt: timestamp('donated_at').notNull().defaultNow(),
});

export const Report = pgTable("report", {
  Id: uuid().primaryKey().defaultRandom(),
  StudentId: uuid().notNull().references(() => User.Id),
  Term: varchar({ length: 255 }).notNull(),
  Performance: varchar({ length: 255 }),
  Attendance: varchar({ length: 255 }),
  UploadedBy: uuid().notNull().references(() => User.Id),
  UploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
}); 

export const EmailLog = pgTable("email_log", {
  Id: uuid().primaryKey().defaultRandom(),
  UserId: uuid().notNull().references(() => User.Id),
  Subject: varchar({ length: 255 }).notNull(),
  Content: text().notNull(),
  SentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const UsersRelations = relations(User, ({ many }) => ({
  StudentProfile: many(StudentProfile),
  SponsorshipsAsSponsor: many(Sponsorship),
  SponsorshipsAsStudent: many(Sponsorship),
  Reports: many(Report),
  EmailLogs: many(EmailLog),
}));

export const SchoolsRelations = relations(School, ({ many }) => ({
  StudentProfiles: many(StudentProfile),
}));

export const SponsorshipsRelations = relations(Sponsorship, ({ one, many }) => ({
  Sponsor: one(User, { fields: [Sponsorship.SponsorId], references: [User.Id] }),
  Student: one(User, { fields: [Sponsorship.StudentId], references: [User.Id] }),
  Donations: many(Donation),
}));

export const StudentProfilesRelations = relations(StudentProfile, ({ one }) => ({
  User: one(User, { fields: [StudentProfile.UserId], references: [User.Id] }),
  School: one(School, { fields: [StudentProfile.SchoolId], references: [School.Id] }),
}));
