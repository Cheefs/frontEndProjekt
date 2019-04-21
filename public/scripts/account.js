class User {
    constructor(id, username, password, gender, email, card, bio, role) {
        this.id = id;
        this.username = username; 
        this.password = password;
        this.gender = gender;
        this.email = email;
        this.card = card;
        this.bio = bio;
        this.role = role;
    }

  render() {
    return`<form class="login-form">
                <div class="input-block edit-data">
                    <label class="label input-block-label" for="usernameEdit" >USERNAME</label>
                    <input value="${this.username}" class="input-block-input" data-rule-modify="username" type="text" id="usernameEdit" >
                </div>
                <div class="input-block edit-data">
                    <label class="label input-block-label" for="passwordEdit">NEW PASSWORD</label>
                    <input class="input-block-input" data-rule-modify="password" type="password" id="passwordEdit">
                </div>

                <div class="input-block edit-data">
                    <label class="label input-block-label" for="passwordConfirm">RETYPE PASSWORD</label>
                    <input class="input-block-input" type="password" id="passwordConfirm">
                </div>
                <p class="help-block password_edit"></p>
                <div class="input-block edit-data">
                    <label class="label input-block-label" for="email-addresEdit">EMAIL ADDRESS</label>
                    <input value="${this.email}" class="input-block-input" data-rule-modify="email" type="email" id="email-addresEdit">
                </div>  
                <div class="input-block edit-data">
                    <span class="edit_gender">GENDER</span>
                    <div class="gender__block">
                        <label class="label input-block-label" for="man">MAN</label>
                        <input class="input_checkbox man" value="man" type="checkbox" id="man">
                        <label class="label input-block-label" for="woman">WOMAN</label>
                        <input class="input_checkbox woman" value="woman" type="checkbox" id="woman">
                    </div>
                </div>  
                <div class="input-block edit-data">
                    <label class="label input-block-label" for="credit-cartEdit">CREDIT CARD</label>
                    <input value="${this.card === undefined? '' : this.card}" class="input-block-input" data-rule-modify="card" type="text" id="credit-cartEdit">
                </div>  
                <div class="input-block edit-data">
                    <label class="label input-block-label"  for="bioEdit">BIO</label>
                    <textarea class="input-block-input textarea" data-rule-modify="bio" id="bioEdit">${this.bio === undefined? '' : this.bio}</textarea>
                </div>    
                <div class="btn_save">
                   <a href="#" class="btn btn_save">SAVE</a>
            </div>
        </form>  `;
    }
    checkGender() {
        if (this.gender !== null) {
            document.getElementById(`${this.gender}`).checked = true;
        }
    }
}


class UserData {
    constructor() {
        this.user = {};
        this.reviews = [];
        this.isAdmin = false;
    }

    fetch () {
      const userId = loginUser.getId();
      return  sendRequest(`${API_URL}/users?id=${userId}`).then((value) => {
            if (value.length > 0) {
                const data = value[0];
                this.user = new User(data.id, data.username, data.password, data.gender, data.email, data.card, data.bio, data.role);
                this.isAdmin = (data.role === 'admin');
                if (this.isAdmin) {
                    this.fetchReviews();
                }
            } else {
                document.cookie = '';
            }
        });
    }
    addReviewBlock() {
        return `<div class="nav__element reviews">Reviews</div>`
    }

    render () {
        document.querySelector('.my-data_container').innerHTML = this.user.render();
        this.user.checkGender();

        const $confirmField = document.getElementById('passwordConfirm');
        $confirmField.addEventListener('keyup', (e) => {
            const $password = document.getElementById('passwordEdit');
            if ($password.value === $confirmField.value) {
                document.querySelector('.help-block.password_edit').textContent = '';
                $password.classList.remove('invalid');
            }
        }); 
    }
    
    fetchReviews() {
        return sendRequest(`${API_URL}/reviews`).then((val) => {
           this.reviews = val.map((rev) => new Review(rev.id, rev.username, rev.comment, rev.datetime, rev.status));
           const checkNavPanel = document.querySelector('.reviews');
           if ( checkNavPanel === null) {
            document.querySelector('.nav__panel').innerHTML += this.addReviewBlock();
           }
          
        });
    }

    renderRewiews() {
        const itemsHtmls = this.reviews.map(rev => rev.render());
        document.querySelector('.my-data_container').innerHTML = itemsHtmls.join('');

        const $listReviews = document.querySelectorAll('.helper');
        for (var i = 0; i < $listReviews.length; i++) {
            const isNew = $listReviews[i].classList.contains('new');
            const id = $listReviews[i].parentElement.dataset.id;
            $listReviews[i].innerHTML = userData.addAdminButtons( id, isNew );
        }
    }
    
