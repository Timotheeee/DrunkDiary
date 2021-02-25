const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

const DEFAULT_COLOR = '#dd2c00';
const NOT_FOUND_CODE = 404;
const UNAUTHORIZED_CODE = 401;
const BAD_REQUEST_CODE = 400;
const SALT_ROUNDS = 13;
const ONE_WEEK_IN_SECS = 60 * 60 * 24 * 7;

exports.addBuddy = async (req, res) => {
    await buddyHandler(req, res, handleAdd)
};

exports.removeBuddy = async (req, res) => {
    await buddyHandler(req, res, handleRemove)
};

exports.login = async (req, res) => {
    try {
        let foundUser;
        if (req.body.email !== undefined) {
            foundUser = await User.findOne({email: req.body.email.toLocaleLowerCase().trim()})
        }
        else if (req.body.name !== undefined) {
            foundUser = await User.findOne({name: req.body.name})
        }
        if (undefined === foundUser || null === foundUser) {
            res.status(NOT_FOUND_CODE).send();
        } else {
            let payload;
            let password = await bcrypt.hash(req.body.password, foundUser.salt);
            if (foundUser.password === password) {
                setDefaultColorIfUnset(foundUser);
                let friends = [];
                for (const friend of foundUser.friends) {
                    let buddy = await User.findOne({name: friend});
                    if (null !== buddy && undefined !== buddy) {
                        setDefaultColorIfUnset(buddy);
                        friends.push({"name": buddy.name, "color": buddy.color});
                    }
                }
                payload = {
                    email: foundUser.email,
                    name: foundUser.name,
                    birthdate: foundUser.birthdate,
                    color: foundUser.color,
                    friends: friends
                };
            } else {
                res.status(UNAUTHORIZED_CODE).send();
            }
            const token = jwt.sign(payload, secret, {
                algorithm: 'HS256',
                expiresIn: ONE_WEEK_IN_SECS
            });
            res.cookie('token', token, {maxAge: ONE_WEEK_IN_SECS * 1000});
            payload.token = token;
            await res.json(payload);
            res.send();
        }
    } catch (error) {
        console.error(error);
        res.error(error);
    }
};

/**
 * Registers a user with their details:
 * name, email, birthdate, salt, password, color, friends
 *
 * @param req
 * @param res
 * @returns {Promise<Socket|*|Namespace|void>}
 */
exports.register = async (req, res) => {
    if (await User.findOne({email: req.body.email}) || await User.findOne({name: req.body.name,})) {
        return res.status(BAD_REQUEST_CODE).send("User already exists");
    }
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    let password = await bcrypt.hash(req.body.password, salt);
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        birthdate: req.body.birthdate,
        salt: salt,
        password: password,
        color: DEFAULT_COLOR,
        friends: []
    });

    await user.save().then(() => console.log("User created"));

    res.send("User created \n");
};

exports.update = async (req, res) => {
    let update = {};
    const filter = {email: req.body.email};

    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            const password = await bcrypt.hash(req.body.password, salt);
            update = {
                salt: salt,
                password: password,
                color: req.body.color,
            };
        } else {
            update = {
                color: req.body.color,
            };
        }
    } catch (error) {
        console.log("Something is wrong with the update information " + error);
    }

    const options = {returnNewDocument: true};

    try {
        let user = await User.findOneAndUpdate(filter, update, options);
        res.send(user)
    } catch (error) {
        res.send(error);
    }
};

exports.get = async (req, res) => {
    const users = await User.find();
    await res.json(users);
};

exports.getUserByMail = async (req, res) => {
    let user = await User.findOne({email: req.params.email});
    await res.json(user);
};

/**
 * The function in the parameter will be executed IF:
 * - user is not undefined
 * - user exists in the DB
 *
 * @param req
 * @param res
 * @param func function
 * @returns {Promise<void>}
 */
async function buddyHandler(req, res, func) {
    try {
        let foundUser;
        const buddy = req.body.buddy;
        const userEmail = req.body.user.toLocaleLowerCase().trim();

        if (req.body.user !== undefined) foundUser = await User.findOne({email: userEmail});
        if (undefined === foundUser || null === foundUser) {
            res.status(NOT_FOUND_CODE).send();
        } else if (buddy !== undefined) {
            await func(foundUser, buddy);
            res.send('User updated.');
        }
    } catch (error) {
        console.error(error);
    }
}

async function handleRemove(foundUser, buddyToRemove) {
    const index = foundUser.friends.indexOf(buddyToRemove);
    if (index > -1) {
        foundUser.friends.splice(index, 1);
        foundUser.save();
    }

}

async function handleAdd(foundUser, buddyToAdd) {
    if (foundUser.friends.indexOf(buddyToAdd) === -1) {
        foundUser.friends.push(buddyToAdd);
        foundUser.save();
    }
}

function setDefaultColorIfUnset(user) {
    if (undefined === user.color) {
        user.color = DEFAULT_COLOR;
        user.save();
    }
}
