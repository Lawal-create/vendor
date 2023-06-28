begin;

create or replace function on_update_timestamp()
  returns trigger as $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
$$ language 'plpgsql';

create table if not exists vendor(
    id uuid primary key default gen_random_uuid(),
    name text not null
);

create table if not exists product(
    id uuid primary key default gen_random_uuid(),
    name text not null,
    vendor_id uuid not null,
    foreign key (vendor_id) references vendor on delete cascade
);


create table if not exists form(
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null,
    user_name text not null,
    vendor_id uuid not null,
    first_user_note text not null,
    second_user_note text,
    first_user_id  text not null,
    second_user_id text,
    has_good_taste boolean,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    foreign key (vendor_id) references vendor on delete cascade,
    foreign key (product_id) references product on delete cascade
);

commit;