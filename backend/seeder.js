const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123456',
    phone: '+1234567890',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+1234567891',
    role: 'endUser',
  },
  {
    name: 'Theater Manager',
    email: 'manager@example.com',
    password: 'manager123456',
    phone: '+1234567892',
    role: 'theaterManager',
    managedTheaters: [], // Will be populated after theaters are created
  },
];

const movies = [
  {
    title: 'Inception',
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    duration: 148,
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    releaseDate: new Date('2010-07-16'),
    director: 'Christopher Nolan',
    cast: [
      'Leonardo DiCaprio',
      'Joseph Gordon-Levitt',
      'Ellen Page',
      'Tom Hardy',
    ],
    language: 'English',
    ratingsAverage: 8.8,
    ratingsCount: 1500,
    poster: 'https://placehold.co/400x600/1f2937/9ca3af?text=Inception',
    trailer: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    isActive: true,
  },
  {
    title: 'The Dark Knight',
    description:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    duration: 152,
    genre: ['Action', 'Crime', 'Drama'],
    releaseDate: new Date('2008-07-18'),
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
    language: 'English',
    ratingsAverage: 9.0,
    ratingsCount: 2000,
    poster: 'https://placehold.co/400x600/1f2937/9ca3af?text=The+Dark+Knight',
    trailer: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    isActive: true,
  },
  {
    title: 'Interstellar',
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    duration: 169,
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    releaseDate: new Date('2014-11-07'),
    director: 'Christopher Nolan',
    cast: [
      'Matthew McConaughey',
      'Anne Hathaway',
      'Jessica Chastain',
      'Michael Caine',
    ],
    language: 'English',
    ratingsAverage: 8.6,
    ratingsCount: 1200,
    poster: 'https://placehold.co/400x600/1f2937/9ca3af?text=Interstellar',
    trailer: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    isActive: true,
  },
];

const theaters = [
  {
    name: 'Cineplex Downtown',
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.73061],
      address: '123 Main St, New York, NY 10001',
      description: 'Downtown location with easy access',
    },
    city: 'New York',
    screens: [
      {
        name: 'Screen 1',
        capacity: 150,
        seatLayout: Array(10).fill(Array(15).fill(1)), // 10 rows, 15 seats
      },
      {
        name: 'Screen 2',
        capacity: 200,
        seatLayout: Array(10).fill(Array(20).fill(1)), // 10 rows, 20 seats
      },
    ],
    facilities: ['Parking', 'Food Court', '3D', 'IMAX'],
    contact: {
      phone: '+1234567890',
      email: 'downtown@cineplex.com',
    },
  },
  {
    name: 'Multiplex Mall',
    location: {
      type: 'Point',
      coordinates: [-73.985428, 40.748817],
      address: '456 Mall Ave, New York, NY 10002',
      description: 'Inside the shopping mall',
    },
    city: 'New York',
    screens: [
      {
        name: 'Screen 1',
        capacity: 120,
        seatLayout: Array(10).fill(Array(12).fill(1)), // 10 rows, 12 seats
      },
      {
        name: 'Screen 2',
        capacity: 180,
         // *** THIS IS THE FIX: 's' is replaced with '1' ***
        seatLayout: Array(10).fill(Array(18).fill(1)), // 10 rows, 18 seats
      },
      {
        name: 'Screen 3',
        capacity: 100,
        seatLayout: Array(10).fill(Array(10).fill(1)), // 10 rows, 10 seats
      },
    ],
    facilities: ['Parking', 'Food Court', '3D', 'Dolby Atmos'],
    contact: {
      phone: '+1234567891',
      email: 'mall@multiplex.com',
    },
  },
];

// Import into DB
const importData = async () => {
  try {
    console.log('Importing data...');

    // Clear existing data (except for movies)
    // We only clear data that is fully replaced by the seeder
    await User.deleteMany();
    await Theater.deleteMany();
    await Showtime.deleteMany();
    await Booking.deleteMany();
    console.log('Cleared Users, Theaters, Showtimes, and Bookings.');

    // Import users
    const createdUsers = await User.create(users);
    console.log('Users imported successfully');

    // Import theaters
    const createdTheaters = await Theater.create(theaters);
    console.log('Theaters imported successfully');
    
    // --- MOVIE LOGIC ---
    // Add or update sample movies without deleting existing ones
    console.log('Upserting sample movies...');
    const createdMovies = [];
    for (const movieData of movies) {
      const movie = await Movie.findOneAndUpdate(
        { title: movieData.title }, // Find by unique title
        movieData,                 // Data to insert/update
        { upsert: true, new: true, runValidators: true } // Options
      );
      createdMovies.push(movie);
    }
    console.log('Sample movies upserted successfully');
    // --- END MOVIE LOGIC ---

    // Assign first theater to theater manager
    const theaterManager = createdUsers.find(user => user.role === 'theaterManager');
    if (theaterManager && createdTheaters.length > 0) {
      theaterManager.managedTheaters = [createdTheaters[0]._id];
      await theaterManager.save();
      console.log('Theater assigned to manager');
    }

    // Create sample showtimes
    const today = new Date();
    const showtimes = [];

    // Only create showtimes for the movies we just added/updated
    createdMovies.forEach((movie, index) => {
      createdTheaters.forEach((theater) => {
        theater.screens.forEach((screen, screenIndex) => {
          // Create 3 showtimes per screen
          for (let i = 0; i < 3; i++) {
            const startTime = new Date(today);
            startTime.setDate(today.getDate() + i); // Showings for today, tomorrow, day after
            startTime.setHours(10 + screenIndex * 3 + i * 2, 0, 0, 0);

            const endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + movie.duration);

            showtimes.push({
              movie: movie._id,
              theater: theater._id,
              screen: screen.name,
              startTime,
              endTime,
              price: 150 + index * 20, // Base price 150, 170, 190
              availableSeats: screen.capacity,
              totalSeats: screen.capacity, 
            });
          }
        });
      });
    });

    await Showtime.create(showtimes);
    console.log('Showtimes imported successfully');

    console.log('\n✅ Data imported/updated successfully!');
    console.log('\nSample credentials:');
    console.log('Admin - Email: admin@example.com, Password: admin123456');
    console.log('End User - Email: john@example.com, Password: password123');
    console.log('Theater Manager - Email: manager@example.com, Password: manager123456');

    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    console.log('Deleting data...');
    // Keep Movie.deleteMany() here so you can still clear your DB if you want
    await User.deleteMany();
    await Movie.deleteMany();
    await Theater.deleteMany();
    await Showtime.deleteMany();
    await Booking.deleteMany();

    console.log('✅ Data deleted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Run based on command line argument
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import data or -d to delete data');
  process.exit();
}