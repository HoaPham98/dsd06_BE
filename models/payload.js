const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const PayloadSchema = new Schema({
    id: ObjectId,
    code: {type: String, required: true },
    name: { type: String, required: true },
    detail: {
        manufacturer: { type: String, required: true },
        size: {
            width: {type: Number, required: true},
            height: {type: Number, required: true},
            length: {type: Number, required: true}
        },
        weight: {type: Number, required: true},
        opticalZoom: Number,
        digitalZoom: Number,
        panning: {
            min: {type: Number, required: true},
            max: {type: Number, required: true},
        },
        tilting: {
            min: {type: Number, required: true},
            max: {type: Number, required: true},
        },
        zoom: {
            min: {type: Number, required: true},
            max: {type: Number, required: true},
        }
    },
    type: {type: ObjectId, ref: 'PayloadType', required: true },
    status: { type: String, enum: ['working', 'idle', 'fixing', 'charging'], required: true },
    histories: [{type: ObjectId, ref: 'PayloadLogging', required: true}],
    configs: [{
        startTime: {type: String, required: true},
        endTime: {type: String, required: true},
        object: {type: String, required: true},
        config: {
            panning: {type: Number, required: true },
            tilting: {type: Number, required: true },
            zoom: {type: Number, required: true },
            autoTracking: {type: Boolean, required: true },
            shotInterval: Number
        }
    }]
});

const PayloadTypeSchema = new Schema({
    id: ObjectId,
    name: { type: String, required: true },
    description: { type: String, required: true }
});

const PayloadLoggingSchema = new Schema({
    id: ObjectId,
    payload: {type: ObjectId, ref: 'Payload', required: true},
    startedAt: Date,
    finishedAt: Date,
    type: { type: String, enum: ['working', 'idle', 'fixing', 'charging'], required: true },
    reason: String,
    droneId: String,
    sdCardId: {type: ObjectId, ref: 'SDCard'},
    fee: Number
});

const SDCardSchema = new Schema({
    id: ObjectId,
    name: {type: String, required: true},
    volume: {type: Number, required: true}
})

module.exports = {
    Payload: mongoose.model('Payload', PayloadSchema, 'Payload'),
    PayloadType: mongoose.model('PayloadType', PayloadTypeSchema, 'PayloadType'),
    PayloadLogging: mongoose.model('PayloadLogging', PayloadLoggingSchema, 'PayloadLogging'),
    SDCard: mongoose.model('SDCard', SDCardSchema, 'SDCard')
}