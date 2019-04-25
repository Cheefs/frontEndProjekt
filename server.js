
const DB = './db'
const express = require('express');
const fs = require('fs');
const boduParser = require('body-parser');
const app = express();

app.use(boduParser.json());
app.use(express.static('./public'));
app.listen(3000, () => console.log('========Server Started=========='));

app.get('/products', (req, res) => {
    fs.readFile(`${DB}/products.json`, 'utf-8',(err, data) => {
        if (err) {
            console.log(err)
        }
        let products = JSON.parse(data);
       
        if (Object.keys(req.query).length > 0) {
            if (req.query.id !== undefined) {
                products = products.filter((item) => +item.id === +req.query.id);
            } else if (req.query.type !== undefined) {
                products = products.filter((item) => item.type === req.query.type);
            }
        }
        res.send(products);
    });
});

app.get('/cart', (req, res) => {
    fs.readFile(`${DB}/cart.json`, 'utf-8',(err, data) => {
        if (err) {
            console.log(err)
        }
        let cart = JSON.parse(data);

        if (Object.keys(req.query).length > 0) {
            if (req.query.userid !== undefined) {
                cart = cart.filter((item) => +item.userid === +req.query.userid);
            } else if (req.query.id !== undefined) {
                products = products.filter((item) => +item.id === +req.query.id);
            }
        }
       
        res.send(cart);
    });
});

app.post('/cart', (req, res) => {
    fs.readFile(`${DB}/cart.json`, 'utf-8',(err, data) => {
        if (err) {
            console.log(err)
        }
        const cart = JSON.parse(data);
        req.body.id = cart.length + 1;
        cart.push(req.body);

        fs.writeFile(`${DB}/cart.json`, JSON.stringify(cart), (err) => {
            if (err) {
                return console.log(err);
            }
            res.send(req.body);
        });
    });
});


app.patch('/cart/:id', (req, res) => {
    fs.readFile(`${DB}/cart.json`, 'utf-8',(err, data) => {
        if (err) {
            return console.log(err)
        }
        
        let cart = JSON.parse(data);
        cart = cart.map((item) => {
            if (item.id === +req.params.id) {
                return { ...item, ...req.body };
            }
            return item;
        });
        fs.writeFile(`${DB}/cart.json`, JSON.stringify(cart), (err) => {
            if (err) {
                return console.log(err);
            }
            res.send(cart.find( (item) => item.id === +req.params.id));
        });
    });
});

app.delete('/cart/:id', (req, res) => {
    fs.readFile(`${DB}/cart.json`, 'utf-8',(err, data) => {
        if (err) {
            return console.log(err)
        }
        let cart = JSON.parse(data);

        cart = cart.filter((item) => item.id !== +req.params.id);
        fs.writeFile(`${DB}/cart.json`, JSON.stringify(cart), (err) => {
            if (err) {
                return console.log(err);
            }
            res.send(cart);
        });
    });
});

app.get('/users', (req, res) => {
    fs.readFile(`${DB}/users.json`, 'utf-8',(err, data) => {
        if (err) {
            console.log(err)
        }
        let users = JSON.parse(data);
        users = users.filter((item) => (item.username === req.query.username && item.password === req.query.password) );
        res.send(users);
    });
});

app.post('/users', (req, res) => {
    fs.readFile(`${DB}/users.json`, 'utf-8',(err, data) => {
        if (err) {
            console.log(err)
        }
        const users = JSON.parse(data);
        req.body.id = users.length + 1;
        users.push(req.body);
        fs.writeFile(`${DB}/users.json`, JSON.stringify(users), (err) => {
            if (err) {
                return console.log(err);
            }
            res.send(req.body);
        });
    });
});


  app.patch('/users/:id', (req, res) => {
    fs.readFile(`${DB}/users.json`, 'utf-8',(err, data) => {
        if (err) {
            return console.log(err)
        }
        
        let users = JSON.parse(data);
        users = users.map((item) => {
            if (item.id === +req.params.id) {
                return { ...item, ...req.body };
            }
            return item;
        });
        fs.writeFile('./db/users.json', JSON.stringify(users), (err) => {
            if (err) {
                return console.log(err);
            }
            res.send(users.find((item) => item.id === +req.params.id));
        });
    });
});


app.get('/reviews', (req, res) => {
    fs.readFile(`${DB}/reviews.json`, 'utf-8',(err, data) => {
        if (err) {
            console.log(err)
        }
        let reviews = JSON.parse(data);
        if (Object.keys(req.query).length > 0) {
            if ( req.query.status !== undefined && req.query.product_id !== undefined) {
                reviews = reviews.filter((item) => (item.status === req.query.status && item.product_id === req.query.product_id));
            }
        }
       
        res.send(reviews);
    });
});

app.post('/reviews', (req, res) => {
    fs.readFile(`${DB}/reviews.json`, 'utf-8',(err, data) => {
        if (err) {
            console.log(err)
        }
        const reviews = JSON.parse(data);
        req.body.id = reviews.length + 1;
        reviews.push(req.body);
        fs.writeFile(`${DB}/reviews.json`, JSON.stringify(reviews), (err) => {
            if (err) {
                return console.log(err);
            }
            res.send(req.body);
        });
    });
});


app.patch('/reviews/:id', (req, res) => {
    fs.readFile(`${DB}/reviews.json`, 'utf-8',(err, data) => {
        if (err) {
            return console.log(err)
        }
        
        let reviews = JSON.parse(data);
        reviews = reviews.map((item) => {
            if (item.id === +req.params.id) {
                return { ...item, ...req.body };
            }
            return item;
        });
        fs.writeFile(`${DB}/reviews.json`, JSON.stringify(reviews), (err) => {
            if (err) {
                return console.log(err);
            }
            res.send(reviews.find((item) => item.id === +req.params.id));
        });
    });
});

app.delete('/reviews/:id', (req, res) => {
    fs.readFile(`${DB}/reviews.json`, 'utf-8',(err, data) => {
        if (err) {
            return console.log(err)
        }
        let reviews = JSON.parse(data);
        reviews = reviews.filter((item) => item.id !== +req.params.id);
        fs.writeFile(`${DB}/reviews.json`, JSON.stringify(reviews), (err) => {
            if (err) {
                return console.log(err);
            }
            res.send(reviews);
        });
    });
});