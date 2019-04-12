const API_URL = 'http://localhost:3000';

function sendRequest(url) {
    return fetch(url).then((response) => response.json());
}

class Cart {
    constructor(currency = "$") {
        this.currency = currency;
        this.products = [];
    }

    fetchItems() {
        const username = document.cookie.trim() !== '' ? document.cookie : 'guestUser';

        return sendRequest(`${API_URL}/cart?username=${username}`).then((value) => {
            this.products = value.map(product => {

          
                console.log(product);
               return new CartItem(product.id, product.product_id, product.username, product.name, product.price, product.photo, product.count, product.currency);
            })
        });
    }

    render() {
        const itemsHtmls = this.products.map(product => product.render());
        this.getCartPrice();
        this.getCartCount();
        
        return itemsHtmls.join('');
    }

    addProduct(product) {
        console.log(product)
        const username = document.cookie.trim() !== '' ? document.cookie : 'guestUser';
        const promice = new Promise((resolve, reject) => {
            let isExists = false;
         
            for (var i = 0; i < this.products.length; i++) {

                if (+this.products[i].id === +product.id) {
                    this.products[i].count++;
                    isExists = true;
                   let usersProducts = sendRequest(`${API_URL}/cart?username=${username}&product_id=${+product.id}`);
                    usersProducts = usersProducts.find((item) => item.product_id === +product.id);
                    console.log(usersProducts)

                    // fetch(`${API_URL}/cart?username=${username}&id=${+product.id}`, {
                    //     method: 'GET',
                    //     headers: {
                    //       'Content-Type': 'application/json',
                    //     },
                    //     body: JSON.stringify({ count: this.products[i].count }),
                    //   });
                    // resolve();
                    // break;
                } 
            }
            
            if (!isExists) {
                fetch(`${API_URL}/cart`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                   
                    body: JSON.stringify({username: username, product_id: +product.product_id, name: product.name, photo: product.photo, price: product.price }),
                  }).then((response) => response.json()).then((item) => {
                            const cartItem = new CartItem(item.id, item.product_id, item.username, item.name, item.price, item.photo, item.count, item.currency)
                            this.products.push(cartItem);
                            resolve();
                  }
                );
            }
        });
        promice.then(() => { 
            showHelpModal();
            this.reload();
        });
    }

    removeItem(id) {
        let $items = document.getElementsByClassName('in-cart-item');
        for (var i = 0; i < $items.length; i++) {
            if (+this.products[i].id === +id) {
               if (this.products[i].count > 1) {
                    this.products[i].count --;
                    fetch(`${API_URL}/cart/${id}`, { method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ count: this.products[i].count }),
                    });
               } else {
                   fetch(`${API_URL}/cart/${id}`, { method: 'DELETE' });
                   this.products.splice(i, 1);
                   $items[i].remove();
               }
            }
        }
        this.reload();
    }

    reload() {
        document.querySelector('.cart__container').innerHTML = this.render();
    }
    
    getCartCount() {
        const $cartCount = document.querySelector('.cart-items-total');
        let total = 0;
        this.products.forEach(e => {
            total += +e.count;
        });
        $cartCount.textContent = total;
    }

    getCartPrice() {
        let price = 0;
        const $priceBlock = document.querySelector('.cart-total__price');
        this.products.forEach(e => {
            if (!isNaN(+e.price)) {
                price += +e.price * e.count;
            }
        });
       $priceBlock.textContent = this.currency + price;
    }
}

class CartItem {
    constructor (id, product_id, username, name, price, photo, count = 1, currency = '$') {
        this.id = id;
        this.product_id = product_id;
        this.username = username;
        this.name = name;
        this.price = price;
        this.photo = photo;
        this.count = count;
        this.currency = currency;
    }

    render () {
        return  `<a href="single-page.html" class="in-cart-item" data-id ="${this.id}">
                    <div class="cart__photo"> 
                        <img class="item-photo" src="${this.photo}">
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

const $btnRemove = document.querySelector('.cart__container');
$btnRemove.addEventListener('click', e => {
    e.preventDefault();
    if (e.target.classList.contains('btn_remove')) {
        cart.removeItem(e.target.getAttribute('data-id'));
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
    } else if (e.target === $modal) {
        modalClose();
    } else if (e.target.classList.contains('my-account-btn')) {
        if (e.target.classList.contains('lk')) {
            window.location.href = `${API_URL}/account`
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

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('close') || e.target.classList.contains('btn_confirm') ) {
            modalClose()
        }
        if (e.target === $modal) {
            modalClose($modalDialog, $modal);
        }
    });
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
    document.querySelector('.modal_register').classList.add('hide')
}

function doValidateRegisterForm() {
    const validation = {
        'username': /\d|\s|[^a-zA-Zа-яА-Я]/,
        'password': /\w/,
        'email': /^[a-zA-Zа-яА-Я0-9]+?.[a-zA-Zа-яА-Я0-9]+\@[a-zA-Zа-яА-Я0-9]+\.[a-zA-Zа-яА-Я]{2,3}$/,
        'card': /\d{13,19}/,
        'bio': /[a-zA-Zа-яА-Я0-9]+/,
    };

    const newUser = [];
    let hasErors = false;

    Object.keys(validation).forEach(rule => {
        const fields = document.querySelectorAll('[data-rule="'+rule+'"]');
        fields.forEach( field => {
            if (validation[rule].test(field.value)) {
                newUser[rule] = field.value;
                field.classList.remove('invalid');
            } else  {
                hasErors = true;
                console.log(field);
                field.classList.add('invalid');
            }
        });
    });
    const $creditCartInput = document.getElementById('credit-cartRegister');
    $creditCartInput.addEventListener('keyup', e => {
        e.target.value = e.target.value.replace(/\D/g, "");
    });
    if (!hasErors) {
        createAccount(newUser);

        /// login
    }

}


function createAccount(array) {
    var $textinputs = document.querySelectorAll('input[type=checkbox]');
    let gender = null;

    [].filter.call($textinputs, e => {
        if (e.checked){
            gender = e.value
        }
    });
    array['gender'] = gender;

    fetch(`${API_URL}/users/`, { method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...array }),
    });

    modalClose();
    showHelpModal('регистрация прошла успешно');
}

function login(loginData) {
    sendRequest(`${API_URL}/users`).then((data) => {
        const user = data.find((user) => {
            if (loginData.username === user.username && loginData.password === user.password) {
                document.cookie = `${user.username}`;
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

const $btnLogOut = document.querySelector('.btn-logout');
$btnLogOut.addEventListener('click', (e) => {
    e.preventDefault();
    logOut();
});

function logOut() {
    document.cookie ='';
    location.reload(false)
}
isGuest();

function isGuest() {
    const $myAccount = document.querySelector('.my-account-btn');
    const $logOut = document.querySelector('.btn-logout');
    if (document.cookie.trim() !== '') {
        $myAccount.textContent = 'My Account';
        $myAccount.classList.add('lk');
        $logOut.classList.remove('hide');

    } else {
        $myAccount.textContent = 'Login';
        $myAccount.classList.remove('lk');
        $logOut.classList.add('hide');
    }
}