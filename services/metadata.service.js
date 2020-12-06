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

    const randomDayDien = () => {
        let km = Math.floor(Math.random() * 200);

        return `Dây điện, km số ${km}`;
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
            next(new Error("This payload is not working. Please try later"));
            return;
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

    const getImage = async (req, res, next) => {
        const { _id } = req.params;
        const { project_type } = req.query;
        
        let payload = await Collection.findOne({_id: _id, status: "working"})
        if (!payload) {
            next(new Error("This payload is not working. Please try later"));
            return;
        }

        var arr = []
        var min = 1, max = 1;
        var id = ''
        switch (project_type) {
            case 'DE_DIEU':
                max = 0
                break;
            case 'CAY_TRONG':
                max = 77;
                id = 'v1607244077/cay-trong/cay-trong'
                break;
            case 'CHAY_RUNG':
                max = 110;
                id = 'v1607243994/chay-rung/chay-rung'
                break;
            default:
                max = 104
                id = 'v1606833551/luoi-dien/day-dien'
        }

        for (var i = min; i <= max; i++) {
            var url = `https://res.cloudinary.com/webtt20191/image/upload/${id}-${i}.jpg`
            var objective = randomDayDien()

            let data = {
                image: url,
                object: objective,
                config: {
                    panning: Math.floor(Math.random() * 341),
                    tilting: Math.floor(Math.random() * 111),
                    zoom: Math.floor(Math.random() * 11),
                    autoTracking: Boolean(Math.floor(Math.random() * 101) % 2),
                    shotInterval: Math.floor(Math.random() * 11) * 1000
                }
            }
            arr.push(data)
        }

        res.json(arr)
    }

    let router = express.Router();
    
    router.get('/metadata/:_id', getMetadata);
    router.get('/image/:_id', getImage)

    return router;
}