const Car = require('../models/car');

exports.getMyCars = async (req, res) => {
    try {
        const userId = req.user.id;
        const cars = await Car.find({ owner: userId });
        res.json(cars);
    } catch (err) {
        console.error("Error fetching user's cars:", err);
        res.status(500).json({ message: 'Error fetching your cars' });
    }
};

exports.addCar = async (req, res) => {
    const userID = req.user.id;
    const { carCompany, model, color, year, image, plate } = req.body;

    try {
        const existingCar = await Car.findOne({ plate });
        if (existingCar) {
            return res.status(400).json({ message: 'Car with this plate already exists.' });
        }

        const newCar = new Car({
            carCompany,
            model,
            color,
            year,
            image,
            plate,
            numberOfReports: 0,
            owner: userID
        });

        await newCar.save();
        res.status(201).json(newCar);

    } catch (err) {
        console.error("Error adding car:", err);
        res.status(500).json({ message: 'Server error while adding car' });
    }
};

exports.deleteCar = async (req, res) => {
    const userID = req.user.id;
    const carId = req.params.id;

    try {
        const car = await Car.findOne({ _id: carId, owner: userID });
        if (!car) {
            return res.status(404).json({ message: 'Car not found or unauthorized' });
        }

        await car.deleteOne();
        res.json({ message: 'Car deleted successfully' });

    } catch (err) {
        console.error("Error deleting car:", err);
        res.status(500).json({ message: 'Server error while deleting car' });
    }
};


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

exports.updateCar = async (req, res) => {
    const userId = req.user.id;
    const carId = req.params.id;
    const { carCompany, model, color, year, image, plate } = req.body;

    try {
        const car = await Car.findOne({ _id: carId, owner: userId });
        if (!car) {
            return res.status(404).json({ message: 'Car not found or unauthorized' });
        }

        if (carCompany !== undefined) car.carCompany = carCompany;
        if (model !== undefined) car.model = model;
        if (color !== undefined) car.color = color;
        if (year !== undefined) car.year = year;
        if (image !== undefined) car.image = image;
        if (plate !== undefined) car.plate = plate;

        await car.save();
        res.json({ message: 'Car updated successfully', car });

    } catch (err) {
        console.error('Error updating car:', err);
        res.status(500).json({ message: 'Server error while updating car' });
    }
};

