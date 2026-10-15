const express = require("express");
const mongoose = require("mongoose");
const Trip = require("../models/trip");

const router = express.Router();

// GET: Fetch all trips
router.get("/", async (req, res, next) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    next(error);
  }
});

// GET: Fetch one trip by ID
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    res.json({
      success: true,
      trip,
    });
  } catch (error) {
    next(error);
  }
});

// POST: Create a new trip
router.post("/", async (req, res, next) => {
  try {
    const {
      destination,
      country,
      startDate,
      endDate,
      budget,
      image,
      notes,
    } = req.body;

    if (
      typeof destination !== "string" ||
      !destination.trim() ||
      !startDate ||
      !endDate ||
      budget === "" ||
      budget === null ||
      budget === undefined ||
      !Number.isFinite(Number(budget)) ||
      Number(budget) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Destination, dates, and a valid budget are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide valid trip dates. End date cannot be before start date.",
      });
    }

    const trip = await Trip.create({
      destination: destination.trim(),
      country: typeof country === "string" ? country.trim() : "",
      startDate: start,
      endDate: end,
      budget: Number(budget),
      image: typeof image === "string" ? image.trim() : "",
      notes: typeof notes === "string" ? notes.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Trip created successfully.",
      trip,
    });
  } catch (error) {
    next(error);
  }
});

// PUT: Update a trip by ID
router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    const allowedFields = [
      "destination",
      "country",
      "startDate",
      "endDate",
      "budget",
      "image",
      "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    if (
      updates.destination !== undefined &&
      (typeof updates.destination !== "string" ||
        !updates.destination.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Destination cannot be empty.",
      });
    }

    if (updates.budget !== undefined) {
      if (
        updates.budget === "" ||
        updates.budget === null ||
        !Number.isFinite(Number(updates.budget)) ||
        Number(updates.budget) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Budget must be a valid non-negative number.",
        });
      }

      updates.budget = Number(updates.budget);
    }

    if (updates.destination !== undefined) {
      updates.destination = updates.destination.trim();
    }

    if (updates.country !== undefined) {
      updates.country = String(updates.country).trim();
    }

    if (updates.image !== undefined) {
      updates.image = String(updates.image).trim();
    }

    if (updates.notes !== undefined) {
      updates.notes = String(updates.notes).trim();
    }

    for (const field of ["startDate", "endDate"]) {
      if (updates[field] !== undefined) {
        const parsedDate = new Date(updates[field]);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`,
          });
        }

        updates[field] = parsedDate;
      }
    }

    const existingTrip = await Trip.findById(req.params.id);

    if (!existingTrip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const finalStart = updates.startDate ?? existingTrip.startDate;
    const finalEnd = updates.endDate ?? existingTrip.endDate;

    if (finalEnd < finalStart) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Trip updated successfully.",
      trip,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Delete a trip by ID
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    const trip = await Trip.findByIdAndDelete(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    res.json({
      success: true,
      message: "Trip deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;