const express = require('express');

const Collection = require('../models/payload').Payload;
const Logging = require('../models/payload').PayloadLogging;

module.exports = () => {
    // ======
    // Routes
    // ======

    const histories = (req, res, next) => {
        const { _id } = req.params;

        Collection.findById(_id).populate({ path: 'histories', populate: ['payload', 'sdCardId']})
            .exec((e, result) => {
            if (e) {
                next(e)
            } else {
                res.send(result.histories);
            }
        });
    }

    const allHistories = (req, res, next) => {

        // Collection.find({}).populate({ path: 'histories', populate: ['payload', 'sdCardId']}).exec((e, result) => {
        //     if (e) {
        //         next(e)
        //     } else {
        //         res.send(result.map( (item) => item.histories))
        //     }
        // });
        Logging.find({}).populate(['payload', 'sdCardId']).exec((e, results) => {
            if (e) {
                next(e)
            } else {
                res.send(results);
            }
        })
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

    const registerCharging = async (req, res, next) => {
        const { _id } = req.params;

        let data = {
            payload: _id,
            startedAt: new Date().toISOString(),
            type: 'charging',
            reason: ''
        }
        try {
            let payload = await Collection.findOne({ _id: _id, status: "idle" })
            if (payload == null) {
                throw new Error("This payload is not idle. Please check again");
            }
            let log = await Logging.create(data)
            Collection.updateOne({ _id: _id }, { $set: { status: 'charging' }, $addToSet: { histories: log._id } }, (e) => {
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
        const { reason, droneId, sdCardId, configs } = req.body;

        if (droneId == null) {
            next(new Error("droneId is required"));
        }
        if (sdCardId == null) {
            next(new Error("sdCardId is required"));
        }

        let data = {
            payload: _id,
            startedAt: new Date().toISOString(),
            type: 'working',
            droneId: droneId,
            sdCardId: sdCardId,
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
        let payload = await Collection.findOne({ _id: _id, status: 'idle'})
        if (payload) {
            throw new Error("This payload is idling");
        }
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

    const chargeDone = async (req, res, next) => {
        const { _id } = req.params;

        try {
        let payload = await Collection.findOne({ _id: _id, status: 'charging'})
        if (!payload) {
            throw new Error("This payload is not charging");
        }
        await Logging.updateOne({payload: _id, finishedAt: null}, { $set: {finishedAt: new Date().toISOString(), fee: 0 }})
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

    router.get('/allHistories', allHistories);
    router.get('/histories/:_id', histories);
    router.post('/fix/:_id', registerFixing);
    router.post('/working/:_id', registerDrone);
    router.post('/return/:_id', returnPayload);
    router.post('/charge/:_id', registerCharging);
    router.post('/chargeDone/:_id', chargeDone);

    return router;

}