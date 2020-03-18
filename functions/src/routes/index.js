var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
//  res.render('index', { title: 'feedback-export' });
    res.redirect(301, 'https://feedback-app-ago.web.app');
});

module.exports = router;
