const CURRENCY = '$';
const MODE_SIZE = 'SIZE';
const MODE_BRAND = 'BRAND';
let activeIndex = 1; // храним в памяти текущую страницу товаров

window.addEventListener('load', (e)=> {
    if (location.search.trim() !== '') {
        $searchText.value = location.search.split('=')[1];
        products.filter($searchText.value);
        document.querySelector('.product-block').innerHTML = products.render();
    }
});

class Product {
    constructor(id, name = 'EXCLUSIVE', price = 'SOLD', photo = 'no-photo', currency = CURRENCY, size, color, category, type ) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.photo = photo;
        this.currency = currency;

        this.size = size;
        this.color = color;
        this.category = category;
        this.type = type;
    }

    render() {
        return `<div class="product" data-id="${this.id}">
                    <a href="single-page.html" class="photo-link">
                        <div class="photo" data-id="${this.id}">
                            <img class="photo_img" src="${this.photo}" >
                        </div>
                    </a>
                    <div class="buttons">
                        <a href="#" class="product-btn add-to-cart" data-id="${this.id}">
                            <img class="cart" src="images/cart-item.svg" alt="cart"> 
                            <span>Add to Cart</span>
                        </a>
                        <a href="#" class="product-btn small-btn">
                            <img src="images/compare.svg" alt="compare">
                        </a>
                        <a href="#" class="product-btn small-btn">
                            <img src="images/like.svg" alt="like">
                        </a>
                    </div>
                    <div class="text">
                        <div class="name">${this.name}</div>
                        <div class="price">
                            <span class="currency">${this.currency}</span> 
                            <span class="price_value">${this.price}</span>
                        </div>
                    </div>
                </div>`;
    }
}

class ProductsList {
    constructor() {
        this.products = [];
        this.filterItems = [];
        // this.minProducts = 0
        // this.maxProducts = 9;
    }

    fetchItems() {
        return sendRequest(`${API_URL}/products`).then((value) => {
            this.products = value.map(product => new Product(
                product.id, product.name, product.price, product.photo, product.currency,
                product.size, product.color, product.category, product.type
            ));
            this.filterItems = this.products;
        });
    }

    sort(sortQuerry, mode ) {
        if (mode === MODE_SIZE) {
            this.filterItems = (sortQuerry.length > 0)?  this.products.filter((item) => sortQuerry.includes(item.size)) : this.products;
        } else {
            // 
        }
      
 
        document.querySelector('.product-block').innerHTML = this.render();
    }

    filter(query) {
        const regexp = new RegExp(query, 'i');
        this.filterItems = this.products.filter((item) => regexp.test(item.name))
    }

    totalPrice() {
        return this.products.reduce((acc, item) => acc + item.price, 0);
    }

    render() {
        let i = 0;
        let pageNumber = 1;

        let resultStr = `<div class="product__page" data-page ="${pageNumber}">`;
        
        this.filterItems.forEach((product) => { 
            i++;
            resultStr += product.render();
            if (i % 9 === 0) {
                resultStr += `</div><div class="product__page hide" data-page ="${++pageNumber}">`;   
            }           
        });

        this.renderPages(pageNumber);
        return resultStr;
    }

    changePage(num) {
        let maxPage = document.querySelectorAll('.page');
        maxPage = maxPage[maxPage.length - 1].dataset.page;
        if (num > 0 && num <= maxPage) {
            const $listPages = document.querySelectorAll('.product__page');
            const $pagesNav = document.querySelectorAll('.pages-block-a');
    
            if (+num !== + activeIndex) {
                for (var i = 0; i < $listPages.length; i++ ) {
                    if (+$listPages[i].dataset.page === +activeIndex) {
                        $listPages[i].classList.add('hide');
                        $listPages[i].classList.remove("active");
                    } else if (+$listPages[i].dataset.page === +num) {
                        $listPages[i].classList.remove('hide');
                        $listPages[i].classList.add("active");
                    }
                }
        
                for (var i = 0; i < $pagesNav.length; i++ ) {
                    if (+$pagesNav[i].dataset.page === +activeIndex) {
                        $pagesNav[i].classList.remove("active");
                    } else if (+$pagesNav[i].dataset.page === +num) {
                        $pagesNav[i].classList.add("active");
                    }
                }
                activeIndex = num;
            }
        }
    }

    renderPages(max) {
            const $block = document.querySelector('.pages-block');
            let str = '<a class="pages-block-a" href="#"><i class="fas fa-angle-left"></i></a>';

            for (var i = 1; i <= max; i++) {
               str +=  `<a class ="pages-block-a page ${ i===1?' active': ''}" data-page="${i}" href="#">${i}</a>`;
            }
            
            str += '<a class="pages-block-a" href="#"><i class="fas fa-angle-right"></i></a>';
            $block.innerHTML = str;

        if (+max === 1) {
            document.querySelector('.btn-view-all').classList.add('hide');
        }
    }
}

