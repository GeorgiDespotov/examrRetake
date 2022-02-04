const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { isUser } = require('../middlewears/guards');

router.get('/create', isUser(), (req, res) => {
    res.render('house/create');
});

router.get('/apartForRent', async (req, res) => {
    try {

        const houses = await req.storage.getAllHouses();
        res.render('house/apartForRent', { houses });

    } catch (err) {
        console.log(err.message);
        res.render('home/404');
    }
});

router.post('/create', isUser(),
    body('name')
        .notEmpty().withMessage('Name is required!').bail()
        .isLength({ min: 6 }).withMessage('Name musb be atleast 6 ch long!'),
    body('type')
        .notEmpty().withMessage('Type is required!').bail(),
    body('year')
        .notEmpty().withMessage('Year is required!').bail()
        .isFloat({ min: 1850, max: 2021 }).withMessage('The year mist be betweene 1850 and 2021!'),
    body('city')
        .notEmpty().withMessage('City is required!').bail()
        .isLength({ min: 4 }).withMessage('City must be atleast 4 ch long!'),
    body('imageUrl')
        .notEmpty().withMessage('Image URL is required!').bail()
        .matches('https?:\/\/').withMessage('invalid URL!'),
    body('description')
        .notEmpty().withMessage('Desc is required!').bail()
        .isLength({ max: 60 }).withMessage('Desc max length is 60 ch!'),
    body('pieces')
        .notEmpty().withMessage('Pieces is required!').bail()
        .isFloat({ min: 0, max: 10 }).withMessage('Pieces must be between 0 and 10!'),

    async (req, res) => {
        const { errors } = validationResult(req);

        try {

            req.body.owner = req.user._id;
            req.body.year = Number(req.body.year);

            if (errors.length > 0) {
                throw new Error(errors.map(e => e.msg).join('\n'));
            }
            await req.storage.createHouse(req.body);
            res.redirect('/house/apartForRent');

        } catch (err) {
            console.log(err.message);
            const ctx = {
                errors: err.message.split('\n'),
                house: {
                    name: req.body.name,
                    type: req.body.type,
                    year: Number(req.body.year),
                    city: req.body.city,
                    imageUrl: req.body.imageUrl,
                    description: req.body.description,
                    pieces: req.body.pieces
                }
            }
            res.render('house/create', ctx);
        }
    });

router.get('/details/:id', async (req, res) => {
    try {
        const house = await req.storage.getOneHouse(req.params.id);
        if (req.user) {
            house.loggedUser = req.user._id;
            house.isOwner = req.user._id == house.owner;
            house.hasRented = house.users.find(u => u._id == req.user._id);
            house.noRoom = house.pieces <= 0 ? true : false;
            house.freeRooms = house.pieces > 0 ? true : false;

            house.renters = house.users.map(u => u.name).join(', ');

            // if (!house.noRoom) {

            //     house.renters = house.users.map(u => u.name).join(', ');
            //     console.log('--------');
            // }

        }

        res.render('house/details', { house });
    } catch (err) {
        console.log(err);
        res.render('home/404');
    }
});

router.get('/rent/:id', isUser(), async (req, res) => {
    try {
        const house = await req.storage.getOneHouse(req.params.id);
        house.renters = house.users.map(u => u.name).join(', ');

        const alreadyJoined = house.users.find(u => u._id == req.user._id);
        req.body.pieces = Number(req.body.pieces);
        if (req.user._id == house.owner) {

            throw new Error('You can\'t rent a house you offered!');
        }

        if (house.pieces <= 0) {
            throw new Error('There are no available room!');
        }

        if (alreadyJoined) {
            throw new Error('You can\'t rent twice to the offer!');
        }

        await req.storage.rent(req.user._id, req.params.id);
        res.redirect(`/house/details/${req.params.id}`);
    } catch (err) {
        console.log(err.message);
        res.render('home/404');
    }
});

router.get('/edit/:id', isUser(), async (req, res) => {
    try {
        const house = await req.storage.getOneHouse(req.params.id);

        if (req.user._id != house.owner) {
            throw new Error('Only the owner can edit this offer!');
        }

        res.render('house/edit', { house });
    } catch (err) {
        console.log(err.message);
        res.redirect(`/house/details/${req.params.id}`);
    }

});

router.post('/edit/:id', isUser(),
    body('name')
        .notEmpty().withMessage('Name is required!').bail()
        .isLength({ min: 6 }).withMessage('Name musb be atleast 6 ch long!'),
    body('type')
        .notEmpty().withMessage('Type is required!').bail(),
    body('year')
        .notEmpty().withMessage('Year is required!').bail()
        .isFloat({ min: 1850, max: 2021 }).withMessage('The year mist be betweene 1850 and 2021!'),
    body('city')
        .notEmpty().withMessage('City is required!').bail()
        .isLength({ min: 4 }).withMessage('City must be atleast 4 ch long!'),
    body('imageUrl')
        .notEmpty().withMessage('Image URL is required!').bail()
        .matches('https?:\/\/').withMessage('invalid URL!'),
    body('description')
        .notEmpty().withMessage('Desc is required!').bail()
        .isLength({ max: 60 }).withMessage('Desc max length is 60 ch!'),
    body('pieces')
        .notEmpty().withMessage('Pieces is required!').bail()
        .isFloat({ min: 0, max: 10 }).withMessage('Pieces must be between 0 and 10!'),

    async (req, res) => {
        const { errors } = validationResult(req);
        try {
            const house = await req.storage.getOneHouse(req.params.id);

            if (req.user._id != house.owner) {
                throw new Error('Only the owner can edit this offer!');
            }


            await req.storage.editHouse(req.params.id, req.body);
            res.redirect(`/house/details/${req.params.id}`);

        } catch (err) {
            console.log(err.message);
            const ctx = {
                errors: err.message.split('\n'),
                house: {
                    _id: req.params.id,
                    name: req.body.name,
                    type: req.body.type,
                    year: Number(req.body.year),
                    city: req.body.city,
                    imageUrl: req.body.imageUrl,
                    description: req.body.description,
                    pieces: req.body.pieces
                }
            }
            res.render('house/edit', ctx);
        }
    });

router.get('/delete/:id', isUser(), async (req, res) => {
    try {
        const house = await req.storage.getOneHouse(req.params.id);

        if (req.user._id != house.owner) {
            throw new Error('Only the aouthor can delete this play!');
        }
       
            await req.storage.deleteH(req.params.id);
        
        res.redirect('/');
    } catch (err) {
        console.log(err.message);
        res.render(`home/404`);
    }
});

router.get('/search', isUser(), async (req, res) => {
    try {
        console.log(req.query, '---');

        const searchedHouses = await req.storage.findHouses(req.query);
        // const ctx = {
        //     search: req.query.search || '',
        //     searchedHouses
        // }
        res.render('house/search', { searchedHouses });


    } catch (err) {
        console.log(err.message);
        res.render('home/404');
    }
});


module.exports = router;