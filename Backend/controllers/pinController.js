const Pin = require('../models/pin.model');
const User = require('../models/user.model');
const geolib = require('geolib');

const resize = require('./imageController').resize;

exports.get = async (req, res) => {
    const pins = await Pin.find();
    await res.json(pins);
};

/**
 * Creates a pin with the given request (title, gps coordinates, hours valid, private, picture)
 * The arguments private and picture are optional!
 * If hours valid is outside of the range (1-12) it is set to 1
 * The picture will be resized @see controllers.imageController#resize()
 *
 * @param req (title, gps coordinates, hours valid, private, picture)
 * @param res pin ID
 * @returns {Promise<void>}
 */
exports.create = async (req, res) => {
    if (!req.body || !req.body.title || !req.body.lat || !req.body.lng || !req.body.hoursValid) {
        res.status(400).send();
        return;
    }
    req.body.hoursValid = parseInt(req.body.hoursValid);
    if (req.body.hoursValid < 1 || 12 < req.body.hoursValid)
        req.body.hoursValid = 1;

    let now = new Date();
    now.setHours(now.getHours() + req.body.hoursValid);

    let pin = new Pin(
        {
            title: req.body.title,
            location:
                {
                    lat: parseFloat(req.body.lat),
                    lng: parseFloat(req.body.lng),
                },
            imgPath: req.file ? req.file.filename : '',
            description: req.body.description,
            commentBox: [],
            host: req.body.host,
            private: req.body.private === "true",
            expire_at: now
        }
    );

    // Resizes the received file to an appropriate size
    if (req.file)
        resize(req.file.path);

    await pin.save( (err, pin) => {
        res.send(pin._id);
    });
};

exports.getPin = async (req, res) => {
    let pin = await Pin.findById(req.params.id);
    const userList = await User.find({}, {_id: 0, name: 1, email: 1, color: 1});

    pin.commentBox.map(elem => {
        elem.commenter = JSON.stringify(userList.find(user => user.email === elem.commenter));
    });

    await res.json(pin);
};

/**
 * Checks for every pin in the database whether it is within the desired radius and also if those pins are
 * allowed to be seen, if their private property is set
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getPinsNear = async (req, res) => {
    const pins = await Pin.find();
    const userLat = req.params.latitude;
    const userLng = req.params.longitude;
    const radius = req.params.radius;
    const userName = req.params.userName;

    let pinsNear = await Promise.resolve(pins.reduce( async (previousPromise, elem) => {
        let pinArray = await previousPromise;
        if (geolib.isPointWithinRadius(
            {
                latitude: elem.location.lat,
                longitude: elem.location.lng
            },
            {
                latitude: userLat,
                longitude: userLng,
            }, radius)
            &&
            (!elem.private || await checkIfPinVisible(elem.host, userName))) {
                pinArray.push({
                    pinId: elem._id,
                    latitude: elem.location.lat,
                    longitude: elem.location.lng,
                    host: elem.host,
                });
        }
        return pinArray;
    }, Promise.resolve([])));
    await res.json(pinsNear);
};

exports.addComment = async (req, res) => {
    const filter = {_id: req.body.id};
    const update = {
        commenter: req.body.commentBox[0].commenter,
        comment: req.body.commentBox[0].comment
    };

    try {
        let pin = await Pin.findOneAndUpdate(filter, {$push: {commentBox: update}});
        res.send(pin)
    } catch (error) {
        res.error(error);
    }
};

exports.getComments = async (req, res) => {
    let pin = await Pin.findById(req.params.id);
    const userList = await User.find({}, {_id: 0, name: 1, email: 1, color: 1});

    pin.commentBox.map(elem => {
        elem.commenter = JSON.stringify(userList.find(user => user.email === elem.commenter));
    });

    await res.json(pin)
};

checkIfPinVisible = async (hostName, userName) => {
    try {
        let host = await User.findOne({name: hostName});
        let buddies = host.friends;
        return hostName === userName || buddies.filter((elem) => elem === userName).length !== 0;
    } catch (error) {
        console.log("checkIfPinVisible ERROR: " + error);
        return false;
    }
};