const GENDER_MAN = 'man';
const GENDER_WOMAN = 'woman';
const API_URL = 'http://localhost:3000';

isGuest(); // проверяем гость ли пользователь
const $browse = document.querySelector('.browse-container');

$browse.addEventListener('click', (e) => {
    document.querySelector('.browse-items').classList.toggle('hide');
    e.preventDefault();
});
const $searchText = document.querySelector('.search-text');
const $searchButton = document.querySelector('.search-button');

$searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'product.html?name=' + $searchText.value;
});

function sendRequest(url) {
    return fetch(url).then((response) => response.json());
}

class Review {
    constructor(id, username, comment, date, status) {
        this.id = id;
        this.username = username;
        this.comment = comment;
        this.date = date;
        this.status = status;
    }

    render() {
         return ` <div class="comment" data-id="${this.id}">
                    <div class="comment__autor">${this.username} AT &nbsp; ${this.date} <span class='review_status'>${this.status === 'moderate' ? 'moderate' : 'new'} </span></div>
                    <div class="comment__text">${this.comment}</div>
                    <div class="helper ${this.status}"></div>
                </div>`;
    }

    add() {
        const comment = document.querySelector('.comment__input').value;
        const id = document.querySelector('.product-btn').dataset.id;
        const userId = document.cookie === null? 0 : document.cookie;
        let dateTime = new Date();
        dateTime = dateTime.toISOString().split('.')[0].replace(/[a-zA-Z]/g,' ');
    
      return  sendRequest(`${API_URL}/users?id=${userId}`).then((value) => {
            const username = value.length > 0? value[0].username : 'guest';
            fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({ product_id: id, username: username, comment: comment, datetime: dateTime, status: 'new' }),
            });
        });
    }
}

class Cart {
    constructor(currency = "$") {
        this.currency = currency;
        this.products = [];
    }

    fetchItems() {
        const userid = document.cookie.trim() !== '' ? document.cookie : '0';
        return sendRequest(`${API_URL}/cart?userid=${userid}`).then((value) => {
            this.products = value.map(product => new CartItem (product.id,  product.product_id, product.userid, 
                   product.name, product.price,  product.photo, product.size, product.color,product.category, product.type,product.count, product.currency
                )
            );
        });
    }

    render() {
        const itemsHtmls = this.products.map(product => product.render());
        this.getCartPrice();
        this.getCartCount();
        
        return itemsHtmls.join('');
    }

