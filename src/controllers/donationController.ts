import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { Donation, Sponsorship, User } from "../db/schema";

interface UserInterface {
  Id: string;
  Name: string;
  Email: string;
  Role: string;
}

// Create a new donation record
export const createDonation = async (req: Request, res: Response) => {
  try {
    const { sponsorshipId, amount } = req.body;
    const user = req.user as unknown as UserInterface;

    if (!sponsorshipId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Sponsorship ID and amount are required",
      });
    }

    // Check if sponsorship exists and belongs to the user
    const sponsorship = await db.query.Sponsorship.findFirst({
      where: eq(Sponsorship.Id, sponsorshipId),
    });

    if (!sponsorship) {
      return res.status(404).json({
        success: false,
        message: "Sponsorship not found",
      });
    }

    if (sponsorship.SponsorId !== user.Id) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to make donations for this sponsorship",
      });
    }

    // Create donation record
    const newDonation = await db
      .insert(Donation)
      .values({
        SponsorshipId: sponsorshipId,
        Amount: amount,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: newDonation[0],
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create donation",
    });
  }
};

// Get donations by sponsorship ID
export const getDonationsBySponsorship = async (
  req: Request,
  res: Response
) => {
  try {
    const { sponsorshipId } = req.params;
    const user = req.user as unknown as UserInterface;

    // Check if sponsorship exists and belongs to the user
    const sponsorship = await db.query.Sponsorship.findFirst({
      where: eq(Sponsorship.Id, sponsorshipId),
    });

    if (!sponsorship) {
      return res.status(404).json({
        success: false,
        message: "Sponsorship not found",
      });
    }

    // Check if user is authorized (either sponsor or student)
    if (
      sponsorship.SponsorId !== user.Id &&
      sponsorship.StudentId !== user.Id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these donations",
      });
    }

    // Get donations
    const donations = await db.query.Donation.findMany({
      where: eq(Donation.SponsorshipId, sponsorshipId),
      orderBy: (donation, { desc }) => [desc(donation.DonatedAt)],
    });

    return res.status(200).json({
      success: true,
      message: "Donations retrieved successfully",
      data: donations,
    });
  } catch (error) {
    console.error("Error retrieving donations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve donations",
    });
  }
};

// Get all donations made by a sponsor
export const getDonationsBySponsor = async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UserInterface;

    const sponsorships = await db.query.Sponsorship.findMany({});

    const sponsorshipIds = sponsorships.map((s) => s.Id);

    const donations = await db.query.Donation.findMany({
      where: (donation, { inArray }) =>
        inArray(donation.SponsorshipId, sponsorshipIds),
      orderBy: (donation, { desc }) => [desc(donation.DonatedAt)],
    });

    return res.status(200).json({
      success: true,
      message: "Donations retrieved successfully",
      data: donations,
    });
  } catch (error) {
    console.error("Error retrieving donations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve donations",
    });
  }
};

// Get all donations (for testing)
export const getAllDonations = async (req: Request, res: Response) => {
  try {
    // Get all donations without relations
    const donations = await db.query.Donation.findMany({
      orderBy: (donation, { desc }) => [desc(donation.DonatedAt)],
    });

    // Get sponsorships for these donations
    const sponsorshipIds = [...new Set(donations.map((d) => d.SponsorshipId))];
    const sponsorships = await db.query.Sponsorship.findMany({
      where: (sponsorship, { inArray }) =>
        inArray(sponsorship.Id, sponsorshipIds),
    });

    // Get users for these sponsorships
    const userIds = [
      ...new Set([
        ...sponsorships.map((s) => s.SponsorId),
        ...sponsorships.map((s) => s.StudentId),
      ]),
    ];
    const users = await db.query.User.findMany({
      where: (user, { inArray }) => inArray(user.Id, userIds),
    });

    // Create a map of users by ID
    const userMap = new Map(users.map((user) => [user.Id, user]));
    // Create a map of sponsorships by ID
    const sponsorshipMap = new Map(sponsorships.map((s) => [s.Id, s]));

    // Enrich donations with sponsorship and user data
    const enrichedDonations = donations.map((donation) => {

      const sponsorship = sponsorshipMap.get(donation.SponsorshipId);
      let sponsor = null;
      let student = null;

      if (sponsorship) {
        sponsor = userMap.get(sponsorship.SponsorId);
        student = userMap.get(sponsorship.StudentId);
      }

      return {
        ...donation,
        Sponsorship: sponsorship
          ? {
              ...sponsorship,
              Sponsor: sponsor,
              Student: student,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "All donations retrieved successfully",
      data: enrichedDonations,
    });
  } catch (error) {
    console.error("Error retrieving all donations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve all donations",
    });
  }
};

// Get donation statistics for a sponsor
export const getDonationStats = async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UserInterface;

    // Get all sponsorships for the user
    const sponsorships = await db.query.Sponsorship.findMany({
      where: eq(Sponsorship.SponsorId, user.Id),
    });

    const sponsorshipIds = sponsorships.map((s) => s.Id);

    // Get all donations for these sponsorships
    const donations = await db.query.Donation.findMany({
      where: (donation, { inArray }) =>
        inArray(donation.SponsorshipId, sponsorshipIds),
    });

    // Calculate statistics
    const totalAmount = donations.reduce(
      (sum, donation) => sum + Number(donation.Amount),
      0
    );
    const donationCount = donations.length;

    return res.status(200).json({
      success: true,
      message: "Donation statistics retrieved successfully",
      data: {
        totalAmount,
        donationCount,
        studentCount: sponsorships.length,
      },
    });
  } catch (error) {
    console.error("Error retrieving donation statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve donation statistics",
    });
  }
};
