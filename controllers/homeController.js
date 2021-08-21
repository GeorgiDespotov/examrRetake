const router = require('express').Router();

router.get('/', async (req, res) => {
    const houses = await req.storage.getAllHouses();

    res.render('home/home', { houses });
});

router.get('/404', async (req, res) => {
    res.render('home/404');
});

module.exports = router;