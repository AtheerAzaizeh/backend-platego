const Car = require('../models/car');

// מביא את כל הרכבים של משתמש לפי userID
exports.getCars = async (req, res) => {
    const userID = req.user.id;

    try {
        const cars = await Car.find({ userID });
        res.json(cars);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching cars' });
    }
};

// הוספת רכב חדש למשתמש
exports.addCar = async (req, res) => {
    const userID = req.user.id;
    const { carCompany, model, color, year, image, plate, numberOfReports } = req.body;

    try {
        const newCar = new Car({
            carCompany,
            model,
            color,
            year,
            image,
            plate,
            numberOfReports,
            userID
        });

        await newCar.save();
        res.json(newCar);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding car' });
    }
};

// מחיקת רכב לפי carID + userID
exports.deleteCar = async (req, res) => {
    const carID = req.params.id;
    const userID = req.user.id;

    try {
        const deleted = await Car.findOneAndDelete({ _id: carID, userID });
        if (!deleted) {
            return res.status(404).json({ message: 'Car not found' });
        }

        res.json({ message: 'Car deleted successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting car' });
    }
};

// חיפוש רכב לפי לוחית רישוי
exports.findCarByPlate = async (req, res) => {
    const plate = req.params.plate;

    try {
        const car = await Car.findOne({ plate });

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        res.json(car);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching car details' });
    }
};

// חיפוש רכב לפי מזהה
exports.findCarById = async (req, res) => {
    const carID = req.params.id;

    try {
        const car = await Car.findById(carID);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        res.json(car);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching car by ID' });
    }
};

// מונה רכבים של משתמש
exports.countUserCars = async (req, res) => {
    const userID = req.user.id;

    try {
        const count = await Car.countDocuments({ userID });
        res.json({ count });
    } catch (err) {
        console.error('Error counting user cars:', err);
        res.status(500).json({ message: 'Error counting user cars' });
    }
};
