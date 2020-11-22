const express = require('express');

const Logging = require('../models/payload').PayloadLogging;

module.exports = () => {
    // ======
    // Routes
    // ======

    const statFeeFixing = (req, res, next) => {
        const {from, to, payload} = req.query
        let predict = {}
        if (from && to) {
            predict.startedAt = { $gte: from, $lte: to }
        } else if (from) {
            predict.startedAt = { $gte: from }
        } else if (to) {
            predict.startedAt = { $lte: to }
        }

        let query = { type: 'fixing' }
        if (payload) {
            query.payload = payload
        }

        Logging.find(query).populate('payload', { _id: 1, code: 1, name: 1})
        .exec((e, result) => {
            if (e) {
                next(e)
            } else {
                res.send(result)
            }
        })
    }

    const statFeeWorking = (req, res, next) => {
        const {from, to, payload} = req.query
        let predict = {}
        if (from && to) {
            predict.startedAt = { $gte: from, $lte: to }
        } else if (from) {
            predict.startedAt = { $gte: from }
        } else if (to) {
            predict.startedAt = { $lte: to }
        }

        let query = { type: 'working' }
        if (payload) {
            query.payload = payload
        }

        Logging.find(query).populate('payload', { _id: 1, code: 1, name: 1})
        .exec((e, result) => {
            if (e) {
                next(e)
            } else {
                res.send(result)
            }
        })
    }

    let router = express.Router();

    router.get('/feeFixing', statFeeFixing);
    router.get('/feeWorking', statFeeWorking);

    return router;

}