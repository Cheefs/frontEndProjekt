const GENDER_MAN = 'man';
const GENDER_WOMAN = 'woman';
const API_URL = 'http://localhost:3000';

const LOGIN_MODE_AUTO = 'auto';
const LOGIN_MODE_USER = 'user';

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

class Modal {
    showHelpModal(message = null) {
        if (message !== null) {
            document.querySelector('.info_text').textContent =  message;
        }
        const $modal = document.getElementById('modalHelp');
        const $modalDialog = $modal.querySelector('.modal-content');
        this.modalShow($modalDialog, $modal);
    }
    
    modalShow($dialog, $modal) {
        $dialog.classList.remove('modal_close');
        $dialog.classList.add('modal_open');
        $modal.classList.remove('hide');
    }
    
    modalClose(reload = false) {
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
    
        if (reload) {
            setTimeout((e) => { window.location.reload(false);  },500);
        }
    }
}

const modal = new Modal();
class Cart {
    constructor(currency = "$") {
        this.currency = currency;
        this.products = [];
    }

    fetchItems() {
        const userId = loginUser.getId();
        return sendRequest(`${API_URL}/cart?userid=${userId}`).then((value) => {
           return this.products = value.map(product => new CartItem (product.id,  product.product_id, product.userid, 
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
        const userId = loginUser.getId();
        const idx = this.products.findIndex((e) => +e.product_id === +product.product_id);
        if (idx !== -1) {
            let count  = this.products[idx].count < product.count? product.count : this.products[idx].count;
            count++;
                if (+this.products[idx].product_id === +product.product_id 
                    && product.size === this.products[idx].size && product.color === this.products[idx].color) {
                    sendRequest(`${API_URL}/cart?userid=${userId}`).then((value) => {

                        const item = value.find((item) => (+item.product_id === +product.product_id && +item.userid === +userId) );
                        fetch(`${API_URL}/cart/${item.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ count: count }),
                        });
                    });
                    
                } 
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
        modal.showHelpModal();
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
        $cartCount.textContent = this.products.reduce((acc, item) => acc + +item.count, 0);
    }

    getCartPrice() {
       const $priceBlock = document.querySelector('.cart-total__price');
       $priceBlock.textContent = this.currency + this.products.reduce((acc, item) => acc + item.count * item.price, 0);;
    }
}
const cart = new Cart();

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

class LoginUser {
    constructor() {
       this.user = {};
       this.required = ['username', 'password', 'email'];
       this.validation = {
            'username': /\w+/,
            'password': /\w+/,
            'email': /^[a-zA-Zа-яА-Я0-9]+?.[a-zA-Zа-яА-Я0-9]+\@[a-zA-Zа-яА-Я0-9]+\.[a-zA-Zа-яА-Я]{2,3}$/,
            'card': /\d{13,19}/,
            'bio': /[a-zA-Zа-яА-Я0-9]+/
        };
    }

    login(loginMode, inputUsername = null, inputPassword = null) {
        let username = inputUsername;
        let password = inputPassword;

        if (username === null && password === null && document.cookie.trim() !== '') {
            const data = document.cookie.split(';');
            data.find((e) => { 
                if (e.match(/username=/)) {
                    username = e.split('username=')[1];
                } else if (e.match(/password=/)) {
                    password = e.split('password=')[1];
                }
            });
        }
        if (username !== '' && password !== '') {
            const $myAccount = document.querySelector('.my-account-btn');
            const $logOut = document.querySelector('.btn-logout');

            return sendRequest(`${API_URL}/users?username=${username}&password=${password}`)
            .then((user) => {
                if (user[0] !== undefined) {
                    this.user = user[0];
                    document.cookie = `username=${user[0].username}`;
                    document.cookie = `password=${user[0].password}`;
                    $myAccount.textContent = 'My Account';
                    $myAccount.classList.add('lk');
                    $logOut.classList.remove('hide');
                    modal.modalClose();
                } else {
                    if (window.location.href.match('account') !== null) {
                        window.location.href = 'index.html';
                    }
                    $myAccount.textContent = 'Login';
                    $myAccount.classList.remove('lk');
                    $logOut.classList.add('hide');
                    if (loginMode === LOGIN_MODE_USER) {
                        const $help = document.querySelector('.help-block');
                        $help.textContent = 'Invalid User Name Or Password';
                    }
                }

                this.cartRender(); // загружаем данные корзины для пользователя
                return  this.user;
            });
        
        } else {
            if (window.location.href.match(/account/)) {
                window.location.href = `${API_URL}/index.html`;
            }
            this.cartRender(); // загружаем данные корзины для гостя
        }   
    }

    getId() {
        return ((this.user !== "undefined" && this.user.id !== undefined )? this.user.id : 0 );
    }

    logOut() {
        const cookies = document.cookie.split(';');
        cookies.forEach((e) => { 
           let cookieKey = e.split('=')[0].trim();
            document.cookie = `${cookieKey}=`+'';
        });

        this.user.id = 0;
        location.reload(false);
    }

    cartRender() {
        if (window.location.href.match(/cart.html/)) {
            cartPage.fetchItems().then(() => $cartContainer.innerHTML = cartPage.render());
        }
        cart.fetchItems().then(() => document.querySelector('.cart__container').innerHTML = cart.render());
    }

    renderMyAccount(obj) {
        obj.fetch().then(() => obj.render());
    }

    doValidateRegisterForm() {
        let hasErors = false;
        Object.keys(this.validation).forEach(rule => {
            const fields = document.querySelectorAll('[data-rule="'+rule+'"]');
            fields.forEach(field => {
                if (this.validation[rule].test(field.value)) {
                    this.user[rule] = field.value;
                    field.classList.remove('invalid');
                } else {
                    if (field.value.trim() === this.required.includes(rule)) {
                        hasErors = true;
                        field.classList.add('invalid');
                    }
                }
            });
        });
        if (!hasErors) {
            this.createAccount();
        }
    }
    
    createAccount() {
        var $textinputs = document.querySelectorAll('input[type=checkbox]');
        let gender = null;
        [].filter.call($textinputs, (e) => {
            if (e.checked) {
                gender = e.value;
            }
        });
        this.user.gender = gender;
        this.user.role = "user";
        fetch(`${API_URL}/users`, { method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...this.user }),
        }).then(() => 
            loginUser.login(LOGIN_MODE_USER, this.user.username, this.user.password) 
        );
        modal.modalClose(true);
        modal.showHelpModal('регистрация прошла успешно');
    }
}

const loginUser = new LoginUser();

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
        const id = document.querySelector('.single_product').dataset.id;
        let dateTime = new Date();
        dateTime = dateTime.toISOString().split('.')[0].replace(/[a-zA-Z]/g,' ');
    
        const username = loginUser.user.username !== undefined ? loginUser.user.username : 'guest' ;
        return  fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({ product_id: id, username: username, comment: comment, datetime: dateTime, status: 'new' }),
        });
    }
}

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
        loginUser.doValidateRegisterForm();
    } else if (e.target.classList.contains('btn-login')) {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        loginUser.login(LOGIN_MODE_USER, username, password);
    }
});

const $modalDialog = $modal.querySelector('.modal-content'); 

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('close') || e.target.classList.contains('btn_confirm') ) {
        modal.modalClose(true)
    } else if (e.target.classList.contains('modal')) {
        modal.modalClose(true);
    } else if (e.target.classList.contains('my-account-btn')) {
        if (e.target.classList.contains('lk')) {
            window.location.href = `${API_URL}/account.html`
        } else {
            modal.modalShow($modalDialog, $modal);
        }  
    }
});


const $creditCartInput = document.getElementById('credit-cartRegister');
$creditCartInput.addEventListener('keyup', e => {
    e.target.value = e.target.value.replace(/\D/g, "");
});

const $btnLogOut = document.querySelector('.btn-logout');
$btnLogOut.addEventListener('click', (e) => {
    e.preventDefault();
    loginUser.logOut();
});

const $navigation = document.querySelector('.navigation');
$navigation.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('menu-link')) {
        if (e.target.textContent.toUpperCase() === 'HOME') {
            window.location.href = `index.html`;
        } else {
            window.location.href = `product.html?type=${e.target.textContent}`;
        }
    }
});

const $btnSubscribe = document.querySelector('.btn-subscribe');

$btnSubscribe.addEventListener('click', (e) => {
    const rule = /^[a-zA-Zа-яА-Я0-9]+?.[a-zA-Zа-яА-Я0-9]+\@[a-zA-Zа-яА-Я0-9]+\.[a-zA-Zа-яА-Я]{2,3}$/;
    const $subscriberEmail = document.querySelector('.email-form-input');
    const $container = document.querySelector('.subcribe-form')

    let $errorBlock = document.querySelector('.subscribe__error');

    if (rule.test($subscriberEmail.value)) {
        $subscriberEmail.classList.remove('has_error');
        if  ($errorBlock !== null && $errorBlock !== undefined && !$errorBlock.classList.contains('hide')) {
            $errorBlock.classList.add('hide');
        }

        fetch(`${API_URL}/subscribers`, { method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: $subscriberEmail.value }),
        });

        modal.showHelpModal('you have subscribed!');

    } else {
        $subscriberEmail.classList.add('has_error');
       if ($errorBlock === undefined || $errorBlock === null) {
            const $err = document.createElement('p');
            $err.classList.add('subscribe__error');
            $err.textContent = 'wrong email address';
            $container.append($err)
       } else {
            $errorBlock.classList.remove('hide');
           
       }

     
     
    }

});