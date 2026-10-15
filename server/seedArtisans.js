require("dotenv").config();
const mongoose = require("mongoose");
const Artisan = require("./models/Artisan");

const artisans = [
  {
    name: "Kutch Embroidery Artisans",
    location: "Bhuj, Gujarat",
    destination: "Gujarat",
    craft: "Kutch Embroidery",
    product: "Hand Embroidered Textiles",
    description:
      "Traditional embroidery from the Kutch region, known for colorful patterns and detailed handwork.",
    price: "₹500+",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Jaipur Blue Pottery Artisans",
    location: "Jaipur, Rajasthan",
    destination: "Rajasthan",
    craft: "Blue Pottery",
    product: "Handcrafted Blue Pottery",
    description:
      "Traditional Jaipur pottery known for its distinctive blue designs and decorative craftsmanship.",
    price: "₹400+",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Kutch Lac Bangle Artisans",
    location: "Kutch, Gujarat",
    destination: "Gujarat",
    craft: "Lacquer Craft",
    product: "Traditional Lac Bangles",
    description:
      "Traditional lacquer craftsmanship producing colorful handmade bangles and decorative items.",
    price: "₹200+",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Banarasi Handloom Weavers",
    location: "Varanasi, Uttar Pradesh",
    destination: "Uttar Pradesh",
    craft: "Handloom Weaving",
    product: "Banarasi Handwoven Textiles",
    description:
      "Traditional handloom weaving associated with Varanasi and its textile heritage.",
    price: "₹800+",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  },
];

async function seed() {
  try {
    // IMPORTANT:
    // Replace this with the SAME MongoDB connection string
    // already used by your server if it is stored elsewhere.
    await mongoose.connect(process.env.MONGO_URI);

    await Artisan.deleteMany({});
    await Artisan.insertMany(artisans);

    console.log("✅ Artisan data inserted successfully");
    console.log(`✅ ${artisans.length} artisan records added`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();