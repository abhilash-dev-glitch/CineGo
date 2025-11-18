/**
 * Migration Script: Expand existing multi-day shows into individual daily records
 * Run this once to fix existing shows in the database
 * 
 * Usage: node backend/migrate-existing-shows.js
 */

const mongoose = require('mongoose');
const Showtime = require('./models/Showtime');
const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
require('dotenv').config();

const migrateShows = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Find all shows that have endDate but are single records
    const showsToMigrate = await Showtime.find({
      endDate: { $exists: true },
    }).populate('movie theater');

    console.log(`📊 Found ${showsToMigrate.length} shows to check`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const show of showsToMigrate) {
      const startDate = new Date(show.startTime);
      const endDate = new Date(show.endDate);
      
      // Skip if endDate is same as or before startTime
      if (endDate <= startDate) {
        skippedCount++;
        continue;
      }

      // Check if this show has already been expanded
      const existingShows = await Showtime.countDocuments({
        movie: show.movie._id,
        theater: show.theater._id,
        screen: show.screen,
        startTime: {
          $gte: new Date(startDate.setHours(0, 0, 0, 0)),
          $lte: new Date(endDate.setHours(23, 59, 59, 999))
        }
      });

      // If multiple shows already exist, skip
      if (existingShows > 1) {
        console.log(`⏭️  Skipping ${show.movie.title} - already expanded`);
        skippedCount++;
        continue;
      }

      // Generate daily shows
      const showtimesToCreate = [];
      let currentDate = new Date(show.startTime);
      currentDate.setHours(0, 0, 0, 0);
      
      const endDateOnly = new Date(show.endDate);
      endDateOnly.setHours(23, 59, 59, 999);
      
      const originalStartTime = new Date(show.startTime);
      const originalEndTime = new Date(show.endTime);
      
      let dayCount = 0;
      const maxDays = 90;

      while (currentDate <= endDateOnly && dayCount < maxDays) {
        // Skip the first day if it's the original show
        if (dayCount > 0) {
          const dayShowStart = new Date(currentDate);
          dayShowStart.setHours(originalStartTime.getHours(), originalStartTime.getMinutes(), 0, 0);
          
          const dayShowEnd = new Date(currentDate);
          dayShowEnd.setHours(originalEndTime.getHours(), originalEndTime.getMinutes(), 0, 0);
          
          showtimesToCreate.push({
            movie: show.movie._id,
            theater: show.theater._id,
            screen: show.screen,
            startTime: dayShowStart,
            endTime: dayShowEnd,
            endDate: dayShowEnd, // Set endDate same as endTime for single-day shows
            price: show.price,
            availableSeats: show.totalSeats || show.availableSeats,
            totalSeats: show.totalSeats || show.availableSeats,
            isActive: show.isActive,
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
        dayCount++;
      }

      if (showtimesToCreate.length > 0) {
        await Showtime.insertMany(showtimesToCreate);
        console.log(`✅ Migrated ${show.movie.title}: Created ${showtimesToCreate.length} additional shows`);
        migratedCount += showtimesToCreate.length;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Created ${migratedCount} new show records`);
    console.log(`   ⏭️  Skipped ${skippedCount} shows`);
    console.log('\n✨ Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
};

// Run migration
migrateShows();