    addProduct(product) {
        const userid = document.cookie.trim() !== '' ? document.cookie : '0';
        const idx = this.products.findIndex((e) => +e.product_id === +product.product_id);
        if (idx !== -1) {
            this.products[idx].count++;
            sendRequest(`${API_URL}/cart?userid=${userid}&product_id=${+product.product_id}`).
            then((value) => {
                value.find((item) => { 
                    if (+item.product_id === +product.product_id) {
                        fetch(`${API_URL}/cart/${item.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                                body: JSON.stringify({ count: this.products[idx].count }),
                        });
                    }
                }); 
            })

        } else {
            fetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...product}),
            }).then((response) => response.json()).then((item) => {
                const cartItem = new CartItem(item.id, item.product_id, item.userid, item.name, item.price, item.photo, item.count, item.currency);
                this.products.push(cartItem);
            });

        }
        showHelpModal();
        this.reload();
    }

    removeItem(id) {
        const idx = this.products.findIndex((e) => +e.id === +id);
        if (this.products[idx].count > 1) {
            this.products[idx].count --;
                    fetch(`${API_URL}/cart/${id}`, { method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ count: this.products[idx].count }),
                    });
        } else {
            fetch(`${API_URL}/cart/${id}`, { method: 'DELETE' });
            this.products = this.products.filter((e) => +e.id !== +id);
        }
        this.reload();
    }

    reload() {
        document.querySelector('.cart__container').innerHTML = this.render();
    }
    
    getCartCount() {
        const $cartCount = document.querySelector('.cart-items-total');
        $cartCount.textContent = this.products.reduce((acc, item) => acc + item.count, 0);
    }

    getCartPrice() {
       const $priceBlock = document.querySelector('.cart-total__price');
       $priceBlock.textContent = this.currency + this.products.reduce((acc, item) => acc + item.count * item.price, 0);;
    }
}

class CartItem {
    constructor (id, product_id, userid, name, price, photo, size, color, category, type, count = 1, currency = "$") {
        this.id = id;
        this.product_id = product_id;
        this.userid = userid;

        this.name = name;
        this.price = price;
        this.photo = photo;

        this.size = size;
        this.color = color;
        this.category = category;
        this.type = type;
        this.count = count;
        this.currency = currency;
    }

    render () {
        return  `<a href="single-page.html" class="in-cart-item" data-id ="${this.id}">
                    <div class="cart__photo"> 
                        <img class="item-photo" src="${this.photo}" data-product="${this.product_id}">
                    </div>
                </div>
                <div class="item-container">
                    <div class="item-info">
                        <h2>${this.name}</h2>
                        <span>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </span>
                        <h3>${this.count} x ${this.currency}${this.price}</h3>
                    </div>
                    <div class="btn-remove-item">
                        <i class="fas fa-times-circle btn_remove" data-id ="${this.id}"></i>
                    </div>
                </div>
            </a>`;
    }
}

const cart = new Cart();
cart.fetchItems().then(() => document.querySelector('.cart__container').innerHTML = cart.render());

const $cartItems = document.querySelector('.cart__container');
$cartItems.addEventListener('click', e => {
    e.preventDefault();
    if (e.target.classList.contains('btn_remove')) {
        cart.removeItem(e.target.getAttribute('data-id'));
    } else if (e.target.classList.contains('item-photo')) {
        const id = e.target.dataset.product;
        window.location.href = `${API_URL}/single-page.html?id=${id}`;
    }
});

const $cart = document.querySelector('.cart__button');
$cart.addEventListener('click', e => {
    const $cartItems = document.querySelector('.cart-items');
    e.preventDefault();
    $cartItems.classList.toggle('active');
});

const $modal = document.getElementById('modalWindow');

$modal.addEventListener('click', e => {
    if (e.target.classList.contains('register_link')) {
        document.querySelector('.modal_login').classList.add('hide');
        document.querySelector('.modal_register').classList.remove('hide')
    } else if (e.target.classList.contains('input_checkbox')) {
        if (e.target.classList.contains('man')) {
            document.getElementById('genderWoman').checked = false;
        } else {
            document.getElementById('genderMan').checked = false;
        }
    } else if (e.target.classList.contains('btn_register')) {
        doValidateRegisterForm();
    } else if (e.target.classList.contains('btn-login')) {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login({username: username, password: password});
    }
});

const $modalDialog = $modal.querySelector('.modal-content'); 

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('close') || e.target.classList.contains('btn_confirm') ) {
        modalClose()
    } else if (e.target.classList.contains('modal')) {
        modalClose();
    } else if (e.target.classList.contains('my-account-btn')) {
        if (e.target.classList.contains('lk')) {
            window.location.href = `${API_URL}/account.html`
        } else {
            modalShow($modalDialog, $modal);
        }  
    }
});

function showHelpModal(message = null) {
    if (message !== null) {
        document.querySelector('.info_text').textContent =  message;
    }
    const $modal = document.getElementById('modalHelp');
    const $modalDialog = $modal.querySelector('.modal-content');
    modalShow($modalDialog, $modal);
}

function modalShow($dialog, $modal) {
    $dialog.classList.remove('modal_close');
    $dialog.classList.add('modal_open');
    $modal.classList.remove('hide');
}

function modalClose() {
    let $node = document.getElementsByClassName('modal-content');
    for (var i = 0; i < $node.length; i++) {
        if (!$node[i].parentElement.classList.contains('hide')) {
            setTimeout(() => $node[i].parentElement.classList.add('hide'), 500);
            $node[i].classList.add('modal_close');
            $node[i].classList.remove('modal_open');
            break;
        }
    }
    const $help = document.querySelector('.help-block');
    $help.textContent = "";
    document.querySelector('.modal_login').classList.remove('hide');
    document.querySelector('.modal_register').classList.add('hide');

   setTimeout((e) => { window.location.reload(false);  },500);
}

function doValidateRegisterForm() {
    const validation = {
        'username': /\w+/,
        'password': /\w+/,
        'email': /^[a-zA-Zа-яА-Я0-9]+?.[a-zA-Zа-яА-Я0-9]+\@[a-zA-Zа-яА-Я0-9]+\.[a-zA-Zа-яА-Я]{2,3}$/,
        'card': /\d{13,19}/,
        'bio': /[a-zA-Zа-яА-Я0-9]+/
    };

    const required = [
        'username', 'password', 'email'
    ];

    const newUser = [];
    let hasErors = false;

    Object.keys(validation).forEach(rule => {
        const fields = document.querySelectorAll('[data-rule="'+rule+'"]');
        fields.forEach(field => {
            if (validation[rule].test(field.value)) {
                newUser[rule] = field.value;
                field.classList.remove('invalid');
            } else {
                if (field.value.trim() === required.includes(rule)) {
                    hasErors = true;
                    field.classList.add('invalid');
                }
            }
        });
    });
    if (!hasErors) {
        createAccount(newUser);
    }
}

const $creditCartInput = document.getElementById('credit-cartRegister');
$creditCartInput.addEventListener('keyup', e => {
    e.target.value = e.target.value.replace(/\D/g, "");
});

function createAccount(array) {
    var $textinputs = document.querySelectorAll('input[type=checkbox]');
    let gender = null;

    [].filter.call($textinputs, (e) => {
        if (e.checked){
            gender = e.value;
        }
    });
    array['gender'] = gender;
    array['role'] = "user";
    fetch(`${API_URL}/users/`, { method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...array }),
    }).then(() =>  login({username: array['username'], password: array['password']}) );

    modalClose();
    showHelpModal('регистрация прошла успешно');
}

const $btnLogOut = document.querySelector('.btn-logout');
$btnLogOut.addEventListener('click', (e) => {
    e.preventDefault();
    logOut();
});

function logOut() {
    document.cookie ='';
    location.reload(false);
}

function isGuest() {
    const $myAccount = document.querySelector('.my-account-btn');
    const $logOut = document.querySelector('.btn-logout');
    if (document.cookie.trim() !== '') {
        $myAccount.textContent = 'My Account';
        $myAccount.classList.add('lk');
        $logOut.classList.remove('hide');

    } else {
        if (window.location.href.match('account') !== null ) {
            window.location.href = 'index.html';
        }
        $myAccount.textContent = 'Login';
        $myAccount.classList.remove('lk');
        $logOut.classList.add('hide');
    }
}

function login(loginData) {
    sendRequest(`${API_URL}/users`).then((data) => {
        const user = data.find((user) => {
            if (loginData.username === user.username && loginData.password === user.password) {
                document.cookie = `${user.id}`;
                return user;
            }
        }); 
        if (user === undefined) {
            const $help = document.querySelector('.help-block');
            $help.textContent = 'Invalid User Name Or Password';
        } else {
            location.reload(false);
        }
    });
}