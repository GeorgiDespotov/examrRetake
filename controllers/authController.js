const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { isGuest } = require('../middlewears/guards');


router.get('/register', isGuest(), (req, res) => {
    res.render('user/register');
});

router.post('/register',
    isGuest(),
    body('name')
        
        .notEmpty().withMessage('Nmae is required!').bail()
        .matches('^[A-Za-z]+ [a-zA-Z]+$').withMessage('Name must be first name and last name!'),
    body('username')
        
        .notEmpty().withMessage('Username is required!').bail()
        .isLength({ min: 5 }).withMessage('Ussername must be at least 3 ch long!').bail(),
    body('password')
        
        .notEmpty().withMessage('Password is required!').bail()
        .isLength({ men: 4 }).withMessage('Password must be min 4 symbols long!'),
    body('rePass').custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error('password don\'t match!')
        }
        return true
    }),
    async (req, res) => {
        const { errors } = validationResult(req);
        try {
            console.log(errors);
            if (errors.length > 0) {
                // TODO impruve err message
                throw new Error(Object.values(errors).map(e => e.msg).join('\n'));

            }

            await req.auth.register(req.body.name, req.body.username, req.body.password);
            res.redirect('/'); //TODO change redirect location 
        } catch (err) {
            console.log(err);
            const ctx = {
                errors: err.message.split('\n'),
                user: {
                    name: req.body.name,
                    username: req.body.username
                }
            }
            res.render('user/register', ctx)
        }
    });

router.get('/login', isGuest(), (req, res) => {
    res.render('user/login');
});

router.post('/login', isGuest(), async (req, res) => {
    try {
        await req.auth.login(req.body.username, req.body.password);
        res.redirect('/'); //TODO change redirect location 
        
    } catch (err) {
        console.log(err);
        if (err.type == 'credential') {
            errors = ['incorect username or password!']
        }
        const ctx = {
            errors,
            user: {
                username: req.body.username
            }
        };
        res.render('user/login', ctx);
    }
});

router.get('/logout', (req, res) => {
    req.auth.logout();
    res.redirect('/');
});

module.exports = router;
