class CartPage {
    constructor(currency = "$") {
        this.currency = currency;
        this.products = [];
    }

    fetchItems() {
        const userId = loginUser.getId();
        return sendRequest(`${API_URL}/cart?userid=${userId}`).then((value) => {
            this.products = value.map(product =>
                new Item( product.id, product.name, product.price, product.photo, product.count, product.currency, product.size, product.color));
        });
    }

    render() {
        console.log(this.products)
        const itemsHtmls = this.products.map(product => product.render() );
        this.getCartPrice();
        this.getCartCount();

        return itemsHtmls.join('');
    }

    changeCount(id, value) {
        const idx = this.products.findIndex((e) => +e.id === +id);
        const count = this.products[idx].count;
        if (!isNaN(value) && count !== value && value > 0)  {
            this.products[idx].count = +value;
            fetch(`/cart/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({count: value }),
            });
        }
        this.reload();
    }

    deleteItem(id = null) {
        if (id !== null) {
           const idx = this.products.findIndex((e) => +e.id === +id);
           let count = this.products[idx].count;
            if (count > 1) {
                fetch(`/cart/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({count: --count }),
                });
                this.products[idx].count = count;
            } else {
                fetch(`/cart/${id}`, {method: 'DELETE'});
                this.products = this.products.filter((e) => +e.id !== +id);
            }
        } else {
            this.products.forEach((e) => {
                fetch(`/cart/${+e.id}`, {method: 'DELETE'});
            });
            this.products = [];
        }
        this.reload();
    }

    reload() {
        document.getElementById('cartContainer').innerHTML = this.render();
        cart.fetchItems().then(() => document.querySelector('.cart__container').innerHTML = cart.render());
    }

    getCartCount() {
        return this.products.reduce((acc, item) => acc + +item.count, 0);
    }

    getCartPrice() {
        const $sub = document.querySelector('.subtotal_price');
        const $grand = document.querySelector('.grandtotal_price');
        const total = this.products.reduce((acc, item) => acc + item.price * item.count, 0);

        $grand.textContent = this.currency + total; 
        $sub.textContent = this.currency + total; 
    }
}

class Item {
    constructor (id, name, price, photo, count = 1, currency = '$', size, color, shipping = 'FREE') {
        this.id = id;
        this.name = name;
        this.price = price;
        this.photo = photo;
        this.count = count;
        this.currency = currency;
        this.size = size;
        this.color = color;
        this.shipping = shipping;
    }
    render () {
        return  `<div class="table-row">
                    <div class="product-details">
                        <a href="single-page.html" class="photo-link">
                            <div class="photo"">
                                <img class="photo_img" src="${this.photo}" alt="photo">
                            </div>
                        </a>
                       <div class="product-desc">
                           <h3>${this.name}</h3>
                           <h4>Color:<span>${this.color}</span></h4>
                           <h4>Size:<span>${this.size}</span></h4>
                       </div>
                    </div>
                    <div class="buing-info">
                        <div class="buing-info-div">${this.currency} ${this.price}</div>
                        <div class="buing-info-div" data-id="${this.id}">
                            <input class="buing-info-input" type="number" min="1" value="${this.count}">
                        </div>
                        <div class="buing-info-div">${this.shipping}</div>
                        <div class="buing-info-div">${this.currency} ${this.getTotalPrice()} </div>
                        <div class="buing-info-div ">
                            <i class="fas fa-times-circle btn_delete_one" data-id="${this.id}"></i>
                        </div>
                    </div>
                </div>`;
    }

    getTotalPrice() {
        return this.count * this.price;
    }
}
const cartPage = new CartPage();
const $cartContainer = document.getElementById('cartContainer');
const $btnClearCart = document.querySelector('.btn-delete-all');

window.addEventListener('load', (e)=> {
    loginUser.login(LOGIN_MODE_AUTO); // обьект login User инициализируется в общем скрипте main.js
});

$btnClearCart.addEventListener('click', (e) => {
    showHelpModal('All products has removed from cart');
    cartPage.deleteItem();
});

$cartContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn_delete_one')) {
        const id = e.target.dataset.id;
        if (!isNaN(id)) {
            cartPage.deleteItem(id);
        }
    } 
});

$cartContainer.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('buing-info-input')) {
        const id = e.target.parentElement.dataset.id;
        cartPage.changeCount(id, e.target.value);
    }
});


