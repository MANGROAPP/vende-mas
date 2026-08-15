-- ============================================================
-- Cockpit Comercial MANGRO — esquema completo (Postgres / Supabase)
-- Ejecutar en el SQL Editor de tu proyecto Supabase.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- USUARIOS Y ROLES ----------
-- Se apoya en supabase auth.users; esta tabla extiende con rol y vendedor asociado.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null check (role in ('admin','vendedor','supervisor')),
  seller_id uuid,
  status text not null default 'activo',
  created_at timestamptz not null default now()
);

create table if not exists public.sellers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  code text unique not null,
  name text not null,
  supervisor_id uuid references public.users(id),
  status text not null default 'activo'
);

alter table public.users
  add constraint users_seller_fk foreign key (seller_id) references public.sellers(id);

-- ---------- ZONAS ----------
create table if not exists public.zones (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  description text,
  status text not null default 'activa'
);

-- ---------- LINEAS ----------
create table if not exists public.lines (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  status text not null default 'activa'
);

insert into public.lines (code, name) values
  ('nestle', 'Nestlé'), ('golosinas', 'Golosinas'), ('colgate', 'Colgate'),
  ('dkasa', 'DKasa'), ('philip_morris', 'Philip Morris')
on conflict (code) do nothing;

-- ---------- CLIENTES ----------
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  business_name text not null,
  trade_name text,
  ruc text,
  phone text,
  email text,
  fiscal_address text,
  seller_id uuid not null references public.sellers(id),
  status text not null default 'activo',
  observations text,
  created_at timestamptz not null default now()
);

-- ---------- SUCURSALES ----------
create table if not exists public.branches (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  zone_id uuid not null references public.zones(id),
  code text not null,
  name text not null,
  address text,
  reference text,
  phone text,
  contact text,
  status text not null default 'activa',
  opening_date date,
  closing_date date,
  observations text
);

-- ---------- PERIODOS Y CUOTAS ----------
create table if not exists public.periods (
  id uuid primary key default uuid_generate_v4(),
  year int not null,
  month int not null check (month between 1 and 12),
  start_date date not null,
  end_date date not null,
  business_days int not null,
  unique (year, month)
);

-- Las cuotas las gestiona el propio vendedor (además del admin): en esta app,
-- separada del sistema corporativo, es el vendedor quien recibe su meta
-- mensual y necesita registrarla para medir su avance.
create table if not exists public.quotas (
  id uuid primary key default uuid_generate_v4(),
  period_id uuid not null references public.periods(id),
  seller_id uuid not null references public.sellers(id),
  line_id uuid not null references public.lines(id),
  amount numeric(12,2) not null default 0,
  unique (period_id, seller_id, line_id)
);

-- ---------- CORRELATIVOS ----------
create table if not exists public.correlative_counters (
  type text not null check (type in ('V','R')),
  year int not null,
  last_number int not null default 0,
  primary key (type, year)
);

create or replace function public.next_correlative(p_type text, p_year int)
returns text
language plpgsql
as $$
declare
  v_number int;
begin
  insert into public.correlative_counters(type, year, last_number)
  values (p_type, p_year, 1)
  on conflict (type, year) do update set last_number = correlative_counters.last_number + 1
  returning last_number into v_number;

  return p_type || '-' || p_year || '-' || lpad(v_number::text, 6, '0');
end;
$$;

-- ---------- VENTAS ----------
create table if not exists public.sales (
  id uuid primary key default uuid_generate_v4(),
  correlative text unique not null,
  sale_date date not null,
  client_id uuid not null references public.clients(id),
  branch_id uuid not null references public.branches(id),
  zone_id_snapshot uuid not null references public.zones(id),
  seller_id uuid not null references public.sellers(id),
  period_id uuid references public.periods(id),
  status text not null default 'registrada'
    check (status in ('borrador','registrada','confirmada','entregada_parcial','entregada','con_rechazo','anulada','cerrada')),
  gross_total numeric(12,2) not null default 0,
  cancel_reason text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sale_details (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  line_id uuid not null references public.lines(id),
  amount numeric(12,2) not null default 0,
  -- reservado para fase de productos:
  product_id uuid,
  qty_ordered numeric,
  qty_delivered numeric,
  unit_price numeric
);

-- Trigger: al insertar/actualizar detalle, recalcular gross_total y asignar correlativo/zona
create or replace function public.trg_sales_before_insert()
returns trigger language plpgsql as $$
declare
  v_zone uuid;
begin
  if new.correlative is null then
    new.correlative := public.next_correlative('V', extract(year from new.sale_date)::int);
  end if;
  select zone_id into v_zone from public.branches where id = new.branch_id;
  new.zone_id_snapshot := v_zone;
  return new;
end;
$$;

drop trigger if exists sales_before_insert on public.sales;
create trigger sales_before_insert before insert on public.sales
for each row execute function public.trg_sales_before_insert();

-- ---------- MOTIVOS DE RECHAZO ----------
create table if not exists public.rejection_reasons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  active boolean not null default true
);

insert into public.rejection_reasons (code, name) values
  ('no_solicitado','Producto no solicitado'),
  ('equivocado','Producto equivocado'),
  ('deteriorado','Producto deteriorado'),
  ('vencido','Producto vencido'),
  ('sin_stock','Falta de stock'),
  ('cliente_rechazo','Cliente rechazó producto'),
  ('dif_precio','Diferencia de precio'),
  ('error_pedido','Error de pedido'),
  ('error_despacho','Error de despacho'),
  ('cliente_cerrado','Cliente cerrado'),
  ('duplicado','Pedido duplicado'),
  ('otro','Otro')
