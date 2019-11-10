use brand_shop;
/** просто добавление новых записей, чтог после их удалить */
insert into order_statuses (alias, name) values
	('testStatus', 'test1'),
	('testStatus', 'test2');
/** удаляем только выставляя признак */    
update order_statuses 
	set is_deleted = 1
    WHERE alias = 'testStatus';

/** скприп получения заказов пользователей */
SELECT 
	o.id, o.order_no, o.status_id,
    c.user_id,
    p.name AS product,
    ( select pc.category_name from products_categories pc where pc.id = p.category_id ) AS category,
    
    o.create_date
 FROM orders o 
	JOIN cart c on c.id = o.cart_id 
    JOIN cart_products cp on cp.cart_id = c.id
    JOIN products p ON p.id = cp.product_id
WHERE o.status_id in (
	select s.id from order_statuses s WHERE s.is_deleted = 0
);

/** имитация добавление товара в корзину и в заказ( данная задача будет вынесена в процедуру, так как она будет частой, а входные параметры будут как для юзера так и для товара ) */    
START transaction;
	insert into users (email, password)
		VALUES ('test@test.tt', 'tttttt');
	insert into cart (user_id, products_count, price) VALUES ( (select last_insert_id()), 4, 500 );
    SELECT @cart_id := last_insert_id();
    insert into cart_products (cart_id, product_id, product_price) 
    values	( @cart_id, 1, 100 ), ( @cart_id, 2, 100 ), ( @cart_id, 4, 100 ),( @cart_id, 6, 100 );
    
	insert into orders (order_no, status_id, cart_id ) values ('18279434',1, @cart_id );
commit;
update users set is_deleted = 1 WHERE email LIKE '%test@test.tt%';

/** если пользователь удален, удаляем и его заказы и выставляем им статус отмененные */
START transaction;
update orders o
	set o.is_deleted = 1,
		o.status_id = ( select id from order_statuses where alias = 'declined' )
WHERE o.cart_id IN (
	SELECT c.id from cart c
    join users u on u.id = c.user_id WHERE u.is_deleted = 1
);
commit;

/** просмотр груп пользователя */
select * from `groups` g
JOIN users_groups ug on ug.group_id = g.id WHERE ug.user_id = 1;

select * from products p
JOIN product_details pd ON pd.product_id = p.id 
WHERE pd.color_id IN (
	SELECT id from colors WHERE is_deleted = 0 AND name like '%re%'
);

