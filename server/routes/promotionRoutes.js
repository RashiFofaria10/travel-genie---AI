const express = require("express");
const Promotion = require("../models/Promotion");

const router = express.Router();

const INITIAL_PROMOTIONS = [
  {
    title: "Rajasthan Royal Heritage & Artisan Trail",
    description:
      "Save up to 25% on luxury palace stays, private guided artisan studio tours in Jaipur, and desert camel safaris in Jaisalmer.",
    destination: "Rajasthan (Jaipur & Udaipur)",
    season: "Winter Special",
    category: "Heritage & Culture",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    callToAction: "Book Heritage Trail",
    startDate: new Date("2026-10-01"),
    endDate: new Date("2027-03-31"),
    active: true,
  },
  {
    title: "Kashmir Gulmarg Powder Snow & Houseboat Escape",
    description:
      "Complimentary gondola lift passes and traditional shikara rides on Dal Lake when booking 4+ nights in Srinagar and Gulmarg.",
    destination: "Kashmir (Srinagar & Gulmarg)",
    season: "Winter",
    category: "Mountain & Adventure",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    callToAction: "Claim Winter Pass",
    startDate: new Date("2026-11-01"),
    endDate: new Date("2027-02-28"),
    active: true,
  },
  {
    title: "Goa Coastal Sunsets & Heritage Villas",
    description:
      "Special seasonal rates on boutique beachfront Portuguese villas, sunset catamaran cruises, and local spice plantation dining.",
    destination: "Goa",
    season: "Festive Season",
    category: "Beach & Relaxation",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    callToAction: "Explore Goa Deals",
    startDate: new Date("2026-10-15"),
    endDate: new Date("2027-01-15"),
    active: true,
  },
  {
    title: "Kerala Backwaters & Ayurvedic Wellness Retreat",
    description:
      "Includes daily authentic Ayurvedic rejuvenation spa sessions and a complimentary night on a private Alleppey houseboat.",
    destination: "Kerala (Alleppey & Munnar)",
    season: "Post-Monsoon Refresh",
    category: "Wellness & Nature",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    callToAction: "Discover Wellness",
    startDate: new Date("2026-09-01"),
    endDate: new Date("2027-04-30"),
    active: true,
  },
  {
    title: "Kyoto Autumn Leaves & Zen Tea Ceremony",
    description:
      "Experience autumn foliage in Arashiyama with private master craft weaving workshops in Nishijin and traditional Ryokan stays.",
    destination: "Kyoto, Japan",
    season: "Autumn Foliage",
    category: "International Culture",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    callToAction: "View Kyoto Package",
    startDate: new Date("2026-10-01"),
    endDate: new Date("2026-12-15"),
    active: true,
  },
  {
    title: "Paris Art & Gourmet Spring Getaway",
    description:
      "Skip-the-line museum passes for the Louvre and Musée d'Orsay plus a Seine river dinner cruise with select boutique hotels.",
    destination: "Paris, France",
    season: "Spring Early-Bird",
    category: "City & Art",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    callToAction: "Reserve Paris Pass",
    startDate: new Date("2027-02-01"),
    endDate: new Date("2027-05-31"),
    active: true,
  },
];

router.get("/", async (req, res) => {
  try {
    const { destination, season, category } = req.query;

    // Check if collection is empty, auto-seed if needed
    const count = await Promotion.countDocuments();
    if (count === 0) {
      await Promotion.insertMany(INITIAL_PROMOTIONS);
      console.log("✅ Seeded initial active promotions to MongoDB");
    }

    const filter = { active: true };

    if (destination) {
      filter.destination = { $regex: destination.trim(), $options: "i" };
    }

    if (season) {
      filter.season = { $regex: season.trim(), $options: "i" };
    }

    if (category) {
      filter.category = { $regex: category.trim(), $options: "i" };
    }

    const promotions = await Promotion.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    console.error("Promotions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch promotions",
    });
  }
});

module.exports = router;