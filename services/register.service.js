const express = require('express');

const Collection = require('../models/payload').Payload;
const Logging = require('../models/payload').PayloadLogging;

module.exports = () => {
    // ======
    // Routes
    // ======

    const histories = (req, res, next) => {
        const { _id } = req.params;

        Collection.findById(_id).populate('histories').exec((e, result) => {
            if (e) {
                next(e)
            } else {
                res.send(result.histories);
            }
        });
    }

    const registerFixing = async (req, res, next) => {
        const { _id } = req.params;
        const { reason } = req.body;

        let data = {
            payload: _id,
            startedAt: new Date().toISOString(),
            type: 'fixing',
            reason: reason
        }
        try {
            let payload = await Collection.findOne({ _id: _id, status: "idle" })
            if (payload == null) {
                throw new Error("This payload is not idle. Please check again");
            }
            let log = await Logging.create(data)
            Collection.updateOne({ _id: _id }, { $set: { status: 'fixing' }, $addToSet: { histories: log._id } }, (e) => {
                if (e)
                    next(e)
                else
                    res.sendStatus(200);
            });
        } catch (error) {
            next(error)
        }
    }

    const registerDrone = async (req, res, next) => {
        const { _id } = req.params;
        const { reason, droneId, configs } = req.body;

        if (droneId == null) {
            next(Error("droneId is required"));
        }

        let data = {
            payload: _id,
            startedAt: new Date().toISOString(),
            type: 'working',
            droneId: droneId,
            reason: reason
        }

        try {
            let payload = await Collection.findOne({ _id: _id, status: "idle" })
            if (payload == null) {
                throw new Error("This payload is not idle. Please check again");
            }
            let log = await Logging.create(data)
            Collection.updateOne({ _id: _id }, { $set: { status: 'working', configs: configs }, $addToSet: { histories: log._id } }, (e) => {
                if (e)
                    next(e)
                else
                    res.sendStatus(200);
            });
        } catch (error) {
            next(error)
        }
    }

    const returnPayload = async (req, res, next) => {
        const { _id } = req.params;
        const { fee } = req.body;

        if (fee == null) {
            next(Error("fee is required"));
            return;
        }

        try {
        await Logging.updateOne({payload: _id, finishedAt: null}, { $set: {finishedAt: new Date().toISOString(), fee: fee }})

        Collection.updateOne({ _id: _id }, {$set: { status: 'idle' }}, (e) => {
            if (e)
                next(e)
            else
                res.sendStatus(200);
        });
        } catch (error) {
            next(error)
        }
    }

    let router = express.Router();

    router.get('/histories/:_id', histories);
    router.post('/fix/:_id', registerFixing);
    router.post('/working/:_id', registerDrone);
    router.post('/return/:_id', returnPayload);

    return router;

}