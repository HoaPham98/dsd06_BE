const express = require('express');

const Collection = require('../models/payload').Payload;

const dedieuObjects = ["Đê Sông Hồng, km"]

module.exports = () => {

    const randomDeDieu = () => {
        let km = Math.floor(Math.random() * 101);

        return `Đê Sông Hồng, km ${km}`;
    }

    const randomDien = () => {
        let km = Math.floor(Math.random() * 101);

        return `Cột điện số ${km}`;
    }

    const randomRung = () => {
        let km = Math.floor(Math.random() * 101);

        return `Khu vực rừng số ${km}`;
    }

    const randomCayTrong = () => {
        let items = ["Chè", "Dâu tây", "Nho", "Hoa tulip"];
        var item = items[Math.floor(Math.random() * items.length)];

        return `Khu trồng ${item}`;
    }
 
    const getMetadata = async (req, res, next) => {
        const { _id } = req.params;
        const { project_type } = req.query;
        // 'DE_DIEU', 'CAY_TRONG', 'CHAY_RUNG', 'LUOI_DIEN'
        var objective = ""
        switch (project_type) {
            case 'DE_DIEU':
                objective = randomDeDieu();
                break;
            case 'CAY_TRONG':
                objective = randomCayTrong();
                break;
            case 'CHAY_RUNG':
                objective = randomRung();
                break;
            default:
                objective = randomDien();
        }
        let payload = await Collection.findOne({_id: _id, status: "working"})
        if (!payload) {
            throw new Error("This payload is not working. Please try later")
        }

        res.json({
            object: objective,
            config: {
                panning: Math.floor(Math.random() * 341),
                tilting: Math.floor(Math.random() * 111),
                zoom: Math.floor(Math.random() * 11),
                autoTracking: Boolean(Math.floor(Math.random() * 101) % 2),
                shotInterval: Math.floor(Math.random() * 11) * 1000
            }
        })
    }

    let router = express.Router();
    
    router.get('/:_id', getMetadata);

    return router;
}