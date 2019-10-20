DROP DATABASE IF EXISTS brand_shop;
CREATE DATABASE brand_shop;
USE brand_shop;

/*
 Создание базовой таблици пользователей, при регистрации заполняется в первую очередь она
*/
DROP TABLE IF EXISTS users;
CREATE TABLE users (
	id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
    email varchar(128) unique NOT null comment 'Почта пользователя',
    `password` varchar(256) NOT NULL COMMENT 'Пароль',
    is_deleted boolean default false comment 'Флаг активности записи',
    create_date timestamp default now() comment 'Дата создания записи',
	modify_date timestamp default now() comment 'Дата изменения записи',
    INDEX user_email(email)
) comment 'Пользователи интернет магазина';

INSERT INTO users (email, `password`) VALUES 
( 'test@mail.test', '11111' ),
( 'test1@mail.test', '55555' ),
( 'test2@mail.test', '44444' ),
( 'test3@mail.test', '33333' );

CREATE TRIGGER on_users_update before UPDATE
ON users FOR EACH ROW 
set NEW.modify_date = now();

update users u set u.email = 'updated@mail.upd' WHERE id = 1; 
Select * from users;

/*
	Таблица дополнительной информации о пользователях
*/
DROP TABLE IF EXISTS users_profiles;
CREATE TABLE users_profiles (
	id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
    user_id BIGINT UNSIGNED not null unique comment 'Сязь с таблицей пользователей',
	first_name varchar(128) NOT null comment 'Имя',
    second_name varchar(128) comment 'Отчество',
    last_name varchar(128) Not null comment 'Фамилия',
    bio text COMMENT 'О себе',
    phone varchar(12) not null comment 'Телефон',
    
    create_date timestamp default now() comment 'Дата создания записи',
	modify_date timestamp default now() comment 'Дата изменения записи',
	create_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который создал запись',
	modify_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который отредактировал запись',

	INDEX user_id_inx(user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
    	ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (create_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (modify_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict
        
) comment 'Профили пользователей';

/* 
	Группы для пользователей, чтоб было проще раздавать привелегии для них
*/
DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups` (
	id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
    `name` varchar(256) comment '',
	is_deleted boolean default false comment 'Флаг активности записи',
    create_date timestamp default now() comment 'Дата создания записи',
	modify_date timestamp default now() comment 'Дата изменения записи',
	create_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который создал запись',
	modify_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который отредактировал запись',
	INDEX `group_name`(`name`),
	FOREIGN KEY (create_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (modify_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict

) comment 'Список всех групп';

/* 
	Действия ( если нужно будет группам отдельно накидывать права)
*/
DROP TABLE IF EXISTS actions;
CREATE TABLE actions (
	id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
    action_name varchar(256) not null unique comment 'Название действия',
    is_deleted boolean default false comment 'Флаг активности записи',
	INDEX `action_name_inx`(`action_name`)
) comment 'Таблица действий';

/* 
	Действия которые доступны группам
*/
DROP TABLE IF EXISTS group_actions;
CREATE TABLE group_actions (
	group_id bigint unsigned not null unique comment 'Указатель на группу',
    action_id bigint unsigned not null unique comment 'Указатель на действие',

	INDEX `group_id_inx`(`group_id`),
    INDEX `action_id_inx`(`action_id`),
    FOREIGN KEY (group_id) REFERENCES `groups`(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (action_id) REFERENCES `actions`(id)
		ON UPDATE CASCADE ON DELETE restrict
) comment 'Таблица связки действий и групп';

/* 
	Связь пользователя с определенной группой
*/
DROP TABLE IF EXISTS users_groups;
CREATE TABLE users_groups (
    user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя',
    group_id BIGINT UNSIGNED not null unique comment 'Указатель на группу пользователя',
    
	INDEX `user_id_inx`(`user_id`),
    INDEX `group_id_inx`(`group_id`),
    FOREIGN KEY (user_id) REFERENCES users(id)
    	ON UPDATE CASCADE ON DELETE restrict,
	 FOREIGN KEY (group_id) REFERENCES `groups`(id)
    	ON UPDATE CASCADE ON DELETE restrict
) comment 'Таблица связки групп и пользователей';

/*
  История авторизаций пользователя, нужна будет для сбора статистики
*/
DROP TABLE IF EXISTS login_history;
CREATE TABLE login_history (
    user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя',
    login_time timestamp default now() comment 'Время последней авторизациина сайте',
    ip_address varchar(256) comment 'IP адресс пользователя с которой производитась авторизация',
    browser varchar(50) comment 'Браузер пользователя с которого он был авторизован',
    
	INDEX `user_id_inx`(`user_id`),
    INDEX `ip_address_inx`(`ip_address`),
	INDEX `browser_inx`(`browser`),

    FOREIGN KEY (user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict
) comment 'История авторизаций';

/* Далее таблици которые используются непосредственно в работе магазина */

/*
   Категории товаров
*/
DROP TABLE IF EXISTS products_categories;
CREATE TABLE products_categories (
	 id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
     category_name varchar(256) not null unique comment 'Название категории товаров',
     is_deleted boolean default false comment 'Флаг активности записи',
    
     create_date timestamp default now() comment 'Дата создания записи',
     modify_date timestamp default now() comment 'Дата изменения записи',
     create_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который создал запись',
     modify_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который отредактировал запись',
    
	INDEX `category_name_inx`(`category_name`),
	FOREIGN KEY (create_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (modify_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict
) comment 'Категории товаров';

/* Таблица товаров магазина */
DROP TABLE IF EXISTS products;
CREATE TABLE products (
	 id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
     category_id bigint unsigned unique comment 'указание на категорию товаров',
     `name` boolean default false comment 'Название товара',
     is_deleted bool DEFAULT false comment 'Флаг активности записи', 
 
	 create_date timestamp default now() comment 'Дата создания записи',
     modify_date timestamp default now() comment 'Дата изменения записи',
     create_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который создал запись',
     modify_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который отредактировал запись',
    
	INDEX `category_id_inx`(`category_id`),
	FOREIGN KEY (category_id) REFERENCES products_categories(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (create_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (modify_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict
) comment 'Категории товаров';

/** справочник размеров */
DROP TABLE IF EXISTS sizes;
CREATE TABLE sizes (
	 id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
     name varchar(256) comment 'Название размера',
     is_deleted bool DEFAULT false comment 'Флаг активности записи', 
     
     create_date timestamp default now() comment 'Дата создания записи',
     modify_date timestamp default now() comment 'Дата изменения записи',
     create_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который создал запись',
     modify_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который отредактировал запись',
    
	FOREIGN KEY (create_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (modify_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict
) comment 'Справочник размеров';

/** справочник цветов */
DROP TABLE IF EXISTS colors;
CREATE TABLE colors (
     id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
     name varchar(256) comment 'Название цвета',
	 is_deleted bool DEFAULT false comment 'Флаг активности записи', 

     create_date timestamp default now() comment 'Дата создания записи',
     modify_date timestamp default now() comment 'Дата изменения записи',
     create_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который создал запись',
     modify_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который отредактировал запись',
    
	FOREIGN KEY (create_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (modify_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict
) comment 'Справочник цветов';

/** справочник брендов\производителей */
DROP TABLE IF EXISTS brands;
CREATE TABLE brands (
     id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
     name varchar(256) comment 'Название Бренда\производитель',
     logo varchar(256) comment 'Ссылка на файл с логотипом',
	 is_deleted bool DEFAULT false comment 'Флаг активности записи', 

     create_date timestamp default now() comment 'Дата создания записи',
     modify_date timestamp default now() comment 'Дата изменения записи',
     create_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который создал запись',
     modify_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который отредактировал запись',
    
	FOREIGN KEY (create_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (modify_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict
) comment 'Справочник брендов\производителей';


/** справочник возварастных групп */
DROP TABLE IF EXISTS age_groups;
CREATE TABLE age_groups (
     id SERIAL PRIMARY KEY COMMENT 'Первичный ключь',
     name varchar(256) comment 'Название возврастной группы',
     min_age int unsigned not null comment 'Минимальный возвраст',
     max_age int unsigned comment 'Максимальный возвраст',
	 is_deleted bool DEFAULT false comment 'Флаг активности записи', 

     create_date timestamp default now() comment 'Дата создания записи',
     modify_date timestamp default now() comment 'Дата изменения записи',
     create_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который создал запись',
     modify_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который отредактировал запись',
    
	FOREIGN KEY (create_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (modify_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict
) comment 'Справочник возварастных групп';

/* таблица хранит в себе все о товаре, */
DROP TABLE IF EXISTS product_details;
CREATE TABLE product_details (
     product_id bigint unsigned unique not null comment 'указание на категорию товаров',
     size_id bigint unsigned unique not null comment 'указатель на размер',
     color_id bigint unsigned unique not null comment 'указатель на цвет',
	 brand_id bigint unsigned unique not null comment 'указатель на бренд производитель',
     age_group_id bigint unsigned unique not null comment 'указатель на возврастную группу',
          sex ENUM('man', 'woman') not null comment 'Пол',
	 `desc` varchar(256) comment 'описание товара',
	 price bigint unsigned comment 'Цена товара', 
     
     create_date timestamp default now() comment 'Дата создания записи',
     modify_date timestamp default now() comment 'Дата изменения записи',
     create_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который создал запись',
     modify_user_id BIGINT UNSIGNED not null unique comment 'Указатель на пользователя который отредактировал запись',
     
	INDEX `sex_inx`(`sex`),
	INDEX `product_id_inx`(`product_id`),
	INDEX `size_id_inx`(`size_id`),
	INDEX `color_id_inx`(`color_id`),
    INDEX `brand_id_inx`(`brand_id`),
	INDEX `age_group_id_inx`(`age_group_id`),
	FOREIGN KEY (product_id) REFERENCES products(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (size_id) REFERENCES sizes(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (color_id) REFERENCES colors(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (brand_id) REFERENCES brands(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (age_group_id) REFERENCES age_groups(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (create_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict,
	FOREIGN KEY (modify_user_id) REFERENCES users(id)
		ON UPDATE CASCADE ON DELETE restrict
) comment 'Таблица полной информации о товаре';

