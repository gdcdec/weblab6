import userModel from "../database/model/userModel.js";

const createUser = async (req, res, next) => {
    try {
        const { name, email } = req.body
        if (!name || !email) {
            return res.status(400).json({ message: "name and email required" })
        }

        // Check whether user already exists
        const isUserExists = await userModel.findOne({ where: { email } });
        if(isUserExists) {
            return res.status(400).json({ message: "user already exists" })
        }

        // Create user if it not exists yet
        const newUser = await userModel.create({ name, email, createdAt: new Date() });
        return res.status(201).json(newUser)
    } catch (err) {
        next(err);
    }
}

const getUsers = async (req, res, next) => {
    try {
        const users = await userModel.findAll()
        return res.status(200).json(users)
    } catch (err) {
        next(err)
    }
}

export { getUsers, createUser }
