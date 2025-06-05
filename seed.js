require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Book = require('./models/Book');
const User = require('./models/User');
const Review = require('./models/Review');

// Generate random book data
const generateBooks = (count) => {
    const genres = [
        'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 
        'Mystery', 'Romance', 'Thriller', 'Biography', 'History',
        'Science', 'Technology', 'Philosophy', 'Poetry', 'Drama'
    ];

    return Array.from({ length: count }, () => ({
        title: faker.lorem.words(3),
        author: faker.person.fullName(),
        genre: faker.helpers.arrayElement(genres),
        description: faker.lorem.paragraphs(2)
    }));
};

// Generate random user data
const generateUsers = (count) => {
    return Array.from({ length: count }, () => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123' // Will be hashed by the User model
    }));
};

// Generate random review data
const generateReviews = (books, users) => {
    const reviews = [];
    const usedCombinations = new Set(); // Track used book-user combinations
    
    books.forEach(book => {
        // Get a random number of unique users to review this book
        const numReviews = faker.number.int({ min: 1, max: Math.min(3, users.length) });
        
        // Get available users who haven't reviewed this book yet
        const availableUsers = users.filter(user => 
            !usedCombinations.has(`${book._id}-${user._id}`)
        );
        
        // Randomly select users for this book's reviews
        const selectedUsers = faker.helpers.arrayElements(
            availableUsers,
            Math.min(numReviews, availableUsers.length)
        );
        
        // Create reviews for selected users
        selectedUsers.forEach(user => {
            reviews.push({
                book: book._id,
                user: user._id,
                rating: faker.number.int({ min: 1, max: 5 }),
                comment: faker.lorem.paragraph()
            });
            usedCombinations.add(`${book._id}-${user._id}`);
        });
    });

    return reviews;
};

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Book.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const users = await User.create(generateUsers(5));
        console.log('Created users');

        // Create books
        const books = await Book.insertMany(
            generateBooks(20).map(book => ({
                ...book,
                createdBy: faker.helpers.arrayElement(users)._id
            }))
        );
        console.log('Created books');

        // Create reviews
        const reviews = await Review.insertMany(generateReviews(books, users));
        console.log('Created reviews');

        // Print some statistics
        console.log('\nDatabase seeded successfully!');
        console.log('------------------------');
        console.log(`Total Users: ${users.length}`);
        console.log(`Total Books: ${books.length}`);
        console.log(`Total Reviews: ${reviews.length}`);
        console.log('------------------------\n');

        // Print sample data for testing
        console.log('Sample User Credentials:');
        console.log('------------------------');
        users.forEach(user => {
            console.log(`Email: ${user.email}`);
            console.log(`Password: password123`);
            console.log('------------------------');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 