    addAdminButtons(id, isNew) {
        return `<div class="admin__controls" data-id="${id}">
                    ${ isNew? '<span class="admin__btn btn_primarry" data> Accept </span> ': ''}
                <span class="admin__btn btn_danger"> Delete </span>  
            </div>`
    }

    moderate(id) {
        fetch(`${API_URL}/reviews/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({ status: 'moderate' }),
        }).then(() => this.fetchReviews().then(() => this.renderRewiews()) );
    }

    deleteReview(id) {
        fetch(`${API_URL}/reviews/${id}`, {
             method: 'DELETE'
        }).then(() => { 
            this.reviews = this.reviews.filter((e) => +e.id !== +id);
            this.renderRewiews();
        });
    }
}
const userData = new UserData();

window.addEventListener('load', (e)=> {
    loginUser.login(LOGIN_MODE_AUTO).then((res) => {
        if (Object.keys(res).length) {
            userData.fetch().then(() => userData.render());
        } else {
            window.location.href = `${API_URL}/index.html`;
        }
    });
});

const $myData = document.querySelector('.my-data_container');
$myData.addEventListener('click', (e) => {
    if (e.target.classList.contains('input_checkbox')) {
        if (e.target.classList.contains('man')) {
            document.getElementById('woman').checked = false;
        } else {
            document.getElementById('man').checked = false;
        }
    } else if (e.target.classList.contains('admin__btn')) {
        const target = e.target;
        const id = target.parentElement.dataset.id;
        if (target.classList.contains('btn_primarry')) {
            userData.moderate(id);
        } else {
            userData.deleteReview(id);
        }   
    } else if (e.target.classList.contains('btn_save')) {
        doValidate();
    } 
});


function doValidate() {
    const validation = {
        'username': /\w/,
        'password': /\w/,
        'email': /^[a-zA-Zа-яА-Я0-9]+?.[a-zA-Zа-яА-Я0-9]+\@[a-zA-Zа-яА-Я0-9]+\.[a-zA-Zа-яА-Я]{2,3}$/,
        'card': /\d{13,19}/,
        'bio': /[a-zA-Zа-яА-Я0-9]+/,
    };

    const required = [
        'username', 'email'
    ];

    let hasErors = false;
    const updatedUser = { id: userData.user.id };

    Object.keys(validation).forEach(rule => {
        const fields = document.querySelectorAll('[data-rule-modify="'+rule+'"]');
        fields.forEach( field => {
            if (rule === 'password' && field.value.trim() !== '') {
                const confirm = document.getElementById('passwordConfirm');
                if(field.value !== confirm.value) {
                    hasErors = true;
                    field.classList.add('invalid');
                    document.querySelector('.help-block.password_edit').textContent = 'passwords not mutch';
                } else {
                    updatedUser.password = field.value; 
                }

            } else {
                if (required.includes(rule)) {
                    if (validation[rule].test(field.value) ) {
                        field.classList.remove('invalid');
                    } else  {
                        hasErors = true;
                        field.classList.add('invalid');
                    }
                } else {
                    if (field.value.trim() !== '') {
                        if (validation[rule].test(field.value) ) {
                            field.classList.remove('invalid');
                        } else  {
                            hasErors = true;
                            field.classList.add('invalid');
                        } 
                    }
                }   
            } 
        });
    });
    const $creditCartInput = document.getElementById('credit-cartRegister');
    $creditCartInput.addEventListener('keyup', e => {
        e.target.value = e.target.value.replace(/\D/g, "");
    });
    
    if (!hasErors) {
        saveChanges(updatedUser);
    }
}

function saveChanges(updatedUser) {
    const $textinputs = document.querySelectorAll('input[type=checkbox]');
    updatedUser.username = document.getElementById('usernameEdit').value;
    document.cookie = `username=${updatedUser.username}`;
    const password = document.getElementById('passwordEdit').value;

    if (password.trim() !== '' && password !== null && password !== userData.user.password) {
        updatedUser.password = password;
        document.cookie = `password=${password}`;
    }

    updatedUser.email = document.getElementById('email-addresEdit').value;
    updatedUser.card = document.getElementById('credit-cartEdit').value;
    updatedUser.bio = document.getElementById('bioEdit').value.trim();

    [].filter.call($textinputs, (e) => {
        if (e.checked) {
            updatedUser.gender = e.value;
        }
    });

    fetch(`${API_URL}/users/${updatedUser.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({...updatedUser }),
        
    });
   showHelpModal('All Chenges Saved');
}


const $navPanel = document.querySelector('.nav__panel');
$navPanel.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav__element')) {
        document.querySelector('.nav__element.active').classList.toggle('active');
        e.target.classList.toggle('active');

        if (e.target.classList.contains('reviews')) {
            userData.renderRewiews();
        } else if (e.target.classList.contains('presonal')) {
            userData.render();
        }
    }
});