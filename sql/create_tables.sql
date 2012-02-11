--begin business
create table tb_business
(
    business     integer        not null auto_increment,
    name         varchar( 256 ) not null,
    neighborhood varchar( 256 ),
    address      varchar( 256 ),
    city         varchar( 256 ),
    state        varchar( 256 ),
    zip_code     varchar( 256 ),
    latitude     double,
    longitude    double,
    phone        varchar( 256 ),
    url          varchar( 256 ),
    yelp_url     varchar( 256 ),
    timestamp    timestamp,
    primary key( business )
) ENGINE = InnoDB;
--end business

--begin deal
create table tb_deal
(
    deal             integer        not null auto_increment,
    url              varchar( 256 ) not null,
    image_url        varchar( 256 ),
    business         integer        not null,
    expiration       date,
    percent_discount double,
    max_discount     double,
    one_per          varchar( 256 ),
    claimed          integer,
    city             varchar( 256 ) not null,
    fine_print       text,
    timestamp        timestamp,
    primary key( deal ),
    constraint fk_business foreign key ( business ) references tb_business( business ) on delete cascade
) ENGINE = InnoDB;
--end deal