on conflict (code) do nothing;

-- ---------- RECHAZOS ----------
create table if not exists public.rejections (
  id uuid primary key default uuid_generate_v4(),
  correlative text unique not null,
  sale_id uuid not null references public.sales(id),
  rejection_date date not null,
  total_amount numeric(12,2) not null default 0,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.rejection_details (
  id uuid primary key default uuid_generate_v4(),
  rejection_id uuid not null references public.rejections(id) on delete cascade,
  line_id uuid not null references public.lines(id),
  reason_id uuid not null references public.rejection_reasons(id),
  amount numeric(12,2) not null default 0,
  observation text
);

-- Validación: el total de rechazos de una venta nunca puede superar la venta original
create or replace function public.trg_rejections_validate()
returns trigger language plpgsql as $$
declare
  v_gross numeric;
  v_already_rejected numeric;
begin
  select gross_total into v_gross from public.sales where id = new.sale_id;
  select coalesce(sum(total_amount),0) into v_already_rejected
    from public.rejections where sale_id = new.sale_id and id <> new.id;

  if new.correlative is null then
    new.correlative := public.next_correlative('R', extract(year from new.rejection_date)::int);
  end if;

  if (v_already_rejected + new.total_amount) > v_gross then
    raise exception 'El importe del rechazo supera el saldo disponible de la venta.';
  end if;

  return new;
end;
$$;

drop trigger if exists rejections_before_insert on public.rejections;
create trigger rejections_before_insert before insert on public.rejections
for each row execute function public.trg_rejections_validate();

-- Actualiza el estado de la venta tras cada rechazo
create or replace function public.trg_rejections_after_insert()
returns trigger language plpgsql as $$
declare
  v_gross numeric;
  v_total_rejected numeric;
begin
  select gross_total into v_gross from public.sales where id = new.sale_id;
  select coalesce(sum(total_amount),0) into v_total_rejected from public.rejections where sale_id = new.sale_id;

  update public.sales
    set status = case when v_total_rejected >= v_gross then 'cerrada' else 'con_rechazo' end,
        updated_at = now()
    where id = new.sale_id;
  return new;
end;
$$;

drop trigger if exists rejections_after_insert on public.rejections;
create trigger rejections_after_insert after insert on public.rejections
for each row execute function public.trg_rejections_after_insert();

-- ---------- VISITAS (futuro / geolocalización) ----------
create table if not exists public.visits (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.sellers(id),
  client_id uuid references public.clients(id),
  branch_id uuid references public.branches(id),
  visit_date date not null default current_date,
  notes text
);

-- ---------- AUDITORÍA ----------
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  table_name text not null,
  record_id uuid,
  action text not null check (action in ('insert','update','anulacion')),
  user_id uuid references public.users(id),
  old_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.clients enable row level security;
alter table public.branches enable row level security;
alter table public.sales enable row level security;
alter table public.sale_details enable row level security;
alter table public.rejections enable row level security;
alter table public.rejection_details enable row level security;
alter table public.quotas enable row level security;
alter table public.audit_logs enable row level security;

-- Helper: rol y seller_id del usuario autenticado
create or replace function public.current_role_is_admin() returns boolean language sql stable as $$
  select exists(select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

create or replace function public.current_seller_id() returns uuid language sql stable as $$
  select seller_id from public.users where id = auth.uid();
$$;

-- Clientes: el vendedor solo ve/edita los suyos; el admin ve todo
create policy clients_select on public.clients for select
  using (current_role_is_admin() or seller_id = current_seller_id());
create policy clients_modify on public.clients for insert with check
  (current_role_is_admin() or seller_id = current_seller_id());
create policy clients_update on public.clients for update using
  (current_role_is_admin() or seller_id = current_seller_id());

-- Ventas: idem, filtradas por seller_id
create policy sales_select on public.sales for select
  using (current_role_is_admin() or seller_id = current_seller_id());
create policy sales_modify on public.sales for insert with check
  (current_role_is_admin() or seller_id = current_seller_id());
create policy sales_update on public.sales for update using
  (current_role_is_admin() or seller_id = current_seller_id());

-- Cuotas: el vendedor puede GESTIONAR (ver y editar) su propia cuota —
-- corrección de negocio: esta app es independiente del sistema corporativo,
-- así que el propio vendedor registra la meta mensual que se le indicó.
create policy quotas_select on public.quotas for select
  using (current_role_is_admin() or seller_id = current_seller_id());
create policy quotas_insert on public.quotas for insert with check
  (current_role_is_admin() or seller_id = current_seller_id());
create policy quotas_update on public.quotas for update using
  (current_role_is_admin() or seller_id = current_seller_id());

-- Auditoría: solo lectura, y solo admin (el vendedor no ve el log de auditoría)
create policy audit_select_admin_only on public.audit_logs for select
  using (current_role_is_admin());

-- Nota sobre reportes (import/export): no requieren una tabla ni policy
-- propia — corrección de negocio: tanto vendedor como admin exportan/importan
-- lo que ya pueden leer/escribir según las policies de arriba (sus propios
-- clientes y ventas). No hay restricción adicional de rol para esa acción.