const products = new ProductsList();
products.fetchItems().then(() => document.querySelector('.product-block').innerHTML = products.render());

// function filterItems() {
//     // products.filter($searchText.value);
//     // document.querySelector('.product-block').innerHTML = products.render();
// }

const $products = document.querySelector('.product-block');
$products.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.parentElement.classList.contains('add-to-cart') || e.target.classList.contains('add-to-cart')) {
        let $productData = e.target.parentElement.parentElement;
        if (e.target.parentElement.classList.contains('add-to-cart')) {
            $productData = $productData.parentElement;
        }
        const id = $productData.dataset.id;
        const userid = document.cookie.trim() !== '' ? document.cookie : '0';
        sendRequest(`${API_URL}/products/${id}`).then((value) =>
            cart.addProduct(new CartItem(null, value.id, userid, value.name, value.price, value.photo, value.size, value.color, value.category, value.type)
        ));

    } else if (e.target.classList.contains('photo_img' ) || e.target.classList.contains('photo')) {
        const id = e.target.classList.contains('photo')? e.target.dataset.id : e.target.parentElement.dataset.id;
        window.location.href = `${API_URL}/single-page.html?id=${id}`;
    }
});

var is_active = false;
var i = 0;
window.addEventListener('mousedown', () => is_active = true );
window.addEventListener('mouseup', () => is_active = false );

const $rangeInput = document.querySelector('.price-input');
$rangeInput.addEventListener("mousedown", (e) => {
	if (e.target.classList.contains('input-btn')) {
        e.target.classList.add("moving");
        e.target.classList.remove('waiting');

        let itemPos = e.target.style.left.replace('px','');
        i = +itemPos;
	}
});

$rangeInput.addEventListener("mouseout", () => {
    document.querySelectorAll('.input-btn').forEach((e)=> { 
        e.classList.remove("moving");
        e.classList.add('waiting'); 
    });
    is_active = false;
});

$rangeInput.addEventListener("mouseup", () => {
    document.querySelectorAll('.input-btn').forEach((e) => {
        e.classList.remove("moving");
        e.classList.add('waiting');
    });
});

var currX = 0;
const bar = document.querySelector('.input-bar');

bar.addEventListener("mousemove", (e)=> {
	if (e.target.classList.contains('input-btn') && is_active) {
	    const $moveElement = document.querySelector('.moving');
        var posX = e.clientX;
        i = (currX < posX)? i + 1.3 : i - 1.3;
        currX = posX;
        const $secondElement = document.querySelector('.waiting');
        const secondPos = $secondElement.style.left.replace('px','')

        let canMove = true;
        if  ( $moveElement.classList.contains('right') && !( +i - 1 > +secondPos )) {
            canMove = false;
        }
        if (canMove && i >= 0 && i <= 250) {
            $moveElement.style.left = i +"px"
        }
        let sortingPrice = Math.round(i) * 5;
        if ($moveElement.classList.contains('left')) {
            $moveElement.children[0].style.width = +i + 'px';
            $moveElement.children[0].style.right = +i + 'px';
        } 
        const priceFilter = document.querySelector( $moveElement.classList.contains('left')? '.price_min' : '.price_max');
        priceFilter.textContent = sortingPrice > 0? CURRENCY + sortingPrice : CURRENCY + 0; 
    }
});

const $navPanelLeftSide = document.querySelector('.left-side');
$navPanelLeftSide.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('spoiler') || e.target.parentElement.classList.contains('spoiler')) {
         const $parent = e.target.classList.contains('spoiler')? e.target.parentElement : e.target.parentElement.parentElement;
         $parent.classList.toggle('open')
    }
});

const $sizeFilters = document.querySelector('.size-filetes');
$sizeFilters.addEventListener('click', (e) => {
    const list = document.querySelectorAll('.checkbox_input');
    const filterQuerry = [];
    for (var i = 0; i< list.length; i++) {
        if(list[i].checked) {
            filterQuerry.push(list[i].value);
        }
    }
    products.sort(filterQuerry, MODE_SIZE);
});


const $pagesBlock = document.querySelector('.pages-block');
$pagesBlock.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('pages-block-a')) {
        const id = e.target.dataset.page;

        products.changePage(id);
    } else if (e.target.classList.contains('fa-angle-left') ) {
        products.changePage(activeIndex - 1);
    } else if (e.target.classList.contains('fa-angle-right') ) {
        products.changePage(activeIndex + 1);
    }

});